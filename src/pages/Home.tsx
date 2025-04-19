import React, { useState, useEffect } from 'react';
import AuroraBox from '../components/AuroraBox';
import { useSupabase } from '../hooks/useSupabase';
import type { List } from '../lib/db';
import { getLists, createList } from '../lib/db';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Home: React.FC = () => {
  const { user, signInWithMagicLink, signOut } = useSupabase();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    if (user) getLists(user.id).then(setLists).catch(console.error);
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signInWithMagicLink(email);
    if (error) setMessage(error.message);
    else setMessage('Check your email for the login link!');
  };

  const handleCreateList = async () => {
    if (!user) return;
    const name = prompt('New list name');
    if (!name) return;
    
    try {
      console.log('Creating list with user ID:', user.id);
      const userId = user.id;
      
      if (!userId) {
        console.error('User ID is undefined or null');
        alert('Error: User ID is missing. Please sign out and sign in again.');
        return;
      }
      
      const loadingMessage = `Creating list "${name}"...`;
      setMessage(loadingMessage);
      
      const newList = await createList(name, userId);
      setLists(prev => [...prev, newList]);
      console.log('List created successfully:', newList);
      
      setMessage('');
      
      getLists(userId).then(setLists).catch(console.error);
      
    } catch (error) {
      console.error('Error creating list:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      setMessage(`Failed to create list: ${errorMessage}`);
      
      if (user?.id) {
        getLists(user.id).then(setLists).catch(console.error);
      }
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
            />
            <button
              type="submit"
              className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white py-4 px-6 rounded-aurora w-full font-bold"
            >
              Send Magic Link
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
        <div className="space-x-4">
          <button
            onClick={handleCreateList}
            className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white py-2 px-5 rounded-aurora font-bold flex items-center"
          >
            <span className="mr-1">+</span> New List
          </button>
          <button onClick={signOut} className="text-red-400 hover:text-red-300 transition-colors underline font-light">
            Sign Out
          </button>
        </div>
      </div>
      {lists.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed border-[#3CAAFF]/30 rounded-aurora bg-black">
          <p className="mb-6 font-light">You don't have any grocery lists yet</p>
          <button
            onClick={handleCreateList}
            className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white py-3 px-6 rounded-aurora font-bold"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {lists.map(list => (
            <AuroraBox key={list.id} className="cursor-pointer hover:scale-[1.02] transition-transform">
              <Link to={`/list/${list.id}`} className="block text-white text-lg font-bold">
                {list.name}
              </Link>
            </AuroraBox>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
