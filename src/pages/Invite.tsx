import React from 'react';
import { useParams } from 'react-router-dom';

const Invite: React.FC = () => {
  const { code } = useParams();
  return <div className='p-4'>Invite acceptance for code: {code}</div>;
};

export default Invite;
