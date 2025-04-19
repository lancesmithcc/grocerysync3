import React from 'react';
import { BsCart } from 'react-icons/bs';
import { useSupabase } from '../hooks/useSupabase';

const Header: React.FC<{ showEmail?: boolean }> = ({ showEmail = false }) => {
  const { user } = useSupabase();

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <BsCart size={42} className='text-white mb-5' />
      <h1 className='text-5xl mb-4 text-center'>
        <span className='font-bold'>Grocery</span><span className='font-light'>Sync</span>
      </h1>
      {showEmail && user?.email && (
        <div className='bg-black/30 py-1.5 px-4 rounded-full border border-[#3CAAFF]/30 mb-10 text-sm font-light'>
          {user.email}
        </div>
      )}
    </div>
  );
};

export default Header;
