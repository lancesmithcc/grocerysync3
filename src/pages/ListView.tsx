import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuroraBox from '../components/AuroraBox';
import { useSupabase } from '../hooks/useSupabase';
import type { Item } from '../lib/db';
import { getItems, createItem, updateItem, deleteItem } from '../lib/db';

const ListView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSupabase();
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [stars, setStars] = useState(0);

  useEffect(() => {
    if (id) {
      getItems(id).then(setItems).catch(console.error);
    }
  }, [id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    const newItem = await createItem(id, user.id, title, stars, notes);
    setItems(prev => [newItem, ...prev]);
    setTitle('');
    setNotes('');
    setStars(0);
  };

  const handleToggleDone = async (item: Item) => {
    const updated = await updateItem(item.id, { done: !item.done });
    setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
  };

  const handleDelete = async (itemId: string) => {
    await deleteItem(itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  return (
    <div className="p-4 space-y-4">
      <Link to="/" className="text-sm text-blue-300">&larr; Back to Lists</Link>
      <h2 className="text-2xl">Items</h2>
      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          placeholder="Item title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="aurora-border-pulse p-2 rounded-aurora w-full"
          required
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="aurora-border-pulse p-2 rounded-aurora w-full"
        />
        <input
          type="number"
          placeholder="Stars (0-3)"
          value={stars}
          onChange={e => setStars(Number(e.target.value))}
          min={0}
          max={3}
          className="aurora-border-pulse p-2 rounded-aurora w-full"
        />
        <button type="submit" className="bg-purple text-white py-2 px-4 rounded-aurora">
          + Add Item
        </button>
      </form>
      <div className="space-y-2">
        {items.map(item => (
          <AuroraBox key={item.id} className="flex justify-between items-center">
            <div>
              <p className={item.done ? 'line-through text-gray-400' : ''}>{item.title}</p>
              {item.notes && <p className="text-sm text-gray-300">{item.notes}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <span>{'⭐'.repeat(item.stars)}</span>
              <input type="checkbox" checked={item.done} onChange={() => handleToggleDone(item)} />
              <button onClick={() => handleDelete(item.id)} className="text-red-500">Delete</button>
            </div>
          </AuroraBox>
        ))}
      </div>
    </div>
  );
};

export default ListView;
