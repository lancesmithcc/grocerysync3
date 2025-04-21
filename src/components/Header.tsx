import React from 'react';
import { BsCart } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { IoSettingsOutline } from 'react-icons/io5';
import { useSupabase } from '../hooks/useSupabase';

const Header: React.FC<{ showEmail?: boolean }> = ({ showEmail = false }) => {
  const { user } = useSupabase();

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      
      <h1 className='text-3xl mb-3 text-center'>
      <BsCart size={42} className='text-white mb-5' /> <span className='font-bold'>Grocery</span><span className='font-light'>Sync</span>
      </h1>
      
      {showEmail && user?.email && (
        <div className='flex items-center bg-black/30 py-1.5 px-4 rounded-full border border-[#3CAAFF]/30 mb-10 text-sm font-light gap-2'>
          <span>{user.email}</span>
          <Link 
            to="/account" 
            className="text-gray-400 hover:text-white transition-colors" 
            title="Account Settings"
          >
            <IoSettingsOutline size={18} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Header;
