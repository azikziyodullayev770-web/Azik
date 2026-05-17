'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, ChevronRight, Bell, Home, 
  MessageCircle, PlusCircle, User, Heart, ArrowLeft, Ghost, Phone, Send, Camera,
  Star, Ruler, BedDouble, Check, Info, Loader
} from 'lucide-react'
import { supabase, type Listing, listingHelpers, messageHelpers, profileHelpers, type Message, type Profile } from '@/lib/supabase'
import { SplashScreen } from '@/components/SplashScreen'
import { HouseCard } from '@/components/HouseCard'
import { AuthScreen } from '@/components/AuthScreen'

type Chat = { id: string; partnerId: string; partnerName: string; lastMsg: string; time: string; unread: number }

function AddListingView({ onBack, onPublish, userId }: { onBack: () => void; onPublish: (item: Listing) => void; userId: string }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', price: '', district: '', rooms: '', area: '', type: 'Sotuv' as const, currency: 'UZS', status: 'active' as const, image_url: '', description: '' })
  const districts = ['Qarshi', 'Shahrisabz', 'Kitob', "G'uzor", 'Kasbi', 'Muborak', 'Nishon', 'Chiroqchi', 'Yakkabog\'', 'Dehqonobod']

  const handleFinish = async () => {
    try {
      setLoading(true)
      const newListing: Omit<Listing, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        title: formData.title || 'Yangi e\'lon',
        price: parseInt(formData.price) || 0,
        location: formData.district || 'Qarshi',
        type: formData.type,
        area: parseInt(formData.area) || 100,
        rooms: parseInt(formData.rooms) || 3,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800',
        description: formData.description || 'Yangi e\'lon',
        status: formData.status
      }

      const created = await listingHelpers.create(newListing)
      onPublish(created)
      alert('E\'lon muvaffaqiyatli yuklandi!')
      onBack()
    } catch (error) {
      console.error('Error publishing listing:', error)
      alert('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] bg-black flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-3 rounded-full glass"><ArrowLeft size={20}/></button>
          <div><h2 className="text-xl font-black uppercase tracking-tight">E'lon qo'shish</h2><p className="text-[10px] font-black text-accent-blue uppercase">Qadam {step} dan 4</p></div>
        </div>
        <div className="flex gap-2 h-1 mb-6">{[1,2,3,4].map(s => <div key={s} className={`flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-accent-blue shadow-[0_0_10px_#00E5FF]' : 'bg-neutral-800'}`} />)}</div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6"><p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Tuman tanlang</p><div className="grid grid-cols-2 gap-3">{districts.map(d => <button key={d} onClick={() => setFormData({...formData, district: d})} className={`py-4 px-4 rounded-2xl glass border-2 transition-all text-xs font-bold ${formData.district === d ? 'border-accent-blue text-accent-blue bg-accent-blue/5' : 'border-white/5 text-neutral-400'}`}>{d}</button>)}</div></motion.div>}
          {step === 2 && <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4"><div className="flex gap-2"><button onClick={() => setFormData({...formData, type: 'Sotuv'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'Sotuv' ? 'bg-white text-black' : 'glass text-neutral-500'}`}>Sotuv</button><button onClick={() => setFormData({...formData, type: 'Ijara'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'Ijara' ? 'bg-white text-black' : 'glass text-neutral-500'}`}>Ijara</button></div><input type="text" placeholder="Sarlavha" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent-blue/30" /><div className="flex gap-2"><input type="number" placeholder="Narxi" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="flex-1 bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none" /><div className="glass rounded-2xl flex p-1"><button onClick={() => setFormData({...formData, currency: 'UZS'})} className={`px-3 py-2 rounded-xl text-[10px] font-bold ${formData.currency === 'UZS' ? 'bg-white text-black' : 'text-neutral-500'}`}>UZS</button><button onClick={() => setFormData({...formData, currency: 'USD'})} className={`px-3 py-2 rounded-xl text-[10px] font-bold ${formData.currency === 'USD' ? 'bg-white text-black' : 'text-neutral-500'}`}>USD</button></div></div><div className="flex gap-2"><input type="number" placeholder="Xonalar" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} className="flex-1 bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none" /><input type="number" placeholder="Maydon" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="flex-1 bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none" /></div></motion.div>}
          {step === 3 && <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6"><div className="glass p-6 rounded-3xl border-white/10"><h4 className="text-xl font-black mb-4">Rasm va batafsil</h4><input type="text" placeholder="Rasm URL manzili" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent-blue/30 mb-4" /><textarea placeholder="E'lon haqida qisqacha yozing" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full min-h-[140px] bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent-blue/30 resize-none" /></div></motion.div>}
          {step === 4 && <motion.div key="s4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8"><div className="glass p-6 rounded-3xl border-accent-gold/20 flex items-center gap-4 cursor-pointer hover:bg-accent-gold/5 transition-all"><Star size={24} className="text-accent-gold" /><div><h4 className="font-black uppercase tracking-tight">TOP E'lon</h4><p className="text-[9px] text-neutral-500">Tavsiya etiladi</p></div><ChevronRight className="ml-auto text-neutral-700" size={18}/></div><div className="grid grid-cols-2 gap-4"><button onClick={() => setFormData({...formData, status: 'active'})} className={`rounded-3xl p-6 flex flex-col items-center gap-3 transition-all ${formData.status === 'active' ? 'bg-white text-black shadow-2xl scale-105' : 'glass border-white/5 text-neutral-500'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.status === 'active' ? 'bg-black text-white' : 'bg-neutral-900'}`}><Check size={20}/></div><span className="text-[10px] font-black uppercase">Publish</span></button><button onClick={() => setFormData({...formData, status: 'draft'})} className={`rounded-3xl p-6 flex flex-col items-center gap-3 transition-all ${formData.status === 'draft' ? 'bg-white text-black shadow-2xl scale-105' : 'glass border-white/5 text-neutral-500'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.status === 'draft' ? 'bg-black text-white' : 'bg-neutral-900'}`}><Info size={20}/></div><span className="text-[10px] font-black uppercase text-center leading-tight">Qoralama</span></button></div></motion.div>}
        </AnimatePresence>
      </div>

      <div className="p-6 pb-10 flex gap-4 border-t border-white/5 bg-black">
        {step > 1 && <button onClick={() => setStep(step - 1)} disabled={loading} className="flex-1 py-5 rounded-2xl glass font-black uppercase text-[10px]">Orqaga</button>}
        <button onClick={() => step < 4 ? setStep(step + 1) : handleFinish()} disabled={loading} className={`flex-[2] py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50`}>{loading ? <Loader size={14} className="animate-spin" /> : (step === 4 ? "Tugatish" : "Keyingisi")} {!loading && <ChevronRight size={14}/>}</button>
      </div>
    </motion.div>
  )
}

function ChatDetailView({ chat, onBack, userId }: { chat: Chat; onBack: () => void; userId: string }) {
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await messageHelpers.getConversation(userId, chat.partnerId)
        setMessages(msgs)
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
  }, [chat.partnerId, userId])

  const send = async () => {
    if (!msg.trim()) return
    try {
      const newMsg = await messageHelpers.send(userId, chat.partnerId, msg)
      setMessages([...messages, newMsg])
      setMsg('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[100] bg-black flex flex-col">
      <header className="p-6 glass border-b border-white/5 flex items-center gap-4"><button onClick={onBack} className="p-3 rounded-full glass"><ArrowLeft size={20}/></button><h3 className="font-bold">{chat.partnerName}</h3></header>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">{loading ? <Loader className="animate-spin" /> : messages.map(m => <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl ${m.sender_id === userId ? 'bg-accent-blue text-black' : 'glass border-white/5'}`}>{m.content}</div></div>)}</div>
      <div className="p-6 glass flex gap-3"><input type="text" value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="flex-1 bg-neutral-900 rounded-2xl p-4 text-sm" placeholder="Xabar..." /><button onClick={send} className="p-4 bg-accent-blue text-black rounded-2xl"><Send size={20}/></button></div>
    </motion.div>
  )
}

export default function UYJOYPlatform() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [selectedHouse, setSelectedHouse] = useState<Listing | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [filtered, setFiltered] = useState<Listing[]>([])
  const [districtFilter, setDistrictFilter] = useState('Hammasi')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [chatsLoading, setChatsLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  // Fetch chats from messages table
  const loadChats = async (userId: string) => {
    setChatsLoading(true)
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
      if (error) throw error
      if (!messages || messages.length === 0) { setChats([]); return }

      const chatMap = new Map<string, Chat>()
      for (const msg of messages) {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        if (!chatMap.has(partnerId)) {
          let partnerName = 'Foydalanuvchi'
          try {
            const p = await profileHelpers.getProfile(partnerId)
            partnerName = p.full_name || p.email || 'Foydalanuvchi'
          } catch { /* fallback */ }
          chatMap.set(partnerId, {
            id: partnerId, partnerId, partnerName,
            lastMsg: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }),
            unread: messages.filter(m => m.sender_id === partnerId && !m.is_read).length
          })
        }
      }
      setChats(Array.from(chatMap.values()))
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setChatsLoading(false)
    }
  }

  // Fetch profile from profiles table
  const loadProfile = async (userId: string) => {
    setProfileLoading(true)
    try {
      const data = await profileHelpers.getProfile(userId)
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Listings from Supabase (no auth needed)
        console.log('Loading listings...')
        const data = await listingHelpers.getActive()
        console.log('Listings loaded:', data)
        setListings(data)
        setFiltered(data)

        // 2. Auth session
        const { data: sessionData } = await supabase.auth.getSession()
        const currentUser = sessionData?.session?.user
        if (currentUser) {
          setUser(currentUser)
          console.log('User logged in:', currentUser.email)
          // 3. Load chats from messages table
          await loadChats(currentUser.id)
          // 4. Load profile from profiles table
          await loadProfile(currentUser.id)
        } else {
          console.log('No user session')
          setShowAuth(true)
        }
      } catch (error) {
        console.error('Init error:', error)
        setListings([])
        setFiltered([])
        setShowAuth(true)
      } finally {
        setLoading(false)
        setShowSplash(false)
      }
    }
    init()
  }, [])

  // Reload data when switching tabs
  useEffect(() => {
    if (activeTab === 'home' || activeTab === 'search') {
      listingHelpers.getActive().then(data => {
        setListings(data)
        if (districtFilter === 'Hammasi') setFiltered(data)
        else setFiltered(data.filter(l => l.location === districtFilter))
      }).catch(err => console.error('Refresh listings error:', err))
    }
    if (!user) return
    if (activeTab === 'chat') loadChats(user.id)
    if (activeTab === 'profile') loadProfile(user.id)
  }, [activeTab])

  const toggleFav = (item: Listing) => {
    if (favorites.some(f => f.id === item.id)) {
      setFavorites(favorites.filter(f => f.id !== item.id))
    } else {
      setFavorites([...favorites, item])
    }
  }

  const handleFilter = (q: string) => {
    setFiltered(listings.filter(l => l.title.toLowerCase().includes(q.toLowerCase()) || l.location?.toLowerCase().includes(q.toLowerCase())))
  }

  const handlePublish = (item: Listing) => {
    const newList = [item, ...listings]
    setListings(newList)
    setFiltered(newList)
  }

  const applyDistrictFilter = (d: string) => {
    setDistrictFilter(d)
    if (d === 'Hammasi') setFiltered(listings)
    else setFiltered(listings.filter(l => l.location === d))
  }

  if (showSplash && loading) return <SplashScreen onComplete={() => setShowSplash(false)} />
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-black"><Loader className="animate-spin text-white" size={40} /></div>

  // Show login screen if not authenticated
  if (showAuth && !user) return (
    <AuthScreen
      onLogin={(loggedInUser) => {
        setUser(loggedInUser)
        setShowAuth(false)
        // Load user-specific data
        loadChats(loggedInUser.id)
        loadProfile(loggedInUser.id)
      }}
      onSkip={() => setShowAuth(false)}
    />
  )

  const currentChat = chats.find(c => c.id === selectedChat)

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6">
              <header className="flex justify-between items-center mb-10"><div><h1 className="text-2xl font-black tracking-tighter">UY JOY</h1><p className="text-[8px] text-accent-blue uppercase tracking-[0.3em]">Qashqadaryo</p></div><button className="p-3 glass rounded-2xl relative"><Bell size={20}/></button></header>
              <section className="mb-12"><div className="flex justify-between items-center mb-6 border-l-4 border-accent-gold pl-4"><h2 className="text-xl font-black uppercase tracking-tight">TOP E'lonlar</h2><button className="text-[10px] font-black text-accent-gold uppercase tracking-widest">Hammasi</button></div><div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">{listings.slice(0, 3).map(l => <div key={`top-${l.id}`} onClick={() => setSelectedHouse(l)} className="min-w-[300px] h-48 glass rounded-[2.5rem] relative overflow-hidden shrink-0 group cursor-pointer border-accent-gold/10 hover:border-accent-gold/30 transition-all"><img src={l.image_url || '/placeholder.jpg'} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" /><div className="relative h-full p-8 flex flex-col justify-end bg-gradient-to-t from-black"><h4 className="font-black text-lg mb-1">{l.title}</h4><p className="text-accent-gold font-black text-xs uppercase tracking-widest">{l.price} mln so'm</p></div></div>)}</div></section>
              <section><div className="flex justify-between items-center mb-6 border-l-4 border-accent-blue pl-4"><h2 className="text-xl font-black uppercase tracking-tight">Barcha E'lonlar</h2><button onClick={() => setActiveTab('search')} className="text-[10px] font-black text-accent-blue uppercase tracking-widest">Hammasi</button></div><div className="grid gap-6">{filtered.map((l, i) => <HouseCard key={l.id} listing={l} index={i} isFavorite={favorites.some(f => f.id === l.id)} onToggleFavorite={toggleFav} onClick={setSelectedHouse} />)}</div></section>
            </motion.div>
          )}
          {activeTab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 px-4">
              <div className="relative mb-8"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" /><input type="text" placeholder="Qidiruv..." onChange={e => handleFilter(e.target.value)} className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-blue/30" /></div>
              <div className="glass p-8 rounded-[2.5rem] border-white/5"><h3 className="font-black uppercase tracking-widest text-xs mb-6 text-accent-blue">Tumanlar</h3><div className="flex flex-wrap gap-2">{['Hammasi', 'Qarshi', 'Shahrisabz', 'Kitob', 'Muborak', "G'uzor"].map(d => <button key={d} onClick={() => applyDistrictFilter(d)} className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${districtFilter === d ? 'bg-accent-blue text-black shadow-lg scale-105' : 'glass border-white/5 text-neutral-400 hover:border-accent-blue/30'}`}>{d}</button>)}</div><button onClick={() => setActiveTab('home')} className="w-full py-5 bg-white text-black rounded-2xl mt-10 font-black uppercase tracking-widest text-[10px]">Qidirish</button></div>
            </motion.div>
          )}
          {activeTab === 'add' && (user ? <AddListingView key="add" onBack={() => setActiveTab('home')} onPublish={handlePublish} userId={user.id} /> : <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 px-4 text-center"><Ghost size={64} className="text-neutral-700 mx-auto mb-6" /><h2 className="text-2xl font-black uppercase mb-3 tracking-tighter">E'lon qo'shish uchun tizimga kiring</h2><p className="text-xs text-neutral-500 uppercase tracking-widest mb-8">Avval kirish qiling yoki ro'yxatdan o'ting, so'ngra yangi e'lon joylashtiring.</p><button onClick={() => setShowAuth(true)} className="px-6 py-4 bg-accent-blue text-black rounded-3xl font-black uppercase tracking-wider">Kirish / Ro'yxatdan o'tish</button></motion.div>)}
          {activeTab === 'chat' && (
            <div key="chat" className="px-4">
              {currentChat ? <ChatDetailView chat={currentChat} onBack={() => setSelectedChat(null)} userId={user?.id} /> : (
                <div className="pt-8">
                  <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">Suhbatlar</h2>
                  <div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} /><input type="text" placeholder="Suhbatlarni qidirish..." className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 text-sm" /></div>
                  {!user ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center text-center"><Ghost size={64} className="text-neutral-800 mb-6" /><h3 className="font-black text-xl mb-2">Tizimga kiring</h3><p className="text-xs text-neutral-500 uppercase tracking-widest">Suhbatlar uchun tizimga kirish kerak</p></div>
                  ) : chatsLoading ? (
                    <div className="h-[50vh] flex items-center justify-center"><Loader className="animate-spin text-accent-blue" size={32} /></div>
                  ) : chats.length === 0 ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center text-center"><MessageCircle size={64} className="text-neutral-800 mb-6" /><h3 className="font-black text-xl mb-2">Hozircha suhbat yo'q</h3><p className="text-xs text-neutral-500 uppercase tracking-widest">Xabarlar Supabase dan yuklanadi</p></div>
                  ) : chats.map(c => <motion.div key={c.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedChat(c.id)} className="glass p-5 rounded-3xl mb-3 flex items-center gap-4 cursor-pointer border-white/5 hover:border-accent-blue/20 transition-all"><div className="relative"><div className="w-14 h-14 rounded-full bg-accent-blue/20 flex items-center justify-center"><User size={24} className="text-accent-blue" /></div><div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-[0_0_10px_#22c55e]" /></div><div className="flex-1"><h4 className="font-bold tracking-tight">{c.partnerName}</h4><p className="text-xs text-neutral-500 truncate leading-relaxed">{c.lastMsg}</p></div>{c.unread > 0 && <span className="bg-accent-blue text-black text-[10px] font-black px-2 py-1 rounded-full">{c.unread}</span>}<ChevronRight size={18} className="text-neutral-700"/></motion.div>)}
                </div>
              )}
            </div>
          )}
          {activeTab === 'fav' && (
            <div key="fav" className="pt-8 px-4">
              <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">Saqlanganlar</h2>
              {favorites.length > 0 ? (
                <div className="grid gap-6">{favorites.map((l, i) => <HouseCard key={l.id} listing={l} index={i} isFavorite={true} onToggleFavorite={toggleFav} onClick={setSelectedHouse} />)}</div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center"><Ghost size={64} className="text-neutral-800 mb-6" /><h3 className="font-black text-xl mb-2">Hozircha hech narsa yo'q</h3><p className="text-xs text-neutral-500 uppercase tracking-widest">Uylarni yurakcha orqali saqlang</p></div>
              )}
            </div>
          )}
          {activeTab === 'profile' && (
            <div key="profile" className="pt-24 px-4 text-center">
              {profileLoading ? (
                <div className="h-[60vh] flex items-center justify-center"><Loader className="animate-spin text-accent-blue" size={32} /></div>
              ) : !user ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center"><Ghost size={64} className="text-neutral-800 mb-6" /><h3 className="font-black text-xl mb-2">Tizimga kiring</h3><p className="text-xs text-neutral-500 uppercase tracking-widest">Profil uchun tizimga kirish kerak</p></div>
              ) : (
                <>
                  <div className="w-28 h-28 rounded-full glass border-2 border-accent-blue p-1.5 mx-auto mb-6"><div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center"><User size={48} className="text-neutral-700" /></div></div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{profile?.full_name || user?.email}</h2>
                  {profile?.phone && <p className="text-sm text-accent-blue mt-2 font-bold">{profile.phone}</p>}
                  {profile?.email && <p className="text-xs text-neutral-500 mt-1">{profile.email}</p>}
                  <div className="mt-12 space-y-3">
                    <div className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest text-neutral-400">Ism</span><span className="text-xs font-bold">{profile?.full_name || '—'}</span></div>
                    <div className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest text-neutral-400">Telefon</span><span className="text-xs font-bold">{profile?.phone || '—'}</span></div>
                    <div className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest text-neutral-400">Email</span><span className="text-xs font-bold">{profile?.email || user?.email || '—'}</span></div>
                    <button onClick={() => alert('Tillarni o\'zgartirishni amalga oshirish')} className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between group hover:border-accent-blue/30"><span className="text-xs font-black uppercase tracking-widest">Tilni o'zgartirish</span><ChevronRight size={18} className="text-neutral-700" /></button>
                    <button onClick={async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); setShowSplash(true) }} className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between text-red-500 group hover:border-red-500/30"><span className="text-xs font-black uppercase tracking-widest">Tizimdan chiqish</span><ChevronRight size={18} /></button>
                  </div>
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedHouse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex flex-col no-scrollbar overflow-y-auto">
            <div className="relative h-[45vh] shrink-0">
              <img src={selectedHouse.image_url || '/placeholder.jpg'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <button onClick={() => setSelectedHouse(null)} className="absolute top-6 left-6 p-3 glass rounded-full"><ArrowLeft size={20}/></button>
              <button onClick={() => toggleFav(selectedHouse)} className={`absolute top-6 right-6 p-3 glass rounded-full ${favorites.some(f => f.id === selectedHouse.id) ? 'text-red-500' : 'text-white'}`}><Heart size={20} fill={favorites.some(f => f.id === selectedHouse.id) ? "currentColor" : "none"}/></button>
            </div>
            <div className="flex-1 p-8 glass rounded-t-[3rem] -mt-10 border-t border-white/10 relative z-10 min-h-[60vh]">
              <div className="flex justify-between items-start mb-6"><div><h2 className="text-2xl font-black mb-2 uppercase tracking-tight leading-tight">{selectedHouse.title}</h2><div className="flex items-center gap-2 text-accent-blue"><MapPin size={16}/><span className="text-xs font-black uppercase tracking-widest">{selectedHouse.location}</span></div></div><div className="text-right"><p className="text-3xl font-black">{selectedHouse.price}</p><p className="text-[10px] font-black text-accent-blue uppercase tracking-widest">mln so'm</p></div></div>
              <div className="grid grid-cols-2 gap-4 mb-8"><div className="glass p-5 rounded-2xl text-center border-white/5"><BedDouble className="mx-auto mb-2 text-accent-blue" size={24}/><p className="text-xs font-black uppercase tracking-widest">{selectedHouse.rooms} xona</p></div><div className="glass p-5 rounded-2xl text-center border-white/5"><Ruler className="mx-auto mb-2 text-accent-blue" size={24}/><p className="text-xs font-black uppercase tracking-widest">{selectedHouse.area} m²</p></div></div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-10 font-medium uppercase tracking-tight">Bu uy barcha zamonaviy talablarga javob beradi. Evro ta'mirlangan, oshxona mebellari va maishiy texnikalar o'rnatilgan.</p>
              <div className="flex gap-4 mt-auto"><button className="flex-1 py-5 rounded-2xl glass border-white/10 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:bg-white/5"><Phone size={18}/> Qo'ng'iroq</button><button className="flex-1 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">Suhbatga o'tish</button></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50">
        <div className="glass-dark rounded-[2.5rem] p-2 py-3 flex items-center justify-around border-white/10 shadow-2xl shadow-black/50">
          {[{ icon: <Home size={22} />, label: 'Asosiy', id: 'home' }, { icon: <Search size={22} />, label: 'Qidiruv', id: 'search' }, { icon: <PlusCircle size={36} className="text-accent-blue" />, label: "E'lon", id: 'add' }, { icon: <MessageCircle size={22} />, label: 'Suhbat', id: 'chat' }, { icon: <Heart size={22} />, label: 'Saqlangan', id: 'fav' }, { icon: <User size={22} />, label: 'Profil', id: 'profile' }].map(btn => (
            <button key={btn.id} onClick={() => { setActiveTab(btn.id); setSelectedChat(null) }} className="flex flex-col items-center gap-1 p-2 min-w-[64px] relative group">
              <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === btn.id ? 'bg-accent-blue/10 text-accent-blue shadow-[0_0_15px_rgba(0,229,255,0.2)] scale-110' : 'text-neutral-500 group-hover:text-neutral-300'}`}>{btn.icon}</div>
              <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${activeTab === btn.id ? 'text-accent-blue' : 'text-neutral-600'}`}>{btn.label}</span>
              {activeTab === btn.id && <motion.div layoutId="activeTab" className="absolute -bottom-1 w-1 h-1 bg-accent-blue rounded-full shadow-[0_0_10px_#00E5FF]" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
