import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useSupabase } from '../hooks/useSupabase';

const Header: React.FC = () => {
  const { user } = useSupabase();
  return (
    <header className='bg-background text-white p-4 flex items-center'>
      <div className='flex items-center'>
        <FiShoppingCart size={24} className='mr-2' />
        <h1 className='text-xl'>
          <span className='font-bold'>Grocery</span><span className='font-normal mr-4'>Sync</span>
        </h1>
        {user?.email && <span className='text-sm opacity-80'>{user.email}</span>}
      </div>
    </header>
  );
};

export default Header;
