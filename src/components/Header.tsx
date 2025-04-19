import React from 'react';
import { BsCart } from 'react-icons/bs';

const Header: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <BsCart size={42} className='text-white mb-5' />
      <h1 className='text-5xl mb-16 text-center'>
        <span className='font-bold'>Grocery</span><span className='font-light'>Sync</span>
      </h1>
    </div>
  );
};

export default Header;
