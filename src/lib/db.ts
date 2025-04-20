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

export type InviteCode = {
  id: string;
  list_id: string;
  code: string;
  role: 'member' | 'writer' | 'admin';
  created_at: string;
  expires_at: string;
};

// Lists CRUD
export async function createList(name: string, userId: string) {
  try {
    if (!name || !userId) {
      throw new Error('Name and userId are required to create a list');
    }

    console.log('Starting list creation with:', { name, userId });

    // First insert into lists
    const { data, error } = await supabase
      .from('lists')
      .insert({ name, owner_uuid: userId })
      .select()
      .single();

    if (error) {
      console.error('Error inserting into lists:', error);
      throw error;
    }
    
    console.log('Successfully created list:', data);

    // Now add the user to list_users
    try {
      const { error: listUserError } = await supabase
        .from('list_users')
        .insert({ list_id: data.id, user_id: userId, role: 'admin' });

      if (listUserError) {
        console.error('Error inserting into list_users:', listUserError);
        throw listUserError;
      }
      
      console.log('Successfully added user to list_users');
    } catch (listUserErr) {
      console.error('Exception in list_users insert:', listUserErr);
      // Even if this fails, return the list data
      return data;
    }

    return data;
  } catch (error) {
    console.error('Error in createList:', error);
    throw error instanceof Error ? error : new Error('Failed to create list');
  }
}

export const getLists = async (owner_uuid: string): Promise<List[]> => {
  try {
    if (!owner_uuid) {
      throw new Error('Owner ID is required to fetch lists');
    }

    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('owner_uuid', owner_uuid);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getLists:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch lists');
  }
};

export const getList = async (id: string): Promise<List> => {
  try {
    if (!id) {
      throw new Error('List ID is required to fetch a list');
    }

    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in getList:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch list');
  }
};

// List Users CRUD
export const inviteUserToList = async (
  list_id: string,
  user_id: string,
  role: 'member' | 'writer' | 'admin' = 'member'
): Promise<ListUser> => {
  try {
    if (!list_id || !user_id) {
      throw new Error('List ID and User ID are required to invite a user');
    }

    const { data, error } = await supabase
      .from('list_users')
      .insert([{ list_id, user_id, role }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in inviteUserToList:', error);
    throw error instanceof Error ? error : new Error('Failed to invite user to list');
  }
};

export const getListUsers = async (list_id: string): Promise<ListUser[]> => {
  try {
    if (!list_id) {
      throw new Error('List ID is required to fetch list users');
    }

    const { data, error } = await supabase
      .from('list_users')
      .select('*')
      .eq('list_id', list_id);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getListUsers:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch list users');
  }
};

// Invites CRUD
export const generateInviteCode = async (
  list_id: string, 
  role: 'member' | 'writer' = 'member',
  expiresIn: number = 7
): Promise<InviteCode> => {
  try {
    if (!list_id) {
      throw new Error('List ID is required to generate an invite code');
    }

    // Generate a random code
    const code = Math.random().toString(36).substring(2, 10);
    
    // Calculate expiration date (default: 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    const { data, error } = await supabase
      .from('invite_codes')
      .insert([{ list_id, code, role, expires_at: expiresAt.toISOString() }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in generateInviteCode:', error);
    throw error instanceof Error ? error : new Error('Failed to generate invite code');
  }
};

export const acceptInvite = async (code: string, user_id: string): Promise<ListUser> => {
  try {
    if (!code || !user_id) {
      throw new Error('Invite code and user ID are required to accept an invite');
    }

    // First, find the invite code and check if it's valid
    const { data: inviteData, error: inviteError } = await supabase
      .from('invite_codes')
      .select('*, role')
      .eq('code', code)
      .single();
    
    if (inviteError || !inviteData) throw new Error('Invalid invite code');
    
    // Check if the invite is expired
    const now = new Date();
    const expiresAt = new Date(inviteData.expires_at);
    if (now > expiresAt) {
      throw new Error('Invite code has expired');
    }
    
    // Add the user to the list_users table using the role from the invite
    const { data: listUserData, error: listUserError } = await supabase
      .from('list_users')
      .insert([{ list_id: inviteData.list_id, user_id, role: inviteData.role }])
      .select('*')
      .single();
    
    if (listUserError) {
      // Check if it's a duplicate (user already in the list)
      if (listUserError.code === '23505') { // Postgres unique constraint violation
        // Optionally, fetch the existing membership instead of throwing an error
         const { data: existingMembership, error: fetchError } = await supabase
          .from('list_users')
          .select('*')
          .eq('list_id', inviteData.list_id)
          .eq('user_id', user_id)
          .single();
        if (existingMembership && !fetchError) return existingMembership;
        throw new Error('You are already a member of this list.');
      }
      throw listUserError;
    }
    
    // Optionally: Delete the invite code after successful use
    // await supabase.from('invite_codes').delete().eq('id', inviteData.id);

    return listUserData;
  } catch (error) {
    console.error('Error in acceptInvite:', error);
    throw error instanceof Error ? error : new Error('Failed to accept invite');
  }
};

// Function to get user's role for a specific list
export const getListUserRole = async (list_id: string, user_id: string): Promise<ListUser['role'] | null> => {
  try {
    if (!list_id || !user_id) {
      // Return null or throw error if IDs are missing
      return null; 
    }
    const { data, error } = await supabase
      .from('list_users')
      .select('role')
      .eq('list_id', list_id)
      .eq('user_id', user_id)
      .single();

    if (error) {
      // If user not found in list_users for this list, they don't have a role
      if (error.code === 'PGRST116') { // PostgREST error for "No rows found"
         return null;
      }
      throw error;
    }
    return data?.role ?? null;
  } catch (error) {
    console.error('Error fetching list user role:', error);
    // Return null on error to handle cases where role cannot be determined
    return null; 
  }
};

// Items CRUD
export const createItem = async (
  list_id: string,
  creator_id: string,
  title: string,
  stars: number = 0,
  notes: string = ''
): Promise<Item> => {
  try {
    if (!list_id || !creator_id || !title) {
      throw new Error('List ID, Creator ID, and Title are required to create an item');
    }

    const { data, error } = await supabase
      .from('items')
      .insert([{ list_id, creator_id, title, stars, notes }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in createItem:', error);
    throw error instanceof Error ? error : new Error('Failed to create item');
  }
};

export const getItems = async (list_id: string): Promise<Item[]> => {
  try {
    if (!list_id) {
      throw new Error('List ID is required to fetch items');
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', list_id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getItems:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch items');
  }
};

export const updateItem = async (
  id: string,
  updates: Partial<Pick<Item, 'title' | 'stars' | 'notes' | 'done'>>
): Promise<Item> => {
  try {
    if (!id || Object.keys(updates).length === 0) {
      throw new Error('Item ID and at least one update field are required');
    }

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in updateItem:', error);
    throw error instanceof Error ? error : new Error('Failed to update item');
  }
};

export const deleteItem = async (id: string): Promise<boolean> => {
  try {
    if (!id) {
      throw new Error('Item ID is required to delete an item');
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in deleteItem:', error);
    throw error instanceof Error ? error : new Error('Failed to delete item');
  }
};
