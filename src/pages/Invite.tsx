import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { acceptInvite, getList } from '../lib/db';
import type { List } from '../lib/db';

const Invite: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useSupabase();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<List | null>(null);

  useEffect(() => {
    if (!code) {
      setError('Invalid invitation link');
      return;
    }
  }, [code]);

  const handleAcceptInvite = async () => {
    if (!user || !code) {
      setError('You must be logged in to accept this invitation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const listUser = await acceptInvite(code, user.id);
      
      // Get the list details
      const listDetails = await getList(listUser.list_id);
      setList(listDetails);
      
      // Wait for a moment to show the success message
      setTimeout(() => {
        navigate(`/list/${listUser.list_id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl mb-4">You need to sign in to accept this invitation</h2>
        <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-aurora">
          Sign In First
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl mb-4">List Invitation</h2>
      
      {list ? (
        <div className="bg-green-800/30 p-4 rounded-aurora mb-4">
          <p className="mb-2">✅ Successfully joined the list!</p>
          <p className="text-lg font-bold">{list.name}</p>
          <p className="text-sm text-gray-400">You will be redirected automatically...</p>
        </div>
      ) : (
        <>
          <p className="mb-4">You have been invited to join a grocery list</p>
          <button 
            onClick={handleAcceptInvite}
            disabled={loading}
            className="bg-[#6D5AE6] hover:bg-[#5D4AD6] text-white py-2 px-6 rounded-aurora disabled:opacity-50"
          >
            {loading ? 'Accepting...' : 'Accept Invitation'}
          </button>
        </>
      )}
      
      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      <div className="mt-8">
        <Link to="/" className="text-sm text-blue-300">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Invite;
