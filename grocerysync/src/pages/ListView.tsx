import React from 'react';
import { useParams } from 'react-router-dom';

const ListView: React.FC = () => {
  const { id } = useParams();
  return <div className='p-4'>List View for list ID: {id}</div>;
};

export default ListView;
