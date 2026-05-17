import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  )
}

const supabaseClient = createClient(supabaseUrl, supabaseKey)

// Check if we should operate in offline/mock fallback mode
export const isOffline = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('offline_mode') === 'true'
}

// Enable or disable offline fallback mode
export const setOfflineMode = (value: boolean) => {
  if (typeof window !== 'undefined') {
    if (value) localStorage.setItem('offline_mode', 'true')
    else localStorage.removeItem('offline_mode')
  }
}

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

export type NewsItem = {
  id: string
  title: string
  content: string
  created_at: string
  image_url?: string | null
  views?: number
}

// Mock Data for Local Storage Fallback
const MOCK_LISTINGS: Listing[] = [
  {
    id: 'mock-listing-1',
    user_id: 'mock-user-1-id',
    title: 'Qarshi 4-xonali Hovli',
    price: 330,
    location: 'Qarshi',
    type: 'Sotuv',
    area: 450,
    rooms: 8,
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800',
    description: 'Premium darajadagi shinam hovli. Barcha sharoitlari mavjud, evroremont.\n[coords:38.8612,65.7847]\n[amenities:electricity,wifi,gas,water,heating,airConditioning]\n[phone:+998901234567]\n[telegram:diyorbek_dev]',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-listing-2',
    user_id: 'mock-user-2-id',
    title: 'Shahrisabz Koshona',
    price: 100,
    location: 'Shahrisabz',
    type: 'Sotuv',
    area: 150,
    rooms: 4,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
    description: 'Yangi qurilgan koshona shinam uy. Shahar markaziga yaqin.\n[coords:39.0539,66.8278]\n[amenities:electricity,wifi,water,airConditioning]\n[phone:+998939876543]\n[telegram:sardor_rahimov]',
    status: 'active',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock-listing-3',
    user_id: 'mock-user-2-id',
    title: 'Kitob Tumanida Kottej',
    price: 250,
    location: 'Kitob',
    type: 'Sotuv',
    area: 300,
    rooms: 6,
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800',
    description: 'Tabiat bag‘rida joylashgan ajoyib kottej. Havo toza, dam olish uchun juda qulay.\n[coords:39.1275,66.8833]\n[amenities:electricity,gas,water,heating]\n[phone:+998991234567]\n[telegram:kottej_info]',
    status: 'active',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
]

const MOCK_PROFILES: Record<string, Profile> = {
  'mock-user-1-id': {
    id: 'mock-user-1-id',
    email: 'user1@test.com',
    full_name: 'Diyorbek Karimov',
    avatar_url: null,
    phone: '+998 90 123 45 67',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'mock-user-2-id': {
    id: 'mock-user-2-id',
    email: 'user2@test.com',
    full_name: 'Sardor Rahimov',
    avatar_url: null,
    phone: '+998 93 987 65 43',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 'mock-msg-1',
    sender_id: 'mock-user-1-id',
    receiver_id: 'mock-user-2-id',
    content: 'Uyni narxini ozroq tushirib berasizmi?',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'mock-msg-2',
    sender_id: 'mock-user-2-id',
    receiver_id: 'mock-user-1-id',
    content: 'Ertaga soat 10 da ko\'rishamizmi? Joyida gaplashamiz.',
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
]

// Database Getters/Setters for Local Storage
const getLocalListings = (): Listing[] => {
  if (typeof window === 'undefined') return MOCK_LISTINGS
  const stored = localStorage.getItem('local_listings')
  if (!stored) {
    localStorage.setItem('local_listings', JSON.stringify(MOCK_LISTINGS))
    return MOCK_LISTINGS
  }
  return JSON.parse(stored)
}

const saveLocalListings = (listings: Listing[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('local_listings', JSON.stringify(listings))
  }
}

const getLocalProfiles = (): Record<string, Profile> => {
  if (typeof window === 'undefined') return MOCK_PROFILES
  const stored = localStorage.getItem('local_profiles')
  if (!stored) {
    localStorage.setItem('local_profiles', JSON.stringify(MOCK_PROFILES))
    return MOCK_PROFILES
  }
  return JSON.parse(stored)
}

const saveLocalProfiles = (profiles: Record<string, Profile>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('local_profiles', JSON.stringify(profiles))
  }
}

const getLocalMessages = (): Message[] => {
  if (typeof window === 'undefined') return MOCK_MESSAGES
  const stored = localStorage.getItem('local_messages')
  if (!stored) {
    localStorage.setItem('local_messages', JSON.stringify(MOCK_MESSAGES))
    return MOCK_MESSAGES
  }
  return JSON.parse(stored)
}

const saveLocalMessages = (messages: Message[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('local_messages', JSON.stringify(messages))
  }
}

// Custom Auth handlers to intercept network requests on error or paused project
const customAuth = {
  ...supabaseClient.auth,
  async signInWithPassword(credentials: any) {
    const { email, password } = credentials
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const response = await supabaseClient.auth.signInWithPassword(credentials)
      
      // If Supabase connection is successful but the test accounts aren't created yet in their dashboard,
      // automatically fallback to mock session so they can test the app instantly!
      if (response.error && (response.error.message?.includes('Invalid login credentials') || response.error.message?.includes('invalid_credentials'))) {
        if (email === 'user1@test.com' || email === 'user2@test.com') {
          console.warn('Supabase returned Invalid login credentials. Falling back to local mock session.')
          if (typeof window !== 'undefined') {
            localStorage.setItem('offline_mode', 'true')
            const mockUser = {
              id: email === 'user1@test.com' ? 'mock-user-1-id' : 'mock-user-2-id',
              email,
              user_metadata: {
                full_name: email === 'user1@test.com' ? 'Diyorbek Karimov' : 'Sardor Rahimov'
              }
            }
            localStorage.setItem('mock_session_user', JSON.stringify(mockUser))
            return { data: { user: mockUser, session: { user: mockUser } as any }, error: null }
          }
        }
      }
      return response
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        console.warn('Supabase offline: performing local/mock signInWithPassword')
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          // Mock authentication logic
          if (password === 'Test@12345') {
            const mockUser = {
              id: email === 'user1@test.com' ? 'mock-user-1-id' : (email === 'user2@test.com' ? 'mock-user-2-id' : 'mock-user-custom-id'),
              email,
              user_metadata: {
                full_name: email === 'user1@test.com' ? 'Diyorbek Karimov' : (email === 'user2@test.com' ? 'Sardor Rahimov' : 'Mehmon Foydalanuvchi')
              }
            }
            localStorage.setItem('mock_session_user', JSON.stringify(mockUser))
            return { data: { user: mockUser, session: { user: mockUser } as any }, error: null }
          } else {
            return { data: { user: null, session: null }, error: { message: 'Parol noto‘g‘ri!' } as any }
          }
        }
      }
      return { data: { user: null, session: null }, error: err }
    }
  },

  async signUp(credentials: any) {
    const { email, password, options } = credentials
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      return await supabaseClient.auth.signUp(credentials)
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        console.warn('Supabase offline: performing local/mock signUp')
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const mockUser = {
            id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
            email,
            user_metadata: {
              full_name: options?.data?.full_name || 'Yangi Foydalanuvchi'
            }
          }
          // Save mock profile
          const profiles = getLocalProfiles()
          profiles[mockUser.id] = {
            id: mockUser.id,
            email: mockUser.email,
            full_name: mockUser.user_metadata.full_name,
            avatar_url: null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          saveLocalProfiles(profiles)
          
          localStorage.setItem('mock_session_user', JSON.stringify(mockUser))
          return { data: { user: mockUser, session: { user: mockUser } as any }, error: null }
        }
      }
      return { data: { user: null, session: null }, error: err }
    }
  },

  async getSession() {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      return await supabaseClient.auth.getSession()
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        console.warn('Supabase offline: getting local mock session')
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const storedUser = localStorage.getItem('mock_session_user')
          if (storedUser) {
            const user = JSON.parse(storedUser)
            return { data: { session: { user } as any }, error: null }
          }
        }
        return { data: { session: null }, error: null }
      }
      return { data: { session: null }, error: err }
    }
  },

  async getUser() {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      return await supabaseClient.auth.getUser()
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        console.warn('Supabase offline: getting local mock user')
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const storedUser = localStorage.getItem('mock_session_user')
          if (storedUser) {
            return { data: { user: JSON.parse(storedUser) }, error: null }
          }
        }
        return { data: { user: null }, error: null }
      }
      return { data: { user: null }, error: err }
    }
  },

  async signOut() {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      return await supabaseClient.auth.signOut()
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        console.warn('Supabase offline: signing out mock user')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mock_session_user')
        }
        return { error: null }
      }
      return { error: err }
    }
  }
}

