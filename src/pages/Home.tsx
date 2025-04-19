import React, { useState, useEffect } from 'react';
import AuroraBox from '../components/AuroraBox';
import { useSupabase } from '../hooks/useSupabase';
import type { List } from '../lib/db';
import { getLists, createList } from '../lib/db';
import { Link } from 'react-router-dom';

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
    const newList = await createList(name, user.id);
    setLists(prev => [...prev, newList]);
  };

  if (!user) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="mb-4 text-2xl">Sign in to GrocerySync</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="aurora-border-pulse p-2 w-full rounded-aurora"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-purple text-white py-2 px-4 rounded-aurora"
          >
            Send Magic Link
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-gray-300">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Your Lists</h2>
        <div className="space-x-2">
          <button
            onClick={handleCreateList}
            className="bg-purple text-white py-1 px-3 rounded-aurora"
          >
            + New List
          </button>
          <button onClick={signOut} className="text-red-500">
            Sign Out
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lists.map(list => (
          <AuroraBox key={list.id} className="cursor-pointer">
            <Link to={`/list/${list.id}`} className="block text-white text-lg">
              {list.name}
            </Link>
          </AuroraBox>
        ))}
      </div>
    </div>
  );
};

export default Home;
