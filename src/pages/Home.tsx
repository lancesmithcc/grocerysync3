import React, { useState, useEffect } from 'react';
import AuroraBox from '../components/AuroraBox';
import { useSupabase } from '../hooks/useSupabase';
import type { List } from '../lib/db';
import { getLists, createList, deleteList } from '../lib/db';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { IoAddCircleOutline, IoTrashOutline, IoMailOutline, IoLogOutOutline } from 'react-icons/io5';

const Home: React.FC = () => {
  const { user, signInWithMagicLink, signOut } = useSupabase();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLists = () => {
    if (user) {
      setLoading(true);
      getLists(user.id)
        .then(setLists)
        .catch(err => {
          console.error('Error fetching lists:', err);
          setMessage('Could not load your lists.');
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchLists();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Sending magic link...');
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage('Check your email for the login link!');
  };

  const handleCreateList = async () => {
    if (!user) return;
    const name = prompt('New list name:');
    if (!name || name.trim() === '') return;
    
    setLoading(true);
    setMessage(`Creating list "${name}"...`);
    try {
      const userId = user.id;
      if (!userId) throw new Error('User ID missing');
      
      const newList = await createList(name, userId);
      console.log('List created successfully:', newList);
      setMessage('');
      fetchLists();
      
    } catch (error) {
      console.error('Error creating list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Failed to create list: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to permanently delete the list "${listName}"? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setMessage(`Deleting list "${listName}"...`);
    try {
      await deleteList(listId);
      console.log(`List ${listId} deleted successfully.`);
      setMessage('');
      fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Failed to delete list: ${errorMessage}`);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <div className="flex flex-col items-center justify-center">
          <Header />
          <h2 className="text-4xl font-bold mb-12">Sign in to GrocerySync</h2>
          <form onSubmit={handleLogin} className="w-full max-w-md flex flex-col items-center space-y-6">
            <input
              type="email"
              className="focus-aurora p-4 w-full rounded-aurora bg-black/60 text-white border border-white/20 placeholder-white/50"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white py-3 px-6 rounded-aurora w-full font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <IoMailOutline /> {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
          {message && <p className="mt-6 text-sm text-center text-[#3CAAFF] font-light">{message}</p>}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-8">
      <Header showEmail={true} />
      <div className="flex justify-between items-center mb-8 border-b border-[#3CAAFF]/30 pb-4">
        <h2 className="text-2xl font-bold text-white">Your <span className="text-[#3CAAFF]">Lists</span></h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCreateList}
            className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white py-2 px-4 rounded-aurora font-bold flex items-center disabled:opacity-50 gap-1"
            disabled={loading}
          >
            <IoAddCircleOutline className="text-lg"/> New List
          </button>
          <button 
            onClick={signOut} 
            className="text-red-400 hover:text-red-300 transition-colors font-light flex items-center gap-1 p-2 rounded-aurora hover:bg-red-900/20"
            title="Sign Out"
            >
            <IoLogOutOutline /> Sign Out
          </button>
        </div>
      </div>
      
      {message && (
         <p className="my-4 text-sm text-center text-[#3CAAFF] font-light bg-black/30 p-2 rounded-aurora">
          {message}
         </p>
      )}

      {loading && !message && (
         <p className="my-4 text-sm text-center text-gray-400 font-light bg-black/30 p-2 rounded-aurora">
          Loading lists...
         </p>
      )}

      {!loading && lists.length === 0 && !message && (
        <div className="text-center py-16 text-gray-400 border border-dashed border-[#3CAAFF]/30 rounded-aurora bg-black/50">
          <p className="mb-6 font-light">You don't have any grocery lists yet</p>
          <button
            onClick={handleCreateList}
            className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white py-3 px-6 rounded-aurora font-bold"
            disabled={loading}
          >
            Create Your First List
          </button>
        </div>
      )}
      
      {!loading && lists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {lists.map(list => (
            <AuroraBox 
              key={list.id} 
              className="group relative cursor-pointer hover:scale-[1.02] transition-transform p-4 flex justify-between items-center"
            >
              <Link 
                to={`/list/${list.id}`} 
                className="block text-white text-lg font-bold hover:text-[#3CAAFF] transition-colors flex-grow mr-2"
              >
                {list.name}
              </Link>
              {user && list.owner_uuid === user.id && (
                <button
                  onClick={(e) => {
                     e.stopPropagation();
                     e.preventDefault();
                     handleDeleteList(list.id, list.name);
                  }}
                  className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl p-1 rounded-aurora leading-none hover:bg-red-900/30"
                  title="Delete List"
                  disabled={loading}
                >
                  <IoTrashOutline />
                </button>
              )}
            </AuroraBox>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