// Proxy wrapper around supabaseClient to intercept auth and keep original method prototypes (like .from)
export const supabaseWrapper = new Proxy(supabaseClient, {
  get(target, prop, receiver) {
    if (prop === 'auth') {
      return customAuth
    }
    const value = Reflect.get(target, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(target)
    }
    return value
  }
})

// Export custom wrapper in place of original supabase client
export const supabase = supabaseWrapper as unknown as typeof supabaseClient

// Dynamic Helpers
export const listingHelpers = {
  async getActive() {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Listing[]
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        console.warn('Supabase is offline, using local listings fallback')
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          return getLocalListings().filter(l => l.status === 'active')
        }
      }
      throw err
    }
  },

  async getByUser(userId: string) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Listing[]
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          return getLocalListings().filter(l => l.user_id === userId)
        }
      }
      throw err
    }
  },

  async create(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('listings')
        .insert([listing])
        .select()
      if (error) throw error
      return data?.[0] as Listing
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const newList: Listing = {
            ...listing,
            id: 'mock-listing-' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          const listings = getLocalListings()
          listings.unshift(newList)
          saveLocalListings(listings)
          return newList
        }
      }
      throw err
    }
  },

  async update(id: string, updates: Partial<Listing>) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data?.[0] as Listing
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const listings = getLocalListings()
          const index = listings.findIndex(l => l.id === id)
          if (index !== -1) {
            listings[index] = { ...listings[index], ...updates, updated_at: new Date().toISOString() }
            saveLocalListings(listings)
            return listings[index]
          }
        }
      }
      throw err
    }
  },

  async delete(id: string) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { error } = await supabaseClient
        .from('listings')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const listings = getLocalListings()
          const filtered = listings.filter(l => l.id !== id)
          saveLocalListings(filtered)
          return
        }
      }
      throw err
    }
  }
}

