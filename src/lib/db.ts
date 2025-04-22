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
  role: 'writer' | 'admin';
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
  role: 'writer' | 'admin';
  created_at: string;
  expires_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  username: string;
  created_at: string;
  updated_at: string;
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

// Rely on RLS policy "Allow read for members and owner" to filter lists
export const getLists = async (): Promise<List[]> => {
  try {
    // Removed owner_uuid parameter and validation
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      // Removed .eq('owner_uuid', owner_uuid);

    if (error) {
      // Handle potential RLS errors if the user is not logged in
      if (error.code === '42501') { // RLS policy violation
        console.warn('RLS violation fetching lists, likely user not authenticated or no access.');
        return []; // Return empty array if user has no access or isn't logged in
      }
      throw error;
    }
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

// Function to delete a list (ensure RLS allows only owner)
export const deleteList = async (list_id: string): Promise<boolean> => {
  try {
    if (!list_id) {
      throw new Error('List ID is required to delete a list');
    }
    // The RLS policy 'lists_delete_owner' should restrict this operation to the owner.
    // Supabase handles cascade deletes for related tables if set up in DB schema.
    // If not using DB cascades, you'd need to delete related items/users/invites manually first.
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', list_id);

    if (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Exception in deleteList:', error);
    throw error instanceof Error ? error : new Error('Failed to delete list');
  }
};

// List Users CRUD
export const inviteUserToList = async (
  list_id: string,
  user_id: string,
  role: 'writer' | 'admin' = 'writer'
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
    
    console.log('[getListUsers] Fetched users for list:', list_id, data, error);

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
  role: 'writer' | 'admin' = 'writer',
  expiresIn: number = 10
): Promise<InviteCode> => {
  try {
    if (!list_id) {
      throw new Error('List ID is required to generate an invite code');
    }

    // Generate a random code
    const code = Math.random().toString(36).substring(2, 10);
    
    // Calculate expiration date (default: 10 days)
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
    
    // Ensure the fetched role is valid according to our new types
    if (inviteData.role !== 'writer' && inviteData.role !== 'admin') {
        throw new Error('Invalid role specified in invite code.');
    }
    
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
      if (listUserError.code === '23505') { 
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
    
    // Delete the invite code after successful use
    await supabase
      .from('invite_codes')
      .delete()
      .eq('code', code);
    
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
      return null; 
    }
    const { data, error } = await supabase
      .from('list_users')
      .select('role')
      .eq('list_id', list_id)
      .eq('user_id', user_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
         return null;
      }
      throw error;
    }
    // Validate the fetched role before returning
    if (data?.role === 'writer' || data?.role === 'admin') {
       return data.role;
    }
    return null; // Return null if role is not writer or admin
  } catch (error) {
    console.error('Error fetching list user role:', error);
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
  // Type check/clamp stars just in case? Or rely on DB/UI validation.
  const validStars = Math.max(0, Math.min(5, Math.round(stars))); // Ensure 0-5

  try {
    if (!list_id || !creator_id || !title) {
      throw new Error('List ID, Creator ID, and Title are required to create an item');
    }

    console.log(`Attempting to insert item with creator_id: ${creator_id}`);

    const { data, error } = await supabase
      .from('items')
      .insert({
        list_id,
        creator_id,
        title,
        stars: validStars,
        notes,
        done: false
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error inserting item:', error);
      throw error;
    }
    
    console.log('Successfully inserted item:', data);
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

    // Validate/clamp stars if present in updates
    const validatedUpdates = { ...updates };
    if (validatedUpdates.stars !== undefined && validatedUpdates.stars !== null) {
      validatedUpdates.stars = Math.max(0, Math.min(5, Math.round(validatedUpdates.stars)));
    }

    const { data, error } = await supabase
      .from('items')
      .update(validatedUpdates) // Use validated updates
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

// New function to update list details (e.g., name)
// Ensure RLS allows only admin/owner to update
export const updateList = async (listId: string, updates: Partial<Pick<List, 'name'>>) => {
  try {
    if (!listId) {
      throw new Error('List ID is required to update a list');
    }
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }

    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single();

    if (error) {
      console.error('Error updating list:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Exception in updateList:', error);
    throw error instanceof Error ? error : new Error('Failed to update list');
  }
};

// New function to remove a user from a list
// Ensure RLS allows only admin/owner to remove users
export const removeUserFromList = async (listId: string, userId: string): Promise<boolean> => {
  try {
    if (!listId || !userId) {
      throw new Error('List ID and User ID are required to remove a user');
    }
    
    // Check if the user being removed is the owner - prevent owner removal (optional, depends on desired logic)
    // You might want to handle ownership transfer instead.
    // For now, we assume RLS prevents critical errors, but an explicit check could be added.
    
    const { error } = await supabase
      .from('list_users')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing user from list:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Exception in removeUserFromList:', error);
    throw error instanceof Error ? error : new Error('Failed to remove user from list');
  }
};

// Helper function to get user emails by IDs
export const getUserProfiles = async (userIds: string[]): Promise<Record<string, string>> => {
  try {
    if (!userIds || userIds.length === 0) {
      return {}; // Return empty object if no IDs provided
    }

    // Create a lookup map of user IDs to emails
    const profilesMap: Record<string, string> = {};
    
    // Current user's email - this we know for sure
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      profilesMap[user.id] = user.email || '';
    }
    
    // Try to get usernames from user_profiles table
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('user_id, username')
      .in('user_id', userIds);
      
    if (error) {
      console.error('Error fetching user profiles:', error);
    } else {
      // Add usernames to the profilesMap
      profiles?.forEach(profile => {
        if (profile.user_id && profile.username) {
          profilesMap[profile.user_id] = profile.username;
        }
      });
    }
    
    return profilesMap;
  } catch (error) {
    console.error('Exception in getUserProfiles:', error);
    return {}; // Return empty object on failure
  }
};

// User Profile functions
export const createUserProfile = async (username: string): Promise<UserProfile> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (existingProfile) {
      // If profile exists, update it
      return updateUserProfile(username);
    }
    
    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        username,
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in createUserProfile:', error);
    throw error instanceof Error ? error : new Error('Failed to create user profile');
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No results found
        return null;
      }
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getUserProfile:', error);
    return null;
  }
};

export const updateUserProfile = async (username: string): Promise<UserProfile> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (!username || username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        username,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateUserProfile:', error);
    throw error instanceof Error ? error : new Error('Failed to update user profile');
  }
};

// Function to clean up expired invite codes
export const cleanupExpiredInviteCodes = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('invite_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('Error cleaning up expired invite codes:', error);
    } else {
      console.log('Successfully cleaned up expired invite codes');
    }
  } catch (error) {
    console.error('Error in cleanupExpiredInviteCodes:', error);
  }
};
