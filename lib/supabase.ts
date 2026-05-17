import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export type Listing = {
  id: string
  user_id: string
  title: string
  price: number | null
  location: string | null
  type: 'Sotuv' | 'Ijara'
  area: number | null
  rooms: number | null
  image_url: string | null
  description?: string | null
  status: 'active' | 'draft' | 'sold'
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// Helper Functions
export const listingHelpers = {
  async getActive() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Listing[]
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Listing[]
  },

  async create(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('listings')
      .insert([listing])
      .select()
    if (error) throw error
    return data?.[0] as Listing
  },

  async update(id: string, updates: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data?.[0] as Listing
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

export const messageHelpers = {
  async getConversation(userId1: string, userId2: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as Message[]
  },

  async send(senderId: string, receiverId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: senderId, receiver_id: receiverId, content }])
      .select()
    if (error) throw error
    return data?.[0] as Message
  },

  async markAsRead(messageIds: string[]) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
    if (error) throw error
  }
}

export const profileHelpers = {
  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Profile
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Profile
  }
}

export const authHelpers = {
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
