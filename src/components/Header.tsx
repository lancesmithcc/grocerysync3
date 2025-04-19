import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

const Header: React.FC = () => (
  <header className='bg-background text-white p-4 flex items-center justify-between'>
    <h1 className='text-xl font-semibold'>GrocerySync</h1>
    <FiShoppingCart size={24} />
  </header>
);

export default Header;
