import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuroraBox from '../components/AuroraBox';
import { useSupabase } from '../hooks/useSupabase';
import type { Item, ListUser } from '../lib/db';
import { 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem, 
  generateInviteCode, 
  getListUserRole
} from '../lib/db';
import { IoAddCircleOutline, IoTrashOutline, IoCopyOutline, IoPersonAddOutline, IoStar, IoStarOutline } from 'react-icons/io5';

// Helper component for clickable stars input
const StarInput: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button" // Prevent form submission
          onClick={() => onChange(starValue === value ? 0 : starValue)} // Click again to set to 0
          className={`text-2xl transition-colors ${starValue <= value ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}
          title={`${starValue} star${starValue > 1 ? 's' : ''}`}
        >
          {starValue <= value ? <IoStar /> : <IoStarOutline />}
        </button>
      ))}
    </div>
  );
};

const ListView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSupabase();
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [stars, setStars] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<'writer' | 'admin' | null>(null);
  const [inviteRole, setInviteRole] = useState<'writer' | 'admin'>('writer');

  useEffect(() => {
    setItems([]);
    setUserRole(null);
    console.log('List ID or User changed, fetching data...');

    if (id && user?.id) {
      console.log(`Fetching items and role for List ID: ${id}, User ID: ${user.id}`);
      getItems(id).then(setItems).catch(err => {
        console.error('Error fetching items:', err);
        setMessage('Could not load items.');
      });

      getListUserRole(id, user.id)
        .then(role => {
          console.log(`Fetched User Role for List ${id}:`, role);
          if (role) {
            setUserRole(role);
            setMessage('');
          } else {
            console.warn(`User ${user.id} not found in list_users for list ${id}. Checking if owner...`);
            setUserRole(null);
          }
        })
        .catch(err => {
          console.error('Error fetching user role:', err);
          setUserRole(null);
          setMessage('Could not determine your role for this list.');
        });
    } else if (id) {
       console.log(`Fetching items for List ID: ${id} (User not logged in)`);
      getItems(id).then(setItems).catch(console.error);
      setUserRole(null);
    } else {
       console.log('No List ID found.');
    }
  }, [id, user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !(userRole === 'writer' || userRole === 'admin')) return;
    
    // Pass the current stars state to createItem
    const newItem = await createItem(id, user.id, title, stars, notes);
    setItems(prev => [newItem, ...prev]);
    // Reset form fields
    setTitle('');
    setNotes('');
    setStars(0); 
  };

  const handleToggleDone = async (item: Item) => {
    if (!userRole) return;
    const updated = await updateItem(item.id, { done: !item.done });
    setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
  };

  const handleDelete = async (itemId: string) => {
    if (userRole !== 'admin') return;
    await deleteItem(itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleGenerateInvite = async () => {
    if (!id || userRole !== 'admin') return;
    try {
      setMessage('Generating invite code...');
      const invite = await generateInviteCode(id, inviteRole);
      setInviteCode(invite.code);
      setShowInvite(true);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to generate invite code');
    }
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setMessage('Invite link copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    }).catch(() => {
      setMessage('Failed to copy to clipboard');
    });
  };

  const handleUpdateStars = async (item: Item, newStars: number) => {
     if (!userRole || (userRole !== 'admin' && userRole !== 'writer')) return; // Only writer/admin
     const validatedStars = Math.max(0, Math.min(5, newStars));
     try {
       const updated = await updateItem(item.id, { stars: validatedStars });
       setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
     } catch (error) {
        console.error("Failed to update stars", error);
        // Optionally show user feedback
     }
  };

  const canAddItem = userRole === 'writer' || userRole === 'admin';

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-sm text-blue-300">&larr; Back to Lists</Link>
        {userRole === 'admin' && (
          <div className="flex items-center space-x-2">
            <select 
              value={inviteRole} 
              onChange={e => setInviteRole(e.target.value as 'writer' | 'admin')}
              className="text-xs bg-gray-700 text-white p-1 rounded-aurora"
            >
              <option value="writer">Invite Alpha</option>
              <option value="admin">Invite Sigma</option>
            </select>
            <button 
              onClick={handleGenerateInvite}
              className="text-sm bg-green-700 hover:bg-green-600 text-white py-1 px-3 rounded-aurora flex items-center"
              title="Generate Invite Link"
            >
              <IoPersonAddOutline className="mr-1" /> Invite
            </button>
          </div>
        )}
      </div>
      
      {message && (
        <div className="bg-blue-900/30 p-2 rounded-aurora text-center text-sm">
          {message}
        </div>
      )}
      
      {showInvite && (
        <div className="bg-green-800/30 p-4 rounded-aurora">
          <h3 className="text-lg mb-2">Invite Link Generated!</h3>
          <div className="flex items-center justify-between bg-black/50 p-2 rounded-aurora mb-2">
            <code className="text-green-300 break-all text-sm">
              {`${window.location.origin}/invite/${inviteCode}`}
            </code>
            <button 
              onClick={handleCopyInvite}
              className="ml-2 bg-blue-700 hover:bg-blue-600 text-white text-lg p-1.5 rounded-aurora leading-none"
              title="Copy Invite Link"
            >
              <IoCopyOutline />
            </button>
          </div>
          <p className="text-xs text-gray-300">Share this link to invite a <span className="font-bold">{inviteRole === 'admin' ? 'Sigma (Admin)' : 'Alpha (Writer)'}</span></p>
        </div>
      )}
      
      <h2 className="text-2xl">Items</h2>
      {canAddItem ? (
        <form onSubmit={handleAdd} className="space-y-3 p-1 flex flex-col gap-2">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Item title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="aurora-border-pulse text-black bg-white focus:bg-gray-100 transition-colors p-3 h-14 rounded-aurora w-full"
              required
            />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="aurora-border-pulse text-black bg-white focus:bg-gray-100 transition-colors p-3 rounded-aurora w-full"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
             <label className="text-sm text-gray-400">Importance:</label>
             <StarInput value={stars} onChange={setStars} />
          </div>
          <button 
            type="submit" 
            className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white font-bold py-3 px-5 rounded-aurora w-full flex items-center justify-center gap-2"
            title="Add Item"
          >
            <IoAddCircleOutline className="text-xl"/> Add Item
          </button>
        </form>
      ) : (
         <p className="text-sm text-gray-400 italic p-4 text-center bg-black/30 rounded-aurora">
          {userRole === null ? 'Login to add items.' : 'You do not have permission to add items to this list.'}
         </p>
      )}
      <div className="space-y-2">
        {items.map(item => (
          <AuroraBox key={item.id} className="flex justify-between items-center">
            <div>
              <p className={`font-bold text-lg ${item.done ? 'line-through text-gray-400' : ''} ${!canAddItem && item.done ? 'text-gray-500' : ''}`}>{item.title}</p>
              {item.notes && <p className="text-sm text-gray-300 leading-tight mt-1">{item.notes}</p>}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex" title={`${item.stars} star importance`}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                   <button 
                      key={starValue} 
                      onClick={() => handleUpdateStars(item, starValue === item.stars ? 0 : starValue)} 
                      disabled={userRole !== 'admin' && userRole !== 'writer'} // Disable if not writer/admin
                      className={`text-xl transition-colors disabled:opacity-50 ${starValue <= item.stars ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                     {starValue <= item.stars ? <IoStar /> : <IoStarOutline />}
                   </button>
                ))}
              </div>
              <input 
                type="checkbox" 
                checked={item.done} 
                onChange={() => handleToggleDone(item)} 
                className="form-checkbox h-5 w-5 text-[#6D5AE6] rounded border-gray-600 bg-gray-800 focus:ring-[#6D5AE6]"
              />
              {userRole === 'admin' && (
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="text-red-500 hover:text-red-400 hover:bg-red-900/30 transition-colors text-xl p-1 rounded-aurora leading-none"
                  title="Delete Item"
                >
                  <IoTrashOutline />
                </button>
              )}
            </div>
          </AuroraBox>
        ))}
      </div>
    </div>
  );
};

export default ListView;
