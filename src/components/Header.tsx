import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

const Header: React.FC = () => (
  <header className='bg-background text-white p-4 flex items-center'>
    <div className='flex items-center'>
      <FiShoppingCart size={24} className='mr-2' />
      <h1 className='text-xl'>
        <span className='font-bold'>Grocery</span><span className='font-normal'>Sync</span>
      </h1>
    </div>
  </header>
);

export default Header;
