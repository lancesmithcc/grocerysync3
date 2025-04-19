import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type List = {
  id: string;
  name: string;
  owner_uuid: string;
  created_at: string;
};

export type ListUser = {
  list_id: string;
  user_id: string;
  role: 'member' | 'writer' | 'admin';
  added_at: string;
};

export type Item = {
  id: string;
  list_id: string;
  creator_id: string;
  title: string;
  stars: number;
  notes: string | null;
  done: boolean;
  created_at: string;
};

// Lists CRUD
export const createList = async (name: string, owner_uuid: string): Promise<List> => {
  console.log('Creating list with params:', { name, owner_uuid });
  
  if (!owner_uuid) {
    throw new Error('owner_uuid is required');
  }
  
  const { data, error } = await supabase
    .from('lists')
    .insert([{ name, owner_uuid }])
    .select('*')
    .single();
  
  if (error) {
    console.error('Supabase error creating list:', error);
    throw error;
  }
  
  if (!data) {
    console.error('No data returned from list creation');
    throw new Error('Failed to create list: No data returned');
  }
  
  console.log('List created successfully:', data);
  return data;
};

export const getLists = async (owner_uuid: string): Promise<List[]> => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_uuid', owner_uuid);
  if (error) throw error;
  return data || [];
};

export const getList = async (id: string): Promise<List> => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// List Users CRUD
export const inviteUserToList = async (
  list_id: string,
  user_id: string,
  role: 'member' | 'writer' | 'admin' = 'member'
): Promise<ListUser> => {
  const { data, error } = await supabase
    .from('list_users')
    .insert([{ list_id, user_id, role }])
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getListUsers = async (list_id: string): Promise<ListUser[]> => {
  const { data, error } = await supabase
    .from('list_users')
    .select('*')
    .eq('list_id', list_id);
  if (error) throw error;
  return data || [];
};

// Items CRUD
export const createItem = async (
  list_id: string,
  creator_id: string,
  title: string,
  stars: number = 0,
  notes: string = ''
): Promise<Item> => {
  const { data, error } = await supabase
    .from('items')
    .insert([{ list_id, creator_id, title, stars, notes }])
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const getItems = async (list_id: string): Promise<Item[]> => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', list_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateItem = async (
  id: string,
  updates: Partial<Pick<Item, 'title' | 'stars' | 'notes' | 'done'>>
): Promise<Item> => {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const deleteItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};