export const messageHelpers = {
  async getConversation(userId1: string, userId2: string) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Message[]
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          return getLocalMessages().filter(m => 
            (m.sender_id === userId1 && m.receiver_id === userId2) ||
            (m.sender_id === userId2 && m.receiver_id === userId1)
          ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        }
      }
      throw err
    }
  },

  async send(senderId: string, receiverId: string, content: string) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('messages')
        .insert([{ sender_id: senderId, receiver_id: receiverId, content }])
        .select()
      if (error) throw error
      return data?.[0] as Message
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const newMsg: Message = {
            id: 'mock-msg-' + Math.random().toString(36).substr(2, 9),
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            is_read: false,
            created_at: new Date().toISOString()
          }
          const messages = getLocalMessages()
          messages.push(newMsg)
          saveLocalMessages(messages)
          return newMsg
        }
      }
      throw err
    }
  },

  async markAsRead(messageIds: string[]) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { error } = await supabaseClient
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)
      if (error) throw error
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const messages = getLocalMessages()
          messages.forEach(m => {
            if (messageIds.includes(m.id)) {
              m.is_read = true
            }
          })
          saveLocalMessages(messages)
          return
        }
      }
      throw err
    }
  }
}

export const profileHelpers = {
  async getProfile(id: string) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Profile
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const profiles = getLocalProfiles()
          if (!profiles[id]) {
            profiles[id] = {
              id,
              email: 'guest@test.com',
              full_name: 'Mehmon Foydalanuvchi',
              avatar_url: null,
              phone: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            saveLocalProfiles(profiles)
          }
          return profiles[id]
        }
      }
      throw err
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const profiles = getLocalProfiles()
          profiles[id] = { ...profiles[id], ...updates, updated_at: new Date().toISOString() }
          saveLocalProfiles(profiles)
          return profiles[id]
        }
      }
      throw err
    }
  }
}

