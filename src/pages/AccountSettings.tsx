import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuroraBox from '../components/AuroraBox';
import { useSupabase } from '../hooks/useSupabase';
import { getUserProfile, createUserProfile, updateUserProfile, type UserProfile } from '../lib/db';
import { IoSaveOutline, IoPersonCircleOutline } from 'react-icons/io5';

const AccountSettings: React.FC = () => {
  const { user } = useSupabase();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/');
        return;
      }
      
      setIsLoading(true);
      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        
        if (userProfile) {
          setUsername(userProfile.username);
        } else {
          // Default username to email prefix
          const emailPrefix = user.email?.split('@')[0] || '';
          setUsername(emailPrefix);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ 
          text: error instanceof Error ? error.message : 'Failed to load profile', 
          type: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setMessage(null);
    try {
      if (!username.trim() || username.trim().length < 3) {
        setMessage({ text: 'Username must be at least 3 characters', type: 'error' });
        return;
      }
      
      let updatedProfile;
      if (profile) {
        updatedProfile = await updateUserProfile(username.trim());
      } else {
        updatedProfile = await createUserProfile(username.trim());
      }
      
      setProfile(updatedProfile);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to update profile', 
        type: 'error' 
      });
    }
  };

  if (!user) {
    return null; // Handled by the useEffect's navigate
  }

  return (
    <div className="p-4 space-y-6">
      <Header showEmail={true} />
      
      <AuroraBox>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        </div>

        {message && (
          <div className={`p-2 rounded-aurora text-center text-sm mb-4 ${message.type === 'success' ? 'bg-green-800/50 text-green-200' : 'bg-red-800/50 text-red-200'}`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading your profile...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <div className="flex items-center bg-black/30 p-2 rounded-aurora">
                <input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  readOnly
                  className="bg-transparent text-gray-300 w-full focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <div className="flex items-center space-x-2">
                <div className="flex-grow flex items-center bg-white p-2 rounded-aurora">
                  <IoPersonCircleOutline className="text-gray-500 mr-2" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="bg-transparent text-black w-full focus:outline-none"
                    minLength={3}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#6D5AE6] hover:opacity-90 transition-opacity text-white p-2 rounded-aurora flex items-center"
                  title="Save Profile"
                >
                  <IoSaveOutline className="text-lg"/>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Username will be visible to other users</p>
            </div>
          </form>
        )}
      </AuroraBox>
    </div>
  );
};

export default AccountSettings; 