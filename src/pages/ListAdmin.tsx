import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuroraBox from '../components/AuroraBox';
import { useSupabase } from '../hooks/useSupabase';
import type { ListUser, List } from '../lib/db';
import {
  getList,
  updateList,
  getListUsers,
  removeUserFromList,
  generateInviteCode,
  getListUserRole,
  getUserProfiles,
} from '../lib/db';
import {
  IoSaveOutline,
  IoTrashOutline,
  IoPersonAddOutline,
  IoCopyOutline,
} from 'react-icons/io5';

interface ListUserWithEmail extends ListUser {
  email?: string;
}

const ListAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSupabase();
  const navigate = useNavigate();

  const [listDetails, setListDetails] = useState<List | null>(null);
  const [newName, setNewName] = useState('');
  const [users, setUsers] = useState<ListUserWithEmail[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<{ admin?: string; writer?: string }>({});
  const [showInvites, setShowInvites] = useState<{ admin?: boolean; writer?: boolean }>({});
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  
  // Format user ID to be more user-friendly
  const formatUserId = (userId: string): string => {
    if (!userId) return 'Unknown User';
    
    // If it's the current user, use their email
    if (user && userId === user.id) return user.email || userId;
    
    // Create a shortened user ID display
    return `User-${userId.substring(0, 6)}`;
  };
  
  const fetchData = useCallback(async () => {
    if (!id || !user) return;
    setIsLoading(true);
    setMessage(null);
    try {
      // 1. Check user role
      const role = await getListUserRole(id, user.id);
      if (role !== 'admin') {
        setIsAdmin(false);
        setMessage({ text: 'Access Denied: You do not have permission to manage this list.', type: 'error' });
        setIsLoading(false);
        return; // Optionally navigate away: navigate(`/list/${id}`);
      }
      setIsAdmin(true);

      // 2. Fetch List Details
      const details = await getList(id);
      setListDetails(details);
      setNewName(details.name);

      // 3. Fetch List Users
      const listUsers = await getListUsers(id);
      
      // 4. Fetch user emails if possible
      const userIds = listUsers.map(u => u.user_id);
      const emails = await getUserProfiles(userIds);
      setUserEmails(emails);
      
      // 5. Prepare user data for display
      const usersWithEmails = listUsers.map(u => {
        // If it's the current user, use their email
        if (user && u.user_id === user.id) {
          return { ...u, email: user.email || formatUserId(u.user_id) };
        }
        // For other users, use the formatted ID
        return { ...u, email: formatUserId(u.user_id) };
      });
      setUsers(usersWithEmails);

    } catch (error) {
      console.error('Failed to fetch list admin data:', error);
      setMessage({ text: error instanceof Error ? error.message : 'Failed to load list data.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [id, user]); // Removed navigate from dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isAdmin || !newName.trim() || newName === listDetails?.name) return;
    setMessage(null);
    try {
      const updatedList = await updateList(id, { name: newName.trim() });
      setListDetails(updatedList);
      setMessage({ text: 'List renamed successfully!', type: 'success' });
      // No need to reset newName here if we want the input to keep the new name
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to rename list.', type: 'error' });
    }
  };

  const handleRemoveUser = async (userIdToRemove: string) => {
    if (!id || !isAdmin || !user || userIdToRemove === user.id) {
      setMessage({ text: 'Cannot remove yourself.', type: 'error' });
      return; // Prevent admin from removing themselves
    }
    if (!window.confirm('Are you sure you want to remove this user from the list?')) return;
    setMessage(null);
    try {
      await removeUserFromList(id, userIdToRemove);
      setMessage({ text: 'User removed successfully!', type: 'success' });
      // Refetch users
      fetchData(); 
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to remove user.', type: 'error' });
    }
  };

  const handleGenerateInvite = async (role: 'admin' | 'writer') => {
    if (!id || !isAdmin) return;
    setMessage(null);
    try {
      const invite = await generateInviteCode(id, role);
      setInviteCodes(prev => ({ ...prev, [role]: invite.code }));
      setShowInvites(prev => ({ ...prev, [role]: true }));
      setMessage({ text: `${role === 'admin' ? 'Shopper' : 'Dependent'} invite link generated!`, type: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to generate invite code', type: 'error' });
    }
  };

  const handleCopyInvite = (role: 'admin' | 'writer') => {
    const code = inviteCodes[role];
    if (!code) return;
    const inviteUrl = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setMessage({ text: 'Invite link copied to clipboard!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }).catch(() => {
      setMessage({ text: 'Failed to copy to clipboard', type: 'error' });
    });
  };

  const shoppers = users.filter(u => u.role === 'admin');
  const dependents = users.filter(u => u.role === 'writer');

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Header showEmail={true} />
        <AuroraBox><p className="text-center text-gray-400">Loading settings...</p></AuroraBox>
      </div>
    );
  }

  if (!isAdmin && !isLoading) {
     return (
      <div className="p-4 space-y-4">
        <Header showEmail={true} />
        <AuroraBox>
          <p className="text-center text-red-500">{message?.text || 'Access Denied'}</p>
          {id && <Link to={`/list/${id}`} className="block text-center mt-4 text-sm text-blue-300">Back to List</Link>}
        </AuroraBox>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Header showEmail={true} />
      
      <AuroraBox>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">List Settings</h1>
          <Link to={`/list/${id}`} className="text-sm text-blue-300">&larr; Back to List</Link>
        </div>

        {message && (
          <div className={`p-2 rounded-aurora text-center text-sm mb-4 ${message.type === 'success' ? 'bg-green-800/50 text-green-200' : 'bg-red-800/50 text-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Rename List Section */}
        <form onSubmit={handleRename} className="mb-6">
          <label htmlFor="listName" className="block text-sm font-medium text-gray-300 mb-1">List Name</label>
          <div className="flex items-center space-x-2">
            <input
              id="listName"
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-grow aurora-border-pulse text-black bg-white focus:bg-gray-100 transition-colors p-2 rounded-aurora"
              required
            />
            <button
              type="submit"
              className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white p-2 rounded-aurora flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save Name"
              disabled={!newName.trim() || newName === listDetails?.name}
            >
              <IoSaveOutline className="text-lg"/>
            </button>
          </div>
        </form>

        {/* Shoppers Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">🛒 Shoppers</h2>
          <ul className="space-y-2 mb-3">
            {shoppers.map(shopper => (
              <li key={shopper.user_id} className="flex justify-between items-center bg-black/30 p-2 rounded-aurora">
                <span className="text-gray-300 text-sm truncate" title={shopper.user_id}>
                  {shopper.email}
                  {shopper.user_id === user?.id && <span className="text-xs text-gray-500 ml-1">(You)</span>}
                </span>
                {/* Prevent removing self */}
                {shopper.user_id !== user?.id && (
                  <button
                    onClick={() => handleRemoveUser(shopper.user_id)}
                    className="text-red-500 hover:text-red-400 text-lg p-1 rounded-aurora leading-none flex-shrink-0 ml-2"
                    title="Remove Shopper"
                  >
                    <IoTrashOutline />
                  </button>
                )}
              </li>
            ))}
            {shoppers.length === 0 && <p className="text-gray-500 text-sm italic">No shoppers added yet.</p>}
          </ul>
          <button
             onClick={() => handleGenerateInvite('admin')}
             className="text-sm bg-green-700 hover:bg-green-600 text-white py-1 px-3 rounded-aurora flex items-center w-full justify-center"
             title="Generate Shopper Invite Link"
           >
             <IoPersonAddOutline className="mr-1" /> Invite a Shopper
           </button>
           {showInvites.admin && inviteCodes.admin && (
             <div className="bg-green-800/30 p-3 rounded-aurora mt-3">
               <p className="text-xs text-gray-300 mb-1">Share this link to invite a Shopper:</p>
               <div className="flex items-center justify-between bg-black/50 p-2 rounded-aurora">
                 <code className="text-green-300 break-all text-xs">
                   {`${window.location.origin}/invite/${inviteCodes.admin}`}
                 </code>
                 <button
                   onClick={() => handleCopyInvite('admin')}
                   className="ml-2 bg-blue-700 hover:bg-blue-600 text-white text-lg p-1 rounded-aurora leading-none"
                   title="Copy Invite Link"
                 >
                   <IoCopyOutline />
                 </button>
               </div>
             </div>
           )}
        </div>

        {/* Dependents Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">🤡 Subs</h2>
          <ul className="space-y-2 mb-3">
            {dependents.map(dependent => (
              <li key={dependent.user_id} className="flex justify-between items-center bg-black/30 p-2 rounded-aurora">
                <span className="text-gray-300 text-sm truncate" title={dependent.user_id}>
                  {dependent.email}
                  {dependent.user_id === user?.id && <span className="text-xs text-gray-500 ml-1">(You)</span>}
                </span>
                <button
                  onClick={() => handleRemoveUser(dependent.user_id)}
                  className="text-red-500 hover:text-red-400 text-lg p-1 rounded-aurora leading-none flex-shrink-0 ml-2"
                  title="Remove Dependent"
                >
                  <IoTrashOutline />
                </button>
              </li>
            ))}
             {dependents.length === 0 && <p className="text-gray-500 text-sm italic">No subs added yet.</p>}
          </ul>
           <button
             onClick={() => handleGenerateInvite('writer')}
             className="text-sm bg-blue-700 hover:bg-blue-600 text-white py-1 px-3 rounded-aurora flex items-center w-full justify-center"
             title="Generate Dependent Invite Link"
           >
             <IoPersonAddOutline className="mr-1" /> Invite a Sub
           </button>
           {showInvites.writer && inviteCodes.writer && (
             <div className="bg-blue-800/30 p-3 rounded-aurora mt-3">
               <p className="text-xs text-gray-300 mb-1">Share this link to invite a Sub:</p>
               <div className="flex items-center justify-between bg-black/50 p-2 rounded-aurora">
                 <code className="text-blue-300 break-all text-xs">
                   {`${window.location.origin}/invite/${inviteCodes.writer}`}
                 </code>
                 <button
                   onClick={() => handleCopyInvite('writer')}
                   className="ml-2 bg-green-700 hover:bg-green-600 text-white text-lg p-1 rounded-aurora leading-none"
                   title="Copy Invite Link"
                 >
                   <IoCopyOutline />
                 </button>
               </div>
             </div>
           )}
        </div>

      </AuroraBox>
    </div>
  );
};

export default ListAdmin; 