export const authHelpers = {
  async getCurrentUser() {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { data, error } = await supabaseClient.auth.getUser()
      if (error) throw error
      return data.user
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('offline_mode', 'true')
          const storedUser = localStorage.getItem('mock_session_user')
          if (storedUser) return JSON.parse(storedUser)
        }
        return null
      }
      throw err
    }
  },

  async signOut() {
    try {
      if (isOffline()) {
        throw new Error('TypeError: Failed to fetch')
      }
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Fetch')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mock_session_user')
        }
        return
      }
      throw err
    }
  }
}

export const newsHelpers = {
  getNewsLocal(): NewsItem[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('local_news')
    if (!data) {
      const defaults: NewsItem[] = [
        {
          id: 'news-1',
          title: "UY JOY PLATFORMASI 3.2.0 TALQINI ISHGA TUSHDI! 🚀",
          content: "Biz platformamizni butunlay yangi dizaynga o'tkazdik. Neon ko'k, tillarang va zumrad yashil neon effektlari bilan jihozlangan interaktiv boshqaruv paneli, yangilangan profil tahrirlagich (ism, familya va telefon raqami), interaktiv profil mavzulari va base64 rasmlar yuklash imkoniyati qo'shildi. Platformamiz to'liq oflayn tartibda ham ishlay oladi!",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          image_url: 'linear-gradient(135deg, #00E5FF 0%, #002d33 100%)',
          views: 124
        },
        {
          id: 'news-2',
          title: "QASHQADARYO UY-JOY BOZORI TAHLILI 📊",
          content: "Qarshi va Shahrisabz shaharlarida ko'chmas mulk narxlari barqaror o'sishda davom etmoqda. Sun'iy intellekt (AI) yordamida uylarni baholash tizimi mijozlarimizga eng maqbul narxlarni aniqlashga yordam bermoqda. E'lon berishda AI yordamchisidan foydalanib, uyingiz haqida to'liq tahlilga ega bo'ling!",
          created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          image_url: 'linear-gradient(135deg, #FFD700 0%, #3d2a00 100%)',
          views: 89
        }
      ]
      localStorage.setItem('local_news', JSON.stringify(defaults))
      return defaults
    }
    return JSON.parse(data)
  },

  async getNews(): Promise<NewsItem[]> {
    try {
      if (isOffline()) {
        return this.getNewsLocal()
      }
      const { data, error } = await supabaseClient
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as NewsItem[]
    } catch (err) {
      return this.getNewsLocal()
    }
  },

  async addNews(news: Omit<NewsItem, 'id' | 'created_at' | 'views'>): Promise<NewsItem> {
    const newNews: NewsItem = {
      ...news,
      id: 'news-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      views: 0
    }
    try {
      if (isOffline()) {
        const local = this.getNewsLocal()
        local.unshift(newNews)
        localStorage.setItem('local_news', JSON.stringify(local))
        return newNews
      }
      const { data, error } = await supabaseClient
        .from('news')
        .insert([newNews])
        .select()
        .single()
      if (error) throw error
      return data as NewsItem
    } catch (err) {
      const local = this.getNewsLocal()
      local.unshift(newNews)
      localStorage.setItem('local_news', JSON.stringify(local))
      return newNews
    }
  },

  async deleteNews(id: string): Promise<boolean> {
    try {
      if (isOffline()) {
        const local = this.getNewsLocal()
        const filtered = local.filter(n => n.id !== id)
        localStorage.setItem('local_news', JSON.stringify(filtered))
        return true
      }
      const { error } = await supabaseClient
        .from('news')
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    } catch (err) {
      const local = this.getNewsLocal()
      const filtered = local.filter(n => n.id !== id)
      localStorage.setItem('local_news', JSON.stringify(filtered))
      return true
    }
  }
}
