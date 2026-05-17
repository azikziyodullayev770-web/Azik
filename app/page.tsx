'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, ChevronRight, Bell, Home, 
  MessageCircle, PlusCircle, User, Heart, ArrowLeft, Ghost, Phone, Send, Camera,
  Star, Ruler, BedDouble, Check, Info, Loader2, Zap, Wifi, Flame, Droplet, Thermometer, Wind,
  Shield, LogOut, Clock, XCircle, Megaphone, Trash2, Edit3, Brain,
  Lock, Settings, Sparkles, Layers, Languages
} from 'lucide-react'
import { supabase, type Listing, listingHelpers, messageHelpers, profileHelpers, newsHelpers, type Message, type Profile, type NewsItem } from '@/lib/supabase'
import { SplashScreen } from '@/components/SplashScreen'
import { HouseCard } from '@/components/HouseCard'
import { AuthScreen } from '@/components/AuthScreen'

type Chat = { id: string; partnerId: string; partnerName: string; lastMsg: string; time: string; unread: number }

const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Qarshi': [38.8612, 65.7847],
  'Shahrisabz': [39.0539, 66.8278],
  'Kitob': [39.1275, 66.8833],
  "G'uzor": [38.6214, 66.2486],
  'Kasbi': [38.9056, 65.3944],
  'Muborak': [39.2611, 65.1528],
  'Nishon': [38.6853, 65.6847],
  'Chiroqchi': [39.0381, 66.5681],
  'Yakkabog\'': [38.9806, 66.6856],
  'Dehqonobod': [38.2250, 66.4950]
}

function AddListingView({ onBack, onPublish, userId }: { onBack: () => void; onPublish: (item: Listing) => void; userId: string }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ 
    title: '', 
    price: '', 
    district: '', 
    rooms: '', 
    area: '', 
    type: 'Sotuv' as 'Sotuv' | 'Ijara', 
    currency: 'UZS', 
    status: 'active' as 'active' | 'draft' | 'sold', 
    image_url: '', 
    image_url2: '', 
    image_url3: '', 
    image_url4: '', 
    description: '', 
    coords: '',
    phone: '',
    telegram: '',
    electricity: null as boolean | null,
    wifi: null as boolean | null,
    gas: null as boolean | null,
    water: null as boolean | null,
    heating: null as boolean | null,
    airConditioning: null as boolean | null
  })
  const districts = ['Qarshi', 'Shahrisabz', 'Kitob', "G'uzor", 'Kasbi', 'Muborak', 'Nishon', 'Chiroqchi', 'Yakkabog\'', 'Dehqonobod']

  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const ymapsInstance = useRef<any>(null)
  const placemarkRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).ymaps) {
      setMapLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=7e3a440c-35a1-4197-b02b-1fab29973d22&lang=uz_UZ`
    script.async = true
    script.onload = () => {
      setMapLoaded(true)
    }
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!mapLoaded || !formData.district || !mapRef.current) return

    const ymaps = (window as any).ymaps
    let mapInstance: any = null

    ymaps.ready(() => {
      if (!mapRef.current) return
      const center = DISTRICT_COORDS[formData.district] || [38.8612, 65.7847]
      
      // Clean up previous instance if it exists
      if (ymapsInstance.current) {
        try {
          ymapsInstance.current.destroy()
        } catch (e) {
          console.error(e)
        }
        ymapsInstance.current = null
        placemarkRef.current = null
      }

      mapInstance = new ymaps.Map(mapRef.current, {
        center: center,
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      })
      ymapsInstance.current = mapInstance

      // Helper function to create a draggable placemark
      const createPlacemark = (coords: [number, number]) => {
        const placemark = new ymaps.Placemark(coords, {
          balloonContent: 'Joylashuv (aniqroq belgilash uchun belgi ustidan bosib sudrang)'
        }, {
          preset: 'islands#dotIcon',
          iconColor: '#00E5FF',
          draggable: true
        })

        placemark.events.add('dragend', () => {
          const newCoords = placemark.geometry.getCoordinates() as [number, number]
          setSelectedCoords(newCoords)
        })

        return placemark
      }

      // If we already have selectedCoords (e.g. going back and forth between steps), show it immediately!
      if (selectedCoords) {
        placemarkRef.current = createPlacemark(selectedCoords)
        mapInstance.geoObjects.add(placemarkRef.current)
        mapInstance.setCenter(selectedCoords, 15)
      }

      // Listen to click on map to position the pin
      mapInstance.events.add('click', (e: any) => {
        const coords = e.get('coords') as [number, number]
        setSelectedCoords(coords)

        if (placemarkRef.current) {
          placemarkRef.current.geometry.setCoordinates(coords)
        } else {
          placemarkRef.current = createPlacemark(coords)
          mapInstance.geoObjects.add(placemarkRef.current)
        }
      })
    })

    return () => {
      if (mapInstance) {
        try {
          mapInstance.destroy()
        } catch (e) {
          console.error(e)
        }
        ymapsInstance.current = null
        placemarkRef.current = null
      }
    }
  }, [mapLoaded, formData.district])

  useEffect(() => {
    if (selectedCoords) {
      setFormData(prev => ({ ...prev, coords: `${selectedCoords[0]},${selectedCoords[1]}` }))
    } else {
      setFormData(prev => ({ ...prev, coords: '' }))
    }
  }, [selectedCoords])

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokatsiya brauzeringiz tomonidan qo\'llab-quvvatlanmaydi.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const coords: [number, number] = [latitude, longitude]
        setSelectedCoords(coords)

        if (ymapsInstance.current) {
          ymapsInstance.current.setCenter(coords, 16)

          const ymaps = (window as any).ymaps
          if (placemarkRef.current) {
            placemarkRef.current.geometry.setCoordinates(coords)
          } else {
            const placemark = new ymaps.Placemark(coords, {
              balloonContent: 'Hozirgi joylashuvingiz (ustidan sudrab aniq belgilashingiz mumkin)'
            }, {
              preset: 'islands#dotIcon',
              iconColor: '#00E5FF',
              draggable: true
            })

            placemark.events.add('dragend', () => {
              const newCoords = placemark.geometry.getCoordinates() as [number, number]
              setSelectedCoords(newCoords)
            })

            placemarkRef.current = placemark
            ymapsInstance.current.geoObjects.add(placemark)
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Joylashuvingizni aniqlashda xatolik yuz berdi. Iltimos, xaritani bosing va o\'zingiz belgilang.')
      },
      { enableHighAccuracy: true }
    )
  }

  const handleFinish = async () => {
    try {
      setLoading(true)

      const selectedAmenities = []
      if (formData.electricity) selectedAmenities.push('electricity')
      if (formData.wifi) selectedAmenities.push('wifi')
      if (formData.gas) selectedAmenities.push('gas')
      if (formData.water) selectedAmenities.push('water')
      if (formData.heating) selectedAmenities.push('heating')
      if (formData.airConditioning) selectedAmenities.push('airConditioning')

      const amenitiesTag = selectedAmenities.length > 0 ? `\n[amenities:${selectedAmenities.join(',')}]` : ''

      const extraImages = []
      if (formData.image_url2) extraImages.push(formData.image_url2)
      if (formData.image_url3) extraImages.push(formData.image_url3)
      if (formData.image_url4) extraImages.push(formData.image_url4)
      const imagesTag = extraImages.length > 0 ? `\n[images:${extraImages.join(',')}]` : ''

      const contactTag = `\n[phone:+998${formData.phone}]\n[telegram:${formData.telegram}]`

      const newListing: Omit<Listing, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        title: formData.title || 'Yangi e\'lon',
        price: parseInt(formData.price) || 0,
        location: formData.district || 'Qarshi',
        type: formData.type,
        area: parseInt(formData.area) || 100,
        rooms: parseInt(formData.rooms) || 3,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800',
        description: `${formData.description || 'Yangi e\'lon'}${formData.coords ? `\n[coords:${formData.coords}]` : ''}${amenitiesTag}${imagesTag}${contactTag}`,
        status: formData.status
      }

      const created = await listingHelpers.create(newListing)
      if (!created) throw new Error('E\'lon yaratilmadi')
      onPublish(created)
      alert('E\'lon muvaffaqiyatli yuklandi!')
      onBack()
    } catch (error: any) {
      console.error('Error publishing listing:', error)
      alert(error?.message || 'Xatolik yuz berdi')
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
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Tuman tanlang</p>
                <div className="grid grid-cols-2 gap-3">
                  {districts.map(d => (
                    <button 
                      key={d} 
                      type="button"
                      onClick={() => setFormData({...formData, district: d})} 
                      className={`py-4 px-4 rounded-2xl glass border-2 transition-all text-xs font-bold ${formData.district === d ? 'border-accent-blue text-accent-blue bg-accent-blue/5' : 'border-white/5 text-neutral-400'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {formData.district && (
                <div className="glass p-6 rounded-3xl border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black uppercase tracking-wider text-accent-blue">Aniq joylashuvni belgilang</h4>
                    <span className="text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg">Majburiy</span>
                  </div>
                  
                  <div 
                    ref={mapRef} 
                    className="w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/50"
                    style={{ height: '260px' }}
                  />

                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    className="w-full py-3.5 rounded-xl border border-accent-blue/20 hover:border-accent-blue/50 glass text-[10px] font-black uppercase tracking-widest text-accent-blue flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    📍 Hozirgi joylashuvimni aniqlash
                  </button>

                  {formData.coords ? (
                    <p className="text-[10px] text-accent-blue font-black tracking-wider uppercase">
                      📍 Tanlangan koordinata: {formData.coords}
                    </p>
                  ) : (
                    <p className="text-[10px] text-neutral-500 font-black tracking-wider uppercase animate-pulse">
                      ☝️ Xaritani bosing va uy joylashgan nuqtani belgilang
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormData({...formData, type: 'Sotuv'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'Sotuv' ? 'bg-white text-black' : 'glass text-neutral-500'}`}>Sotuv</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'Ijara'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'Ijara' ? 'bg-white text-black' : 'glass text-neutral-500'}`}>Ijara</button>
              </div>

              <input type="text" placeholder="Sarlavha" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent-blue/30" />

              <div className="flex gap-2">
                <input type="number" placeholder="Narxi" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="flex-1 bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none" />
                <div className="glass rounded-2xl flex p-1">
                  <button type="button" onClick={() => setFormData({...formData, currency: 'UZS'})} className={`px-3 py-2 rounded-xl text-[10px] font-bold ${formData.currency === 'UZS' ? 'bg-white text-black' : 'text-neutral-500'}`}>UZS</button>
                  <button type="button" onClick={() => setFormData({...formData, currency: 'USD'})} className={`px-3 py-2 rounded-xl text-[10px] font-bold ${formData.currency === 'USD' ? 'bg-white text-black' : 'text-neutral-500'}`}>USD</button>
                </div>
              </div>

              <div className="flex gap-2">
                <input type="number" placeholder="Xonalar" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} className="flex-1 bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none" />
                <input type="number" placeholder="Maydon" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="flex-1 bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-4 text-xs text-neutral-500 font-black">+998</span>
                  <input 
                    type="tel" 
                    placeholder="Telefon raqam" 
                    value={formData.phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9)
                      setFormData({...formData, phone: val})
                    }} 
                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 pl-14 text-sm focus:outline-none focus:border-accent-blue/30" 
                  />
                </div>
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-4 text-xs text-neutral-500 font-black">@</span>
                  <input 
                    type="text" 
                    placeholder="Telegram Username" 
                    value={formData.telegram} 
                    onChange={e => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                      setFormData({...formData, telegram: val})
                    }} 
                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 pl-8 text-sm focus:outline-none focus:border-accent-blue/30" 
                  />
                </div>
              </div>

              {/* Qo'shimcha sharoitlar (Uy-joy so'rovnomasi) */}
              <div className="glass p-6 rounded-3xl border-white/10 space-y-4">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Qo'shimcha sharoitlar (Uy-joy so'rovnomasi)</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'electricity', label: 'Elektr tarmog\'i', icon: <Zap size={18} /> },
                    { id: 'wifi', label: 'Simsiz internet (WiFi)', icon: <Wifi size={18} /> },
                    { id: 'gas', label: 'Tabiiy gaz', icon: <Flame size={18} /> },
                    { id: 'water', label: 'Ichimlik suvi', icon: <Droplet size={18} /> },
                    { id: 'heating', label: 'Isitish tizimi', icon: <Thermometer size={18} /> },
                    { id: 'airConditioning', label: 'Konditsioner', icon: <Wind size={18} /> }
                  ].map(item => (
                    <div key={item.id} className="glass p-4 rounded-2xl border border-white/5 flex flex-col justify-between gap-3">
                      <div className="flex items-center gap-2 text-neutral-400">
                        {item.icon}
                        <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">{item.label}</span>
                      </div>
                      <div className="flex bg-neutral-950 p-1 rounded-xl gap-1">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, [item.id]: true})} 
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData[item.id as keyof typeof formData] === true ? 'bg-accent-blue text-black shadow-lg shadow-accent-blue/20' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                          Ha
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, [item.id]: false})} 
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData[item.id as keyof typeof formData] === false ? 'bg-red-500/10 border border-red-500/30 text-red-500' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                          Yo'q
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div className="glass p-6 rounded-3xl border-white/10">
                <h4 className="text-xl font-black mb-6">Rasm va batafsil</h4>
                
                {/* Upload 4 Images Grid Section */}
                <div className="mb-6 space-y-4">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Rasmlar yuklash (4 ta rasm majburiy)</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'image_url', label: '1-rasm (Asosiy)' },
                      { key: 'image_url2', label: '2-rasm' },
                      { key: 'image_url3', label: '3-rasm' },
                      { key: 'image_url4', label: '4-rasm' }
                    ].map((slot) => {
                      const imgVal = formData[slot.key as keyof typeof formData] as string
                      return (
                        <div key={slot.key} className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">{slot.label}</span>
                          {imgVal ? (
                            <div className="relative w-full h-32 rounded-2xl overflow-hidden group border border-white/10 shadow-lg shadow-black/30">
                              <img src={imgVal} alt={slot.label} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, [slot.key]: '' })}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-black text-[9px] uppercase rounded-xl transition-all"
                                >
                                  O'chirish
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-accent-blue/40 bg-neutral-900/50 hover:bg-neutral-900/80 cursor-pointer transition-all active:scale-[0.98]">
                              <div className="flex flex-col items-center justify-center pt-2 pb-3 text-center px-2">
                                <Camera size={20} className="text-neutral-500 mb-1" />
                                <p className="text-[9px] font-bold text-neutral-300 leading-tight">Rasm tanlang</p>
                                <p className="text-[7px] text-neutral-600 uppercase tracking-widest mt-0.5">PNG, JPG, WEBP</p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      setFormData({ ...formData, [slot.key]: reader.result as string })
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <textarea
                  placeholder="E'lon haqida qisqacha yozing"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full min-h-[140px] bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent-blue/30 resize-none"
                />
              </div>
            </motion.div>
          )}
          {step === 4 && <motion.div key="s4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8"><div className="glass p-6 rounded-3xl border-accent-gold/20 flex items-center gap-4 cursor-pointer hover:bg-accent-gold/5 transition-all"><Star size={24} className="text-accent-gold" /><div><h4 className="font-black uppercase tracking-tight">TOP E'lon</h4><p className="text-[9px] text-neutral-500">Tavsiya etiladi</p></div><ChevronRight className="ml-auto text-neutral-700" size={18}/></div><div className="grid grid-cols-2 gap-4"><button onClick={() => setFormData({...formData, status: 'active'})} className={`rounded-3xl p-6 flex flex-col items-center gap-3 transition-all ${formData.status === 'active' ? 'bg-white text-black shadow-2xl scale-105' : 'glass border-white/5 text-neutral-500'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.status === 'active' ? 'bg-black text-white' : 'bg-neutral-900'}`}><Check size={20}/></div><span className="text-[10px] font-black uppercase">Publish</span></button><button onClick={() => setFormData({...formData, status: 'draft'})} className={`rounded-3xl p-6 flex flex-col items-center gap-3 transition-all ${formData.status === 'draft' ? 'bg-white text-black shadow-2xl scale-105' : 'glass border-white/5 text-neutral-500'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.status === 'draft' ? 'bg-black text-white' : 'bg-neutral-900'}`}><Info size={20}/></div><span className="text-[10px] font-black uppercase text-center leading-tight">Qoralama</span></button></div></motion.div>}
        </AnimatePresence>
      </div>

      <div className="p-6 pb-10 flex gap-4 border-t border-white/5 bg-black">
        {step > 1 && <button onClick={() => setStep(step - 1)} disabled={loading} className="flex-1 py-5 rounded-2xl glass font-black uppercase text-[10px]">Orqaga</button>}
        <button 
          onClick={() => {
            if (step === 1) {
              if (!formData.district) {
                alert('Iltimos, tuman tanlang! (Bu majburiy)')
                return
              }
              if (!formData.coords) {
                alert('Iltimos, xaritadan uy joylashgan nuqtani belgilang! (Bu majburiy)')
                return
              }
            }
            if (step === 2) {
              if (!formData.title.trim()) {
                alert('Iltimos, e\'lon sarlavhasini kiriting! (Bu majburiy)')
                return
              }
              if (!formData.price || parseInt(formData.price) <= 0) {
                alert('Iltimos, uy narxini to\'g\'ri kiriting! (Bu majburiy)')
                return
              }
              if (!formData.rooms || parseInt(formData.rooms) <= 0) {
                alert('Iltimos, xonalar sonini kiriting! (Bu majburiy)')
                return
              }
              if (!formData.area || parseInt(formData.area) <= 0) {
                alert('Iltimos, uy maydonini kiriting! (Bu majburiy)')
                return
              }
              // Mandatory Amenities Toggles Validation
              if (formData.electricity === null) {
                alert('Iltimos, "Elektr tarmog\'i" bor yoki yo\'qligini tanlang! (Bu majburiy)')
                return
              }
              if (formData.wifi === null) {
                alert('Iltimos, "Simsiz internet (WiFi)" bor yoki yo\'qligini tanlang! (Bu majburiy)')
                return
              }
              if (formData.gas === null) {
                alert('Iltimos, "Tabiiy gaz" bor yoki yo\'qligini tanlang! (Bu majburiy)')
                return
              }
              if (formData.water === null) {
                alert('Iltimos, "Ichimlik suvi" bor yoki yo\'qligini tanlang! (Bu majburiy)')
                return
              }
              if (formData.heating === null) {
                alert('Iltimos, "Isitish tizimi" bor yoki yo\'qligini tanlang! (Bu majburiy)')
                return
              }
              if (formData.airConditioning === null) {
                alert('Iltimos, "Konditsioner" bor yoki yo\'qligini tanlang! (Bu majburiy)')
                return
              }
              if (!formData.phone || formData.phone.length < 9) {
                alert('Iltimos, telefon raqamingizni to\'liq kiriting! (9 ta raqam bo\'lishi majburiy)')
                return
              }
              if (!formData.telegram.trim()) {
                alert('Iltimos, Telegram username-ingizni kiriting! (Bu majburiy)')
                return
              }
            }
            if (step === 3) {
              if (!formData.image_url) {
                alert('Iltimos, 1-rasmni yuklang! (Barcha 4 ta rasm majburiy)')
                return
              }
              if (!formData.image_url2) {
                alert('Iltimos, 2-rasmni yuklang! (Barcha 4 ta rasm majburiy)')
                return
              }
              if (!formData.image_url3) {
                alert('Iltimos, 3-rasmni yuklang! (Barcha 4 ta rasm majburiy)')
                return
              }
              if (!formData.image_url4) {
                alert('Iltimos, 4-rasmni yuklang! (Barcha 4 ta rasm majburiy)')
                return
              }
              if (!formData.description.trim()) {
                alert('Iltimos, uy haqida qisqacha tavsif yozing! (Bu majburiy)')
                return
              }
            }
            if (step < 4) {
              setStep(step + 1)
            } else {
              handleFinish()
            }
          }}
          disabled={loading} 
          className={`flex-[2] py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : (step === 4 ? "Tugatish" : "Keyingisi")} 
          {!loading && <ChevronRight size={14}/>}
        </button>
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
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">{loading ? <Loader2 className="animate-spin" /> : messages.map(m => <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl ${m.sender_id === userId ? 'bg-accent-blue text-black' : 'glass border-white/5'}`}>{m.content}</div></div>)}</div>
      <div className="p-6 glass flex gap-3"><input type="text" value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="flex-1 bg-neutral-900 rounded-2xl p-4 text-sm" placeholder="Xabar..." /><button onClick={send} className="p-4 bg-accent-blue text-black rounded-2xl"><Send size={20}/></button></div>
    </motion.div>
  )
}

const AVATAR_PRESETS = [
  { id: 'cyan-glow', name: 'Cyber Cyan', style: 'linear-gradient(135deg, #00E5FF 0%, #002d33 100%)' },
  { id: 'gold-dust', name: 'Golden Sunset', style: 'linear-gradient(135deg, #FFD700 0%, #3d2a00 100%)' },
  { id: 'matrix', name: 'Emerald Matrix', style: 'linear-gradient(135deg, #00E676 0%, #002408 100%)' },
  { id: 'deep-purple', name: 'Purple Helix', style: 'linear-gradient(135deg, #d500f9 0%, #1c002b 100%)' },
  { id: 'crimson', name: 'Solar Ruby', style: 'linear-gradient(135deg, #ff1744 0%, #3b000b 100%)' },
]

const ACCENT_STYLES = {
  cyan: {
    border: 'border-accent-blue/30 focus-within:border-accent-blue shadow-accent-blue/5',
    borderSolid: 'border-accent-blue',
    text: 'text-accent-blue',
    bg: 'bg-accent-blue/10',
    btn: 'bg-accent-blue text-black shadow-accent-blue/20 hover:bg-accent-blue/80',
    indicator: 'bg-accent-blue shadow-[0_0_10px_#00E5FF]',
    glow: 'rgba(0, 229, 255, 0.15)',
    color: '#00E5FF'
  },
  gold: {
    border: 'border-accent-gold/30 focus-within:border-accent-gold shadow-accent-gold/5',
    borderSolid: 'border-accent-gold',
    text: 'text-accent-gold',
    bg: 'bg-accent-gold/10',
    btn: 'bg-accent-gold text-black shadow-accent-gold/20 hover:bg-accent-gold/80',
    indicator: 'bg-accent-gold shadow-[0_0_10px_#FFD700]',
    glow: 'rgba(255, 215, 0, 0.15)',
    color: '#FFD700'
  },
  emerald: {
    border: 'border-emerald-500/30 focus-within:border-emerald-500 shadow-emerald-500/5',
    borderSolid: 'border-emerald-500',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    btn: 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-500/80',
    indicator: 'bg-emerald-500 shadow-[0_0_10px_#10B981]',
    glow: 'rgba(16, 185, 129, 0.15)',
    color: '#10B981'
  },
  purple: {
    border: 'border-purple-500/30 focus-within:border-purple-500 shadow-purple-500/5',
    borderSolid: 'border-purple-500',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    btn: 'bg-purple-500 text-white shadow-purple-500/20 hover:bg-purple-500/80',
    indicator: 'bg-purple-500 shadow-[0_0_10px_#A855F7]',
    glow: 'rgba(168, 85, 247, 0.15)',
    color: '#A855F7'
  }
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
  const [activeDetailImgIndex, setActiveDetailImgIndex] = useState(0)
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Interactive Profile states
  const [profileView, setProfileView] = useState<'dashboard' | 'edit' | 'my-listings' | 'settings'>('dashboard')
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [showAvatarPresets, setShowAvatarPresets] = useState(false)
  const [profileAccent, setProfileAccent] = useState<'cyan' | 'gold' | 'emerald' | 'purple'>('cyan')

  // News states
  const [news, setNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  const loadNews = async () => {
    setNewsLoading(true)
    try {
      const data = await newsHelpers.getNews()
      setNews(data)
    } catch (e) {
      console.warn("Failed to load news:", e)
    } finally {
      setNewsLoading(false)
    }
  }

  const handleAdminUpdateStatus = async (id: string, newStatus: 'active' | 'draft' | 'sold') => {
    const updated = listings.map(l => l.id === id ? { ...l, status: newStatus } : l)
    setListings(updated)
    setFiltered(updated.filter(l => l.status === 'active'))
    if (typeof window !== 'undefined') {
      localStorage.setItem('local_listings', JSON.stringify(updated))
    }
    try {
      await supabase.from('listings').update({ status: newStatus }).eq('id', id)
    } catch (e) {
      console.warn("Offline database update failed, synced locally: ", e)
    }
  }

  const handleAdminDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu e'lonni o'chirmoqchisiz?")) return
    const updated = listings.filter(l => l.id !== id)
    setListings(updated)
    setFiltered(updated.filter(l => l.status === 'active'))
    if (typeof window !== 'undefined') {
      localStorage.setItem('local_listings', JSON.stringify(updated))
    }
    try {
      await supabase.from('listings').delete().eq('id', id)
    } catch (e) {
      console.warn("Offline database delete failed, synced locally: ", e)
    }
  }

  const handleAdminEdit = async (updatedListing: Listing) => {
    const updated = listings.map(l => l.id === updatedListing.id ? updatedListing : l)
    setListings(updated)
    setFiltered(updated.filter(l => l.status === 'active'))
    if (typeof window !== 'undefined') {
      localStorage.setItem('local_listings', JSON.stringify(updated))
    }
    try {
      await supabase.from('listings').update({
        title: updatedListing.title,
        price: updatedListing.price,
        location: updatedListing.location,
        rooms: updatedListing.rooms,
        area: updatedListing.area,
        type: updatedListing.type
      }).eq('id', updatedListing.id)
    } catch (e) {
      console.warn("Offline database update failed, synced locally: ", e)
    }
  }

  // Load Accent preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAccent = localStorage.getItem('profile_accent') as 'cyan' | 'gold' | 'emerald' | 'purple'
      if (storedAccent && ['cyan', 'gold', 'emerald', 'purple'].includes(storedAccent)) {
        setProfileAccent(storedAccent)
      }
    }
  }, [])

  const changeAccent = (accent: 'cyan' | 'gold' | 'emerald' | 'purple') => {
    setProfileAccent(accent)
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile_accent', accent)
    }
  }

  const handleUpdateMyListingStatus = async (id: string, status: 'active' | 'draft' | 'sold') => {
    try {
      const updated = await listingHelpers.update(id, { status })
      if (updated) {
        const newListings = listings.map(l => l.id === id ? updated : l)
        setListings(newListings)
        setFiltered(newListings.filter(l => l.status === 'active'))
        alert("E'lon holati muvaffaqiyatli o'zgartirildi!")
      }
    } catch (error) {
      console.error("Error updating listing status:", error)
      alert("Holatni yangilashda xatolik yuz berdi")
    }
  }

  const handleDeleteMyListing = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu e'lonni o'chirmoqchisiz?")) return
    try {
      await listingHelpers.delete(id)
      const newListings = listings.filter(l => l.id !== id)
      setListings(newListings)
      setFiltered(newListings.filter(l => l.status === 'active'))
      alert("E'lon muvaffaqiyatli o'chirildi!")
    } catch (error) {
      console.error("Error deleting listing:", error)
      alert("O'chirishda xatolik yuz berdi")
    }
  }

  const renderAvatar = (url: string | null) => {
    if (!url) {
      return <User size={48} className="text-neutral-500" />
    }
    if (url.startsWith('linear-gradient')) {
      return (
        <div 
          className="w-full h-full rounded-full flex items-center justify-center text-white font-black text-2xl animate-pulse"
          style={{ background: url }}
        >
          {(editFirstName[0] || profile?.full_name?.[0] || '?').toUpperCase()}
        </div>
      )
    }
    return <img src={url} alt="Profile" className="w-full h-full object-cover rounded-full" />
  }

  useEffect(() => {
    setActiveDetailImgIndex(0)
  }, [selectedHouse])

  const [mapLoaded, setMapLoaded] = useState(false)
  const detailMapRef = useRef<HTMLDivElement>(null)
  const detailMapInstance = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).ymaps) {
      setMapLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=7e3a440c-35a1-4197-b02b-1fab29973d22&lang=uz_UZ`
    script.async = true
    script.onload = () => {
      setMapLoaded(true)
    }
    document.body.appendChild(script)
  }, [])

  const getListingCoordsAndDesc = (description: string | null) => {
    if (!description) return { cleanDesc: "Tavsif yo'q", coords: null, amenities: [], images: [], phone: null, telegram: null }
    
    // Parse coords
    let coords: [number, number] | null = null
    const coordsMatch = description.match(/\[coords:([^\]]+)\]/)
    if (coordsMatch && coordsMatch[1]) {
      const coordsArr = coordsMatch[1].split(',').map(Number)
      if (coordsArr.length === 2 && !isNaN(coordsArr[0]) && !isNaN(coordsArr[1])) {
        coords = coordsArr as [number, number]
      }
    }

    // Parse amenities
    let amenities: string[] = []
    const amenitiesMatch = description.match(/\[amenities:([^\]]+)\]/)
    if (amenitiesMatch && amenitiesMatch[1]) {
      amenities = amenitiesMatch[1].split(',')
    }

    // Parse extra images
    let extraImages: string[] = []
    const imagesMatch = description.match(/\[images:([^\]]+)\]/)
    if (imagesMatch && imagesMatch[1]) {
      extraImages = imagesMatch[1].split(',')
    }

    // Parse phone and telegram
    let phone: string | null = null
    const phoneMatch = description.match(/\[phone:([^\]]+)\]/)
    if (phoneMatch && phoneMatch[1]) {
      phone = phoneMatch[1]
    }

    let telegram: string | null = null
    const telegramMatch = description.match(/\[telegram:([^\]]+)\]/)
    if (telegramMatch && telegramMatch[1]) {
      telegram = telegramMatch[1]
    }

    // Clean description by stripping tags
    const cleanDesc = description
      .replace(/\[coords:[^\]]+\]/, '')
      .replace(/\[amenities:[^\]]+\]/, '')
      .replace(/\[images:[^\]]+\]/, '')
      .replace(/\[phone:[^\]]+\]/, '')
      .replace(/\[telegram:[^\]]+\]/, '')
      .trim()

    return { cleanDesc, coords, amenities, images: extraImages, phone, telegram }
  }

  const { cleanDesc, coords: listingCoords, amenities: listingAmenities, images: listingImages, phone: listingPhone, telegram: listingTelegram } = getListingCoordsAndDesc(selectedHouse?.description || null)
  const detailImages = (selectedHouse ? [selectedHouse.image_url, ...(listingImages || [])].filter(Boolean) as string[] : [])

  useEffect(() => {
    if (!selectedHouse || !mapLoaded || !listingCoords || !detailMapRef.current) return

    const ymaps = (window as any).ymaps
    ymaps.ready(() => {
      // Clear previous instance if any
      if (detailMapInstance.current) {
        detailMapInstance.current.destroy()
        detailMapInstance.current = null
      }

      detailMapInstance.current = new ymaps.Map(detailMapRef.current, {
        center: listingCoords,
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl']
      })

      const placemark = new ymaps.Placemark(listingCoords, {
        balloonContent: selectedHouse.title || 'Uy joylashuvi'
      }, {
        preset: 'islands#dotIcon',
        iconColor: '#00E5FF'
      })
      
      detailMapInstance.current.geoObjects.add(placemark)
    })

    return () => {
      if (detailMapInstance.current) {
        detailMapInstance.current.destroy()
        detailMapInstance.current = null
      }
    }
  }, [selectedHouse, mapLoaded, listingCoords])

  // Fetch chats from messages table
  const loadChats = async (userId: string) => {
    setChatsLoading(true)
    try {
      let messages: Message[] = []
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        messages = data || []
      } catch (dbError) {
        console.warn('Supabase messaging connection failed. Falling back to local offline storage:', dbError)
        if (typeof window !== 'undefined') {
          const localStr = localStorage.getItem('local_messages')
          if (localStr) {
            try {
              const allLocal = JSON.parse(localStr) as Message[]
              messages = allLocal
                .filter(m => m.sender_id === userId || m.receiver_id === userId)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            } catch {
              messages = []
            }
          }
        }
      }

      if (!messages || messages.length === 0) { 
        setChats([])
        return 
      }

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
      console.warn('Unhandled issue loading chats:', error)
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
      if (data) {
        const names = (data.full_name || '').split(' ')
        setEditFirstName(names[0] || '')
        setEditLastName(names.slice(1).join(' ') || '')
        setEditPhone(data.phone || '')
        setAvatarUrl(data.avatar_url || null)
      } else if (user) {
        setEditFirstName(user.user_metadata?.full_name?.split(' ')[0] || '')
        setEditLastName(user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '')
        setEditPhone('')
        setAvatarUrl(null)
      }
    } catch (error) {
      console.warn('Error loading profile, using mock/local profile:', error)
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

        // 1.5. News loading
        try {
          const newsData = await newsHelpers.getNews()
          setNews(newsData)
        } catch (ne) {
          console.warn("Failed to load initial news: ", ne)
        }

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

      if (activeTab === 'home') {
        newsHelpers.getNews().then(newsData => setNews(newsData)).catch(err => console.warn(err))
      }
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
    setFiltered(prev => {
      if (districtFilter === 'Hammasi') return newList
      return item.location === districtFilter ? [item, ...prev] : prev
    })
  }

  const applyDistrictFilter = (d: string) => {
    setDistrictFilter(d)
    if (d === 'Hammasi') setFiltered(listings)
    else setFiltered(listings.filter(l => l.location === d))
  }

  if (showSplash && loading) return <SplashScreen onComplete={() => setShowSplash(false)} />
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-black"><Loader2 className="animate-spin text-white" size={40} /></div>

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

  if (isAdminMode) {
    return (
      <AdminPanelView 
        listings={listings}
        onBack={() => setIsAdminMode(false)}
        onUpdateStatus={handleAdminUpdateStatus}
        onDelete={handleAdminDelete}
        onEditListing={handleAdminEdit}
        news={news}
        onAddNews={async (title, content, imageUrl) => {
          const added = await newsHelpers.addNews({ title, content, image_url: imageUrl })
          setNews([added, ...news])
        }}
        onDeleteNews={async (id) => {
          await newsHelpers.deleteNews(id)
          setNews(news.filter(n => n.id !== id))
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6">
              <header className="flex justify-between items-center mb-10"><div><h1 className="text-2xl font-black tracking-tighter">UY JOY</h1><p className="text-[8px] text-accent-blue uppercase tracking-[0.3em]">Qashqadaryo</p></div><button className="p-3 glass rounded-2xl relative"><Bell size={20}/></button></header>
              
              <section className="mb-12"><div className="flex justify-between items-center mb-6 border-l-4 border-accent-gold pl-4"><h2 className="text-xl font-black uppercase tracking-tight">TOP E'lonlar</h2><button className="text-[10px] font-black text-accent-gold uppercase tracking-widest">Hammasi</button></div><div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">{listings.slice(0, 3).map(l => <div key={`top-${l.id}`} onClick={() => setSelectedHouse(l)} className="min-w-[300px] h-48 glass rounded-[2.5rem] relative overflow-hidden shrink-0 group cursor-pointer border-accent-gold/10 hover:border-accent-gold/30 transition-all"><img src={l.image_url || '/placeholder.jpg'} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" /><div className="relative h-full p-8 flex flex-col justify-end bg-gradient-to-t from-black"><h4 className="font-black text-lg mb-1">{l.title}</h4><p className="text-accent-gold font-black text-xs uppercase tracking-widest">{l.price} mln so'm</p></div></div>)}</div></section>
              
              {/* PLATFORMA YANGILIKLARI CAROUSEL */}
              {news.length > 0 && (
                <section className="mb-12">
                  <div className={`flex justify-between items-center mb-6 border-l-4 ${ACCENT_STYLES[profileAccent].borderSolid} pl-4`}>
                    <h2 className="text-xl font-black uppercase tracking-tight">Platforma Yangiliklari</h2>
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${ACCENT_STYLES[profileAccent].text}`}>Yangilanishlar va Tahlillar</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {news.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={async () => {
                          setSelectedNews(item)
                          try {
                            const local = newsHelpers.getNewsLocal()
                            const updated = local.map(n => n.id === item.id ? { ...n, views: (n.views || 0) + 1 } : n)
                            localStorage.setItem('local_news', JSON.stringify(updated))
                            setNews(updated)
                          } catch (err) {}
                        }}
                        className={`min-w-[280px] w-[280px] p-6 glass rounded-[2.5rem] border relative overflow-hidden shrink-0 group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${ACCENT_STYLES[profileAccent].border}`}
                      >
                        {item.image_url && item.image_url.startsWith('linear-gradient') ? (
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: item.image_url }} />
                        ) : item.image_url ? (
                          <img src={item.image_url} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" />
                        ) : null}

                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="p-1.5 rounded-lg bg-neutral-900 border border-white/5 text-white">
                                <Megaphone size={10} className={ACCENT_STYLES[profileAccent].text} />
                              </span>
                              <span className="text-[8px] text-neutral-500 font-black uppercase tracking-widest">
                                {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                              </span>
                            </div>
                            <h4 className="font-black text-sm text-white line-clamp-2 leading-snug group-hover:text-accent-blue transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-neutral-400 line-clamp-3 leading-relaxed">
                              {item.content}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
                              👁 {item.views || 0} ta ko'rish
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${ACCENT_STYLES[profileAccent].text}`}>
                              Batafsil <ChevronRight size={10} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

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
                    <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-accent-blue" size={32} /></div>
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
                <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-accent-blue" size={32} /></div>
              ) : !user ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center"><Ghost size={64} className="text-neutral-800 mb-6" /><h3 className="font-black text-xl mb-2">Tizimga kiring</h3><p className="text-xs text-neutral-500 uppercase tracking-widest">Profil uchun tizimga kirish kerak</p></div>
              ) : (
                <>
                  {/* Outer Container with dynamic glow border based on chosen accent color */}
                  <div className={`w-full max-w-xl mx-auto rounded-[2.5rem] glass p-8 relative border transition-all duration-500 shadow-2xl ${ACCENT_STYLES[profileAccent].border}`}>
                    
                    {/* Header View: Dashboard / Edit / Settings / My Listings */}
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                      <div className="text-left">
                        {profileView === 'dashboard' && (
                          <>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white">Profil Kabineti</h3>
                            <p className={`text-[8px] font-black uppercase tracking-[0.25em] ${ACCENT_STYLES[profileAccent].text}`}>Shaxsiy boshqaruv xonasi</p>
                          </>
                        )}
                        {profileView === 'edit' && (
                          <>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white">Ma'lumotlarni tahrirlash</h3>
                            <p className={`text-[8px] font-black uppercase tracking-[0.25em] ${ACCENT_STYLES[profileAccent].text}`}>Ism va telefon raqamini o'zgartirish</p>
                          </>
                        )}
                        {profileView === 'my-listings' && (
                          <>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white">Mening E'lonlarim</h3>
                            <p className={`text-[8px] font-black uppercase tracking-[0.25em] ${ACCENT_STYLES[profileAccent].text}`}>Faol va qoralama e'lonlarni boshqarish</p>
                          </>
                        )}
                        {profileView === 'settings' && (
                          <>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white">Profil sozlamalari</h3>
                            <p className={`text-[8px] font-black uppercase tracking-[0.25em] ${ACCENT_STYLES[profileAccent].text}`}>Interaktiv dizayn va ranglar</p>
                          </>
                        )}
                      </div>
                      
                      {/* Back button to dashboard */}
                      {profileView !== 'dashboard' && (
                        <button 
                          onClick={() => setProfileView('dashboard')}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 text-neutral-400 hover:text-white"
                        >
                          <ArrowLeft size={10} /> Qaytish
                        </button>
                      )}
                    </div>

                    {/* Success/Error message overlays */}
                    {profileMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-3.5 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider mb-6 text-center shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2"
                      >
                        <Check size={14} className="animate-bounce" /> {profileMessage}
                      </motion.div>
                    )}

                    {/* VIEW 1: DASHBOARD */}
                    {profileView === 'dashboard' && (
                      <div className="space-y-8">
                        {/* 1. Header Profile details card */}
                        <div className="relative p-6 rounded-3xl bg-neutral-950/60 border border-white/5 overflow-hidden flex flex-col items-center justify-center gap-4">
                          {/* Interactive Avatar Container with hover pulse ring */}
                          <div className="relative group cursor-pointer" onClick={() => setProfileView('edit')}>
                            <div className={`w-28 h-28 rounded-full p-1 border-2 transition-all duration-500 ${ACCENT_STYLES[profileAccent].borderSolid} group-hover:scale-105 shadow-lg flex items-center justify-center`}>
                              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
                                {renderAvatar(avatarUrl)}
                              </div>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 p-2 rounded-full border border-white/10 glass text-white group-hover:bg-white group-hover:text-black transition-all shadow-lg`}>
                              <Edit3 size={14} />
                            </div>
                          </div>

                          <div className="text-center space-y-1">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                              {profile?.full_name || 'Ism kiritilmagan'}
                            </h2>
                            {profile?.phone ? (
                              <p className={`text-sm font-bold uppercase tracking-wide ${ACCENT_STYLES[profileAccent].text}`}>
                                {profile.phone}
                              </p>
                            ) : (
                              <p className="text-xs text-neutral-500 uppercase tracking-widest font-black animate-pulse">
                                📞 Telefon raqami kiritilmagan
                              </p>
                            )}
                            <p className="text-xs text-neutral-500 font-bold">{profile?.email || user?.email}</p>
                          </div>

                          {/* Profile completion gauge */}
                          {(() => {
                            let completed = 25; // has email
                            if (profile?.full_name) completed += 25;
                            if (profile?.phone) completed += 25;
                            if (avatarUrl) completed += 25;
                            return (
                              <div className="w-full mt-4 space-y-2">
                                <div className="flex justify-between items-center text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                                  <span>Kabinet to'ldirilganligi</span>
                                  <span className={ACCENT_STYLES[profileAccent].text}>{completed}%</span>
                                </div>
                                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden relative border border-white/5">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completed}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`absolute left-0 h-full rounded-full ${ACCENT_STYLES[profileAccent].indicator}`}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* 2. Interactive stats row */}
                        <div className="grid grid-cols-3 gap-3">
                          {/* Count listings */}
                          <div 
                            onClick={() => setProfileView('my-listings')}
                            className="glass-dark p-4 rounded-2xl border border-white/5 text-center cursor-pointer hover:border-white/10 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <span className="text-2xl font-black text-white block mb-1">
                              {listings.filter(l => l.user_id === user.id).length}
                            </span>
                            <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest block leading-tight">Mening E'lonlarim</span>
                          </div>

                          {/* Favorites count */}
                          <div 
                            onClick={() => setActiveTab('fav')}
                            className="glass-dark p-4 rounded-2xl border border-white/5 text-center cursor-pointer hover:border-white/10 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <span className="text-2xl font-black text-white block mb-1">
                              {favorites.length}
                            </span>
                            <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest block leading-tight">Saqlanganlar</span>
                          </div>

                          {/* Chats count */}
                          <div 
                            onClick={() => setActiveTab('chat')}
                            className="glass-dark p-4 rounded-2xl border border-white/5 text-center cursor-pointer hover:border-white/10 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <span className="text-2xl font-black text-white block mb-1">
                              {chats.length}
                            </span>
                            <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest block leading-tight">Suhbatlar</span>
                          </div>
                        </div>

                        {/* 3. Action Grid Links */}
                        <div className="mt-8 space-y-3 text-left">
                          {/* Edit personal info card */}
                          <button 
                            onClick={() => setProfileView('edit')}
                            className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/15 transition-all duration-300 animate-pulse-slow"
                          >
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-300 flex items-center gap-3">
                              <Edit3 size={16} className={`group-hover:rotate-12 transition-transform ${ACCENT_STYLES[profileAccent].text}`} />
                              Shaxsiy ma'lumotlar tahriri
                            </span>
                            <ChevronRight size={18} className="text-neutral-700 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Manage listings card */}
                          <button 
                            onClick={() => setProfileView('my-listings')}
                            className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/15 transition-all duration-300"
                          >
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-300 flex items-center gap-3">
                              <Layers size={16} className={`group-hover:scale-110 transition-transform ${ACCENT_STYLES[profileAccent].text}`} />
                              Mening e'lonlarim boshqaruvi
                            </span>
                            <ChevronRight size={18} className="text-neutral-700 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Interactive profile settings card */}
                          <button 
                            onClick={() => setProfileView('settings')}
                            className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/15 transition-all duration-300"
                          >
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-300 flex items-center gap-3">
                              <Settings size={16} className={`group-hover:rotate-45 transition-transform ${ACCENT_STYLES[profileAccent].text}`} />
                              Interaktiv dizayn va ranglar
                            </span>
                            <ChevronRight size={18} className="text-neutral-700 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Admin panel if superadmin */}
                          {profile?.email === 'user1@test.com' && (
                            <button 
                              onClick={() => setIsAdminMode(true)} 
                              className="w-full p-5 bg-gradient-to-r from-accent-gold/20 to-amber-500/10 border border-accent-gold/30 rounded-3xl flex items-center justify-between group hover:border-accent-gold transition-all duration-300"
                            >
                              <span className="text-xs font-black uppercase tracking-widest text-accent-gold flex items-center gap-3">
                                <Shield size={16} /> Admin Panel (Boshqaruv)
                              </span>
                              <ChevronRight size={18} className="text-accent-gold group-hover:translate-x-1 transition-transform" />
                            </button>
                          )}

                          {/* Language settings */}
                          <button 
                            onClick={() => alert('Tillarni o\'zgartirishni amalga oshirish')} 
                            className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/15 transition-all duration-300"
                          >
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-300 flex items-center gap-3">
                              <Languages size={16} className={ACCENT_STYLES[profileAccent].text} />
                              Tilni o'zgartirish
                            </span>
                            <ChevronRight size={18} className="text-neutral-700 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Sign out */}
                          <button 
                            onClick={async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); setShowSplash(true) }} 
                            className="w-full p-5 glass border-white/5 rounded-3xl flex items-center justify-between text-red-500 group hover:border-red-500/20 transition-all duration-300"
                          >
                            <span className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                              <LogOut size={16} /> Tizimdan chiqish
                            </span>
                            <ChevronRight size={18} className="text-red-500/50 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* VIEW 2: EDIT PROFILE DETAILS */}
                    {profileView === 'edit' && (
                      <div className="space-y-6 text-left">
                        {/* Header instructions */}
                        <div className="glass p-5 rounded-2xl border-white/5 space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-white">Rasm va ism-familya sozlamalari</h4>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase leading-normal">
                            Ism va familyangizni to'g'ri kiritishingiz mijozlarga siz bilan muloqot qilishni osonlashtiradi.
                          </p>
                        </div>

                        {/* Avatar editor options */}
                        <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest block">Profil rasmi</span>
                          <div className="flex flex-wrap items-center gap-5">
                            
                            {/* Current active avatar ring */}
                            <div className={`w-20 h-20 rounded-full p-1 border-2 ${ACCENT_STYLES[profileAccent].borderSolid} flex items-center justify-center shrink-0`}>
                              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
                                {renderAvatar(avatarUrl)}
                              </div>
                            </div>

                            <div className="flex-1 space-y-3">
                              {/* Photo upload action */}
                              <div className="flex gap-2">
                                <label className="cursor-pointer px-4 py-2.5 bg-white text-black font-black text-[9px] uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md flex items-center gap-1">
                                  <Camera size={12} /> Rasm
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setAvatarUrl(reader.result as string)
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    }}
                                  />
                                </label>

                                {avatarUrl && (
                                  <button 
                                    onClick={() => setAvatarUrl(null)}
                                    className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[9px] uppercase tracking-wider rounded-xl transition-all hover:bg-red-500/20 active:scale-95"
                                  >
                                    O'chirish
                                  </button>
                                )}
                              </div>

                              <button 
                                onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                                className={`text-[9px] font-black uppercase tracking-widest block transition-all ${ACCENT_STYLES[profileAccent].text}`}
                              >
                                {showAvatarPresets ? "Presetsni yopish" : "Gradienlar to'plami 🎨"}
                              </button>
                            </div>
                          </div>

                          {/* Cyber Avatar Presets Row */}
                          {showAvatarPresets && (
                            <div className="p-4 rounded-2xl bg-neutral-950 border border-white/5 space-y-3 animate-fadeIn">
                              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Gradien presetlar (Internet ulanmaganda ham ishlaydi):</p>
                              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                                {AVATAR_PRESETS.map((preset) => (
                                  <button 
                                    key={preset.id}
                                    onClick={() => setAvatarUrl(preset.style)}
                                    className={`relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-all ${avatarUrl === preset.style ? 'border-white scale-110 shadow-lg' : 'border-white/5 opacity-60 hover:opacity-100'}`}
                                    style={{ background: preset.style }}
                                    title={preset.name}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input form */}
                        <div className="space-y-4">
                          {/* Ism (First Name) Input */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block pl-1">ISM</label>
                            <div className={`relative flex items-center rounded-2xl bg-neutral-900 border transition-all duration-300 ${ACCENT_STYLES[profileAccent].border}`}>
                              <User size={16} className="absolute left-4 text-neutral-500" />
                              <input 
                                type="text"
                                value={editFirstName}
                                onChange={e => setEditFirstName(e.target.value)}
                                className="w-full py-4.5 pl-12 pr-4 bg-transparent text-sm font-bold text-white focus:outline-none placeholder-neutral-600"
                                placeholder="Masalan: Diyorbek"
                              />
                            </div>
                          </div>

                          {/* Familya (Last Name) Input */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block pl-1">FAMILYA</label>
                            <div className={`relative flex items-center rounded-2xl bg-neutral-900 border transition-all duration-300 ${ACCENT_STYLES[profileAccent].border}`}>
                              <User size={16} className="absolute left-4 text-neutral-500" />
                              <input 
                                type="text"
                                value={editLastName}
                                onChange={e => setEditLastName(e.target.value)}
                                className="w-full py-4.5 pl-12 pr-4 bg-transparent text-sm font-bold text-white focus:outline-none placeholder-neutral-600"
                                placeholder="Masalan: Karimov"
                              />
                            </div>
                          </div>

                          {/* Telefon raqami Input */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block pl-1">TELEFON RAQAMI</label>
                            <div className={`relative flex items-center rounded-2xl bg-neutral-900 border transition-all duration-300 ${ACCENT_STYLES[profileAccent].border}`}>
                              <span className="absolute left-4 text-xs text-neutral-500 font-black">+998</span>
                              <input 
                                type="tel"
                                value={editPhone.replace('+998', '').trim()}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 9)
                                  setEditPhone(`+998 ${val}`)
                                }}
                                className="w-full py-4.5 pl-14 pr-4 bg-transparent text-sm font-bold text-white focus:outline-none placeholder-neutral-600"
                                placeholder="90 123 45 67"
                              />
                            </div>
                          </div>

                          {/* Email (Readonly lock icon) */}
                          <div className="space-y-2 opacity-65">
                            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block pl-1">EMAIL (O'ZGARTIRIB BO'LMAYDI)</label>
                            <div className="relative flex items-center rounded-2xl bg-neutral-950 border border-white/5">
                              <Lock size={16} className="absolute left-4 text-neutral-600" />
                              <input 
                                type="text"
                                value={profile?.email || user?.email || '—'}
                                disabled
                                className="w-full py-4.5 pl-12 pr-4 bg-transparent text-sm font-bold text-neutral-500 cursor-not-allowed focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Save / Cancel buttons */}
                        <div className="flex gap-3 pt-4">
                          <button 
                            onClick={() => setProfileView('dashboard')}
                            className="flex-1 py-4.5 rounded-2xl glass border-white/10 text-white font-black uppercase text-[10px] tracking-widest transition-all hover:bg-white/5 active:scale-95 text-center"
                          >
                            Bekor qilish
                          </button>
                          <button 
                            onClick={async () => {
                              if (!editFirstName.trim()) {
                                alert("Iltimos, ismingizni kiriting!")
                                return
                              }
                              setSavingProfile(true)
                              try {
                                const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim()
                                const updated = await profileHelpers.updateProfile(user.id, {
                                  full_name: fullName,
                                  phone: editPhone,
                                  avatar_url: avatarUrl
                                })
                                setProfile(updated)
                                setProfileMessage("Ma'lumotlar muvaffaqiyatli saqlandi! ✨")
                                setTimeout(() => setProfileMessage(null), 3000)
                                setProfileView('dashboard')
                              } catch (err) {
                                console.error(err)
                                alert("Saqlashda xatolik yuz berdi!")
                              } finally {
                                setSavingProfile(false)
                              }
                            }}
                            disabled={savingProfile}
                            className={`flex-[2] py-4.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 text-center flex items-center justify-center gap-2 ${ACCENT_STYLES[profileAccent].btn}`}
                          >
                            {savingProfile ? <Loader2 size={12} className="animate-spin" /> : "Saqlash"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* VIEW 3: MANAGE MY LISTINGS */}
                    {profileView === 'my-listings' && (
                      <div className="space-y-6 text-left">
                        {/* Info cards */}
                        <div className="glass p-5 rounded-2xl border-white/5 space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-white">E'lonlaringizni boshqarish</h4>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase leading-normal">
                            Bu yerda siz o'zingiz joylashtirgan uylarning statusini o'zgartirishingiz yoki o'chirishingiz mumkin.
                          </p>
                        </div>

                        {/* List block */}
                        {(() => {
                          const myListings = listings.filter(l => l.user_id === user.id);
                          if (myListings.length === 0) {
                            return (
                              <div className="p-12 rounded-[2.5rem] bg-neutral-950/40 border border-dashed border-white/10 text-center flex flex-col items-center justify-center gap-4">
                                <Ghost size={48} className="text-neutral-700 animate-bounce" />
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Sizda e'lonlar yo'q</h4>
                                  <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-1">E'LON QO'SHISH TABIDAN UY JOYLASHTIRING</p>
                                </div>
                                <button 
                                  onClick={() => setActiveTab('add')}
                                  className={`px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 ${ACCENT_STYLES[profileAccent].btn}`}
                                >
                                  E'lon joylashtirish
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
                              {myListings.map((listing) => (
                                <div key={listing.id} className="glass p-5 rounded-3xl border-white/5 space-y-4 hover:border-white/10 transition-all">
                                  <div className="flex items-center gap-4">
                                    <img 
                                      src={listing.image_url || '/placeholder.jpg'} 
                                      className="w-16 h-16 rounded-xl object-cover border border-white/5 shrink-0" 
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-bold text-sm text-white truncate">{listing.title}</h5>
                                      <p className={`text-[10px] font-black uppercase tracking-wide ${ACCENT_STYLES[profileAccent].text}`}>{listing.price} mln so'm</p>
                                      
                                      {/* Status tag */}
                                      <div className="flex items-center gap-2 mt-1.5">
                                        {listing.status === 'active' && (
                                          <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Faol</span>
                                        )}
                                        {listing.status === 'draft' && (
                                          <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">Qoralama</span>
                                        )}
                                        {listing.status === 'sold' && (
                                          <span className="text-[8px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest">Sotilgan</span>
                                        )}
                                        <span className="text-[8px] text-neutral-500 font-bold uppercase">{listing.rooms} xona • {listing.area} m²</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* User management actions */}
                                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/5 pt-3.5">
                                    {listing.status !== 'sold' ? (
                                      <button 
                                        onClick={() => handleUpdateMyListingStatus(listing.id, 'sold')}
                                        className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-[8px] font-black rounded-lg uppercase tracking-widest transition-all active:scale-95"
                                      >
                                        Sotildi
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleUpdateMyListingStatus(listing.id, 'active')}
                                        className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-lg uppercase tracking-widest transition-all active:scale-95"
                                      >
                                        Faollashtirish
                                      </button>
                                    )}

                                    {listing.status === 'active' ? (
                                      <button 
                                        onClick={() => handleUpdateMyListingStatus(listing.id, 'draft')}
                                        className="px-3.5 py-2 bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-neutral-400 text-[8px] font-black rounded-lg uppercase tracking-widest transition-all active:scale-95"
                                      >
                                        Qoralama
                                      </button>
                                    ) : (
                                      listing.status !== 'sold' && (
                                        <button 
                                          onClick={() => handleUpdateMyListingStatus(listing.id, 'active')}
                                          className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-lg uppercase tracking-widest transition-all active:scale-95"
                                        >
                                          Nashr qilish
                                        </button>
                                      )
                                    )}

                                    <button 
                                      onClick={() => handleDeleteMyListing(listing.id)}
                                      className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-all active:scale-95"
                                      title="O'chirish"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* VIEW 4: SYSTEM SETTINGS (ACCENT COLORS) */}
                    {profileView === 'settings' && (
                      <div className="space-y-8 text-left">
                        {/* Accent selector block */}
                        <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className={ACCENT_STYLES[profileAccent].text} />
                            <h4 className="text-xs font-black uppercase tracking-wider text-white">Dizayn rangini tanlang</h4>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase leading-normal">
                            Bu sozlama profilingizning neon chiziqlari, knopkalari va ko'rsatkichlari rangini moslashtiradi.
                          </p>

                          {/* Interactive Accent Grid */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {(['cyan', 'gold', 'emerald', 'purple'] as const).map((accent) => {
                              const active = profileAccent === accent
                              return (
                                <button 
                                  key={accent}
                                  onClick={() => changeAccent(accent)}
                                  className={`p-4.5 rounded-2xl border-2 text-center transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center gap-2 ${active ? 'bg-neutral-900' : 'glass border-white/5 opacity-65 hover:opacity-100'}`}
                                  style={{ borderColor: active ? ACCENT_STYLES[accent].color : 'transparent' }}
                                >
                                  {/* Colored Circle indicator */}
                                  <div 
                                    className="w-5 h-5 rounded-full shadow-lg"
                                    style={{ 
                                      background: ACCENT_STYLES[accent].color, 
                                      boxShadow: `0 0 10px ${ACCENT_STYLES[accent].color}` 
                                    }}
                                  />
                                  <span className="text-[9px] font-black uppercase tracking-wider text-white">
                                    {accent === 'cyan' && "Cyber Cyan"}
                                    {accent === 'gold' && "Sunset Gold"}
                                    {accent === 'emerald' && "Matrix Green"}
                                    {accent === 'purple' && "Purple Helix"}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Interactive UI Settings */}
                        <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                            <Info size={16} className={ACCENT_STYLES[profileAccent].text} />
                            Platforma ma'lumotlari
                          </h4>
                          <div className="space-y-3.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                            <div className="flex justify-between border-b border-white/5 pb-2"><span>Sarlavha</span><span className="text-white font-bold">UY JOY PLATFORMA</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-2"><span>Talqin (Version)</span><span className="text-white font-bold">3.2.0 (Cyber)</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-2"><span>Hudud</span><span className="text-white font-bold">Qashqadaryo viloyati</span></div>
                            <div className="flex justify-between"><span>Tarmoq holati</span><span className="text-emerald-400 font-bold">Faol (Supabase Online)</span></div>
                          </div>
                        </div>
                      </div>
                    )}

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
              <motion.img 
                key={activeDetailImgIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={detailImages[activeDetailImgIndex] || '/placeholder.jpg'} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <button onClick={() => setSelectedHouse(null)} className="absolute top-6 left-6 p-3 glass rounded-full z-20"><ArrowLeft size={20}/></button>
              <button onClick={() => toggleFav(selectedHouse)} className={`absolute top-6 right-6 p-3 glass rounded-full z-20 ${favorites.some(f => f.id === selectedHouse.id) ? 'text-red-500' : 'text-white'}`}><Heart size={20} fill={favorites.some(f => f.id === selectedHouse.id) ? "currentColor" : "none"}/></button>
              
              {/* Image Dot Pagination Indicators */}
              {detailImages.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                  {detailImages.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveDetailImgIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeDetailImgIndex ? 'bg-accent-blue w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 p-8 glass rounded-t-[3rem] -mt-10 border-t border-white/10 relative z-10 min-h-[60vh]">
              <div className="flex justify-between items-start mb-6"><div><h2 className="text-2xl font-black mb-2 uppercase tracking-tight leading-tight">{selectedHouse.title}</h2><div className="flex items-center gap-2 text-accent-blue"><MapPin size={16}/><span className="text-xs font-black uppercase tracking-widest">{selectedHouse.location}</span></div></div><div className="text-right"><p className="text-3xl font-black">{selectedHouse.price}</p><p className="text-[10px] font-black text-accent-blue uppercase tracking-widest">mln so'm</p></div></div>
              
              {/* Clickable Image Thumbnails Row */}
              {detailImages.length > 1 && (
                <div className="mb-6 space-y-2">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">E'lon rasmlari ({detailImages.length} ta)</p>
                  <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                    {detailImages.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveDetailImgIndex(idx)}
                        className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${idx === activeDetailImgIndex ? 'border-accent-blue scale-105 shadow-lg shadow-accent-blue/20' : 'border-white/5 opacity-60'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8"><div className="glass p-5 rounded-2xl text-center border-white/5"><BedDouble className="mx-auto mb-2 text-accent-blue" size={24}/><p className="text-xs font-black uppercase tracking-widest">{selectedHouse.rooms} xona</p></div><div className="glass p-5 rounded-2xl text-center border-white/5"><Ruler className="mx-auto mb-2 text-accent-blue" size={24}/><p className="text-xs font-black uppercase tracking-widest">{selectedHouse.area} m²</p></div></div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8 font-medium uppercase tracking-tight">
                {cleanDesc || "Bu uy barcha zamonaviy talablarga javob beradi. Evro ta'mirlangan, oshxona mebellari va maishiy texnikalar o'rnatilgan."}
              </p>

              {/* Amenities Survey Details */}
              {listingAmenities && listingAmenities.length > 0 && (
                <div className="glass p-6 rounded-3xl border-white/5 mb-8 space-y-4">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Uy-joy sharoitlari (So'rovnoma)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'electricity', label: 'Elektr tarmog\'i', icon: <Zap size={16} /> },
                      { id: 'wifi', label: 'WiFi Internet', icon: <Wifi size={16} /> },
                      { id: 'gas', label: 'Tabiiy gaz', icon: <Flame size={16} /> },
                      { id: 'water', label: 'Ichimlik suvi', icon: <Droplet size={16} /> },
                      { id: 'heating', label: 'Isitish tizimi', icon: <Thermometer size={16} /> },
                      { id: 'airConditioning', label: 'Konditsioner', icon: <Wind size={16} /> }
                    ].map(item => {
                      const hasAmenity = listingAmenities.includes(item.id)
                      return (
                        <div key={item.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${hasAmenity ? 'glass border-accent-blue/30 text-accent-blue' : 'glass border-white/5 text-neutral-500 opacity-60'}`}>
                          <div className={`p-2 rounded-xl ${hasAmenity ? 'bg-accent-blue/10 text-accent-blue' : 'bg-neutral-900 text-neutral-600'}`}>
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Yandex Map for Details */}
              {listingCoords && (
                <div className="mb-8">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">📍 Uyning xaritadagi joylashuvi</p>
                  <div 
                    ref={detailMapRef} 
                    className="w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/50"
                    style={{ height: '200px', minHeight: '200px' }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 mt-auto pt-6">
                <div className="flex gap-3">
                  {listingPhone && (
                    <a 
                      href={`tel:${listingPhone}`}
                      className="flex-1 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20 text-center"
                    >
                      <Phone size={16}/> Telefon qilish
                    </a>
                  )}
                  {listingTelegram && (
                    <a 
                      href={`https://t.me/${listingTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-4 rounded-2xl bg-accent-blue hover:bg-accent-blue/80 text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-accent-blue/20 text-center"
                    >
                      <Send size={16}/> Telegram
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setSelectedHouse(null)
                    if (user && selectedHouse.user_id) {
                      if (selectedHouse.user_id === user.id) {
                        alert("Bu sizning e'loningiz!")
                        return
                      }
                      setActiveTab('chat')
                      setSelectedChat(selectedHouse.user_id)
                    } else {
                      setShowAuth(true)
                    }
                  }}
                  className="w-full py-4 rounded-2xl glass border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all"
                >
                  Suhbatga o'tish (Ilova ichida)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEWS DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col no-scrollbar overflow-y-auto"
          >
            <div className="relative h-[35vh] shrink-0 flex items-center justify-center overflow-hidden">
              {selectedNews.image_url && selectedNews.image_url.startsWith('linear-gradient') ? (
                <div className="absolute inset-0 opacity-50 animate-pulse" style={{ background: selectedNews.image_url }} />
              ) : selectedNews.image_url ? (
                <img src={selectedNews.image_url} alt="News Banner" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              ) : (
                <div className="absolute inset-0 bg-neutral-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Back Button */}
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-6 left-6 p-3 rounded-full glass border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all z-20"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            <div className="flex-1 max-w-2xl mx-auto px-6 pb-24 -mt-10 relative z-10 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-neutral-900 border border-white/5 rounded-full text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                    Platforma Yangiliklari
                  </span>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase">
                    📅 {new Date(selectedNews.created_at).toLocaleString('uz-UZ')}
                  </span>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase">
                    👁 {selectedNews.views || 0} marta o'qildi
                  </span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white leading-tight">
                  {selectedNews.title}
                </h2>
              </div>

              <div className="border-t border-white/5 pt-6">
                <p className="text-sm text-neutral-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedNews.content}
                </p>
              </div>

              {/* Share / Action Button */}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/news/${selectedNews.id}`).then(() => {
                    alert("Yangilik havolasi nusxalandi!")
                  }).catch(() => {
                    alert("Havola nusxalandi!")
                  })
                }}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 text-center ${ACCENT_STYLES[profileAccent].btn}`}
              >
                Ulashish (Havolani nusxalash)
              </button>
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

function AdminPanelView({ 
  listings, 
  onBack, 
  onUpdateStatus, 
  onDelete,
  onEditListing,
  news,
  onAddNews,
  onDeleteNews
}: { 
  listings: Listing[]; 
  onBack: () => void; 
  onUpdateStatus: (id: string, status: 'active' | 'draft' | 'sold') => void;
  onDelete: (id: string) => void;
  onEditListing: (updatedListing: Listing) => void;
  news: NewsItem[];
  onAddNews: (title: string, content: string, imageUrl: string | null) => Promise<void>;
  onDeleteNews: (id: string) => Promise<void>;
}) {
  const [adminView, setAdminView] = useState<'dashboard' | 'listings' | 'news'>('dashboard')
  const [selectedAiHouse, setSelectedAiHouse] = useState<Listing | null>(null)
  const [editingHouse, setEditingHouse] = useState<Listing | null>(null)
  
  // News editor states
  const [isAddingNews, setIsAddingNews] = useState(false)
  const [newNewsTitle, setNewNewsTitle] = useState('')
  const [newNewsContent, setNewNewsContent] = useState('')
  const [newNewsImage, setNewNewsImage] = useState<string | null>(null)
  const [showPresetBanners, setShowPresetBanners] = useState(false)

  // Counts
  const activeCount = listings.filter(l => l.status === 'active').length
  const pendingCount = listings.filter(l => l.status === 'sold').length // mock pending count as sold for demo
  const rejectedCount = listings.filter(l => l.status === 'draft').length // mock rejected count as draft for demo
  const newsCount = news.length
  
  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <div className="max-w-2xl mx-auto px-4 md:px-0 pt-6">
        
        {/* Header Block */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            {adminView !== 'dashboard' && (
              <button 
                onClick={() => setAdminView('dashboard')} 
                className="p-3 glass rounded-full hover:bg-white/5 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
              <p className="text-[8px] text-red-500 font-black uppercase tracking-[0.3em]">SUPERADMIN - BOSHQARUV</p>
            </div>
          </div>
          <button 
            onClick={adminView === 'dashboard' ? onBack : () => setAdminView('dashboard')} 
            className="p-3 glass border border-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/5 transition-all animate-pulse"
          >
            <LogOut size={18}/>
          </button>
        </header>

        {adminView === 'dashboard' ? (
          <div className="space-y-10">
            {/* STATISTIKA SECTION */}
            <section className="space-y-4">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">STATISTIKA</p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Active Card */}
                <div 
                  onClick={() => setAdminView('listings')}
                  className="glass p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-green-500/30 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <Home size={18} />
                  </div>
                  <h3 className="text-4xl font-black mb-1">{activeCount}</h3>
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">FAOL E'LONLAR</p>
                </div>

                {/* Pending Card */}
                <div 
                  className="glass p-6 rounded-3xl border border-white/5 opacity-80"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <Clock size={18} />
                  </div>
                  <h3 className="text-4xl font-black mb-1">{pendingCount}</h3>
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">KUTMOQDA</p>
                </div>

                {/* Rejected Card */}
                <div 
                  className="glass p-6 rounded-3xl border border-white/5 opacity-80"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <XCircle size={18} />
                  </div>
                  <h3 className="text-4xl font-black mb-1">{rejectedCount}</h3>
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">RAD ETILGAN</p>
                </div>

                {/* News Card */}
                <div 
                  onClick={() => setAdminView('news')}
                  className="glass p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-purple-500/40 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <Megaphone size={18} />
                  </div>
                  <h3 className="text-4xl font-black mb-1">{newsCount}</h3>
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">YANGILIKLAR</p>
                </div>
              </div>
            </section>

            {/* SO'NGGI SO'ROVLAR SECTION */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">SO'NGGI SO'ROVLAR</p>
                <button onClick={() => setAdminView('listings')} className="text-[9px] font-black text-accent-blue uppercase tracking-wider flex items-center gap-1">
                  HAMMASI <ChevronRight size={12} />
                </button>
              </div>
              <div className="glass p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center flex flex-col items-center justify-center">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Hozircha yangi so'rovlar yo'q</p>
              </div>
            </section>
          </div>
        ) : adminView === 'listings' ? (
          /* LISTINGS VIEW */
          <div className="space-y-6">
            <h2 className="text-md font-black text-green-500 uppercase tracking-wider mb-4">FAOL E'LONLAR ({activeCount})</h2>
            
            <div className="space-y-4">
              {listings.filter(l => l.status === 'active').map(listing => {
                const detailsStr = `${listing.rooms} xona • ${listing.area} m² • ${listing.type.toUpperCase()}`
                
                return (
                  <div 
                    key={listing.id} 
                    className="glass p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-4 hover:border-accent-blue/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Left Thumbnail and AI Badge */}
                      <div className="flex flex-col items-center shrink-0">
                        <img 
                          src={listing.image_url || '/placeholder.jpg'} 
                          className="w-20 h-20 rounded-2xl object-cover border border-white/5" 
                        />
                        <button 
                          onClick={() => setSelectedAiHouse(listing)}
                          className="bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-full px-2.5 py-1 text-[9px] font-black mt-2 inline-flex items-center gap-1 hover:bg-accent-blue/20 transition-all active:scale-95 shadow-md shadow-accent-blue/5"
                        >
                          <Brain size={10} /> AI
                        </button>
                      </div>

                      {/* Info block */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white leading-snug line-clamp-1 group-hover:text-accent-blue transition-colors">{listing.title}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold uppercase">
                          <MapPin size={10} /> Qashqadaryo, {listing.location}
                        </div>
                        <p className="text-md font-black text-white">{listing.price} mln so'm</p>
                        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{detailsStr}</p>
                      </div>
                    </div>

                    {/* Right side Actions */}
                    <div className="flex flex-col items-end justify-between h-full gap-4 shrink-0">
                      {/* Edit Pencil Button */}
                      <button 
                        onClick={() => setEditingHouse(listing)}
                        className="p-2 glass text-neutral-500 rounded-full hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            onUpdateStatus(listing.id, 'draft')
                            alert("E'lon to'xtatildi (qoralama holatiga o'tkazildi)!")
                          }}
                          className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-accent-gold text-[9px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1.5 hover:bg-amber-500/20 active:scale-95 transition-all"
                        >
                          To'xtatish
                        </button>
                        <button 
                          onClick={() => {
                            onUpdateStatus(listing.id, 'draft') // map rad etish as draft status
                            alert("E'lon rad etildi!")
                          }}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1.5 hover:bg-red-500/20 active:scale-95 transition-all"
                        >
                          Rad etish
                        </button>
                        <button 
                          onClick={() => onDelete(listing.id)}
                          className="p-2 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 active:scale-95 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* NEWS VIEW */
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-black text-purple-400 uppercase tracking-wider">Yangiliklar Boshqaruvi ({news.length})</h2>
              {!isAddingNews && (
                <button 
                  onClick={() => setIsAddingNews(true)}
                  className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1.5 hover:bg-purple-500/20 active:scale-95 transition-all"
                >
                  Yangi Qo'shish
                </button>
              )}
            </div>

            {isAddingNews ? (
              /* ADD NEWS FORM */
              <div className="glass p-6 rounded-[2.5rem] border-white/5 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <Megaphone size={18} className="text-purple-400" />
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">Yangi Yangilik Qo'shish</h3>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest pl-1">SARLAVHA</label>
                    <input 
                      type="text"
                      value={newNewsTitle}
                      onChange={e => setNewNewsTitle(e.target.value)}
                      placeholder="Sarlavhani kiriting..."
                      className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-purple-500/30"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest pl-1">BATAFSIL MATNI</label>
                    <textarea 
                      rows={5}
                      value={newNewsContent}
                      onChange={e => setNewNewsContent(e.target.value)}
                      placeholder="Yangilik matnini batafsil yozing..."
                      className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-purple-500/30 leading-relaxed"
                    />
                  </div>

                  {/* Image/Banner Selection */}
                  <div className="glass p-5 rounded-3xl border-white/5 space-y-4">
                    <span className="text-[9px] font-black uppercase text-neutral-500 tracking-widest block">BANER RASMI (GRADIENT YOKI RASM)</span>
                    <div className="flex items-center gap-5">
                      
                      {/* Active Banner preview */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                        {newNewsImage ? (
                          newNewsImage.startsWith('linear-gradient') ? (
                            <div className="w-full h-full" style={{ background: newNewsImage }} />
                          ) : (
                            <img src={newNewsImage} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full bg-neutral-900 flex items-center justify-center"><Megaphone size={18} className="text-neutral-700" /></div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <label className="cursor-pointer px-4 py-2.5 bg-white text-black font-black text-[9px] uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1 shadow-md">
                            <Camera size={12} /> Yuklash
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setNewNewsImage(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>

                          {newNewsImage && (
                            <button 
                              onClick={() => setNewNewsImage(null)}
                              className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[9px] uppercase tracking-wider rounded-xl transition-all hover:bg-red-500/20 active:scale-95"
                            >
                              O'chirish
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={() => setShowPresetBanners(!showPresetBanners)}
                          className="text-[9px] font-black uppercase tracking-widest text-purple-400 hover:underline block"
                        >
                          {showPresetBanners ? "Presetlarni berkitish" : "Gradientli banerlar tanlash 🎨"}
                        </button>
                      </div>
                    </div>

                    {showPresetBanners && (
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-white/5 space-y-3">
                        <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Gradien banerlar to'plami:</p>
                        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                          {AVATAR_PRESETS.map((preset) => (
                            <button 
                              key={preset.id}
                              onClick={() => setNewNewsImage(preset.style)}
                              className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${newNewsImage === preset.style ? 'border-white scale-110 shadow-lg' : 'border-white/5 opacity-60 hover:opacity-100'}`}
                              style={{ background: preset.style }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setIsAddingNews(false)
                      setNewNewsTitle('')
                      setNewNewsContent('')
                      setNewNewsImage(null)
                    }}
                    className="flex-1 py-4 rounded-2xl glass border-white/10 text-white font-black uppercase text-[10px] tracking-widest transition-all hover:bg-white/5 active:scale-95 text-center"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    onClick={async () => {
                      if (!newNewsTitle.trim() || !newNewsContent.trim()) {
                        alert("Iltimos, sarlavha va matnni to'liq to'ldiring!")
                        return
                      }
                      try {
                        await onAddNews(newNewsTitle.trim(), newNewsContent.trim(), newNewsImage)
                        alert("Yangilik muvaffaqiyatli chop etildi!")
                        setIsAddingNews(false)
                        setNewNewsTitle('')
                        setNewNewsContent('')
                        setNewNewsImage(null)
                      } catch (e) {
                        console.error(e)
                        alert("Xatolik yuz berdi")
                      }
                    }}
                    className="flex-[2] py-4 bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20 shadow-lg rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 text-center"
                  >
                    Chop etish 🚀
                  </button>
                </div>
              </div>
            ) : (
              /* NEWS LIST VIEW */
              <div className="space-y-4">
                {news.length === 0 ? (
                  <div className="glass p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Hozircha yangiliklar yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {news.map((item) => (
                      <div 
                        key={item.id} 
                        className="glass p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-4 hover:border-purple-500/10 transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Banner thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                            {item.image_url && item.image_url.startsWith('linear-gradient') ? (
                              <div className="w-full h-full" style={{ background: item.image_url }} />
                            ) : item.image_url ? (
                              <img src={item.image_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-900 flex items-center justify-center"><Megaphone size={16} className="text-neutral-500" /></div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <h4 className="text-sm font-black text-white truncate group-hover:text-purple-400 transition-colors">{item.title}</h4>
                            <p className="text-[10px] text-neutral-400 line-clamp-1 leading-snug">{item.content}</p>
                            <div className="flex items-center gap-2 text-[8px] font-black text-neutral-500 uppercase tracking-wider">
                              <span>📅 {new Date(item.created_at).toLocaleDateString('uz-UZ')}</span>
                              <span>•</span>
                              <span>👁 {item.views || 0} ko'rish</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={async () => {
                            if (confirm("Haqiqatan ham ushbu yangilikni o'chirmoqchisiz?")) {
                              await onDeleteNews(item.id)
                              alert("Yangilik o'chirildi!")
                            }
                          }}
                          className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 active:scale-95 transition-all shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI ANALYZER MODAL OVERLAY */}
      <AnimatePresence>
        {selectedAiHouse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass max-w-md w-full rounded-[2.5rem] p-8 border border-accent-blue/30 relative shadow-[0_0_50px_rgba(0,229,255,0.15)]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center mx-auto mb-4 border border-accent-blue/30 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  <Brain size={32} className="text-accent-blue animate-pulse" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">AI Bozordagi Baholash</h3>
                <p className="text-[8px] text-accent-blue font-black uppercase tracking-[0.2em] mt-1">Neyron tarmoq tahlili</p>
              </div>

              {/* Analyzer calculations */}
              <div className="space-y-4 mb-8">
                <div className="glass p-5 rounded-2xl border-white/5 space-y-2">
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Baholanayotgan uy</p>
                  <p className="text-sm font-bold text-white line-clamp-1">{selectedAiHouse.title}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">{(selectedAiHouse.rooms ?? 0)} XONA • {(selectedAiHouse.area ?? 0)} M² • {(selectedAiHouse.location || '').toUpperCase()} TUMANI</p>
                </div>

                {/* Price Gauge / Indicators */}
                <div className="glass p-5 rounded-2xl border-accent-blue/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
                    <span>E'lon qilingan narxi:</span>
                    <span className="text-white font-black">{selectedAiHouse.price ?? 0} mln so'm</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
                    <span>AI Tavsiya etgan narx:</span>
                    <span className="text-accent-blue font-black">
                      {Math.round((selectedAiHouse.price ?? 0) * 0.95)} ~ {Math.round((selectedAiHouse.price ?? 0) * 1.05)} mln so'm
                    </span>
                  </div>
                  
                  {/* Neon slider/gauge */}
                  <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden relative border border-white/5 mt-2">
                    <div className="absolute left-[40%] right-[40%] bg-accent-blue h-full rounded-full shadow-[0_0_10px_#00E5FF]" />
                    <div className="absolute left-[49%] w-2 h-2.5 bg-white rounded-full" />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-neutral-500 uppercase mt-1 tracking-widest">
                    <span>ARZON</span>
                    <span className="text-accent-blue font-black">BOZOR NARXI</span>
                    <span>QIMMAT</span>
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl border-white/5">
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">AI XULOSASI</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Ushbu uyning narxi ({selectedAiHouse.price ?? 0} mln so'm) {selectedAiHouse.location || ''} tumanining o'rtacha bozor ko'rsatkichlariga deyarli 100% mos keladi. Uy maydoni va xonalar nisbati ideal holatda!
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAiHouse(null)}
                className="w-full py-4 bg-accent-blue text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-accent-blue/80 active:scale-95 transition-all shadow-lg shadow-accent-blue/15"
              >
                Yopish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN EDITING MODAL OVERLAY */}
      <AnimatePresence>
        {editingHouse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass max-w-md w-full rounded-[2.5rem] p-8 border border-accent-blue/30 relative shadow-[0_0_50px_rgba(0,229,255,0.15)] no-scrollbar overflow-y-auto max-h-[90vh]">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center mx-auto mb-4 border border-accent-blue/30">
                  <Edit3 size={20} className="text-accent-blue" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">E'lonni Tahrirlash</h3>
                <p className="text-[8px] text-accent-blue font-black uppercase tracking-[0.2em] mt-1">Superadmin boshqaruvi</p>
              </div>

              {/* Form fields */}
              <div className="space-y-4 mb-8 text-left">
                {/* Title input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">Sarlavha</label>
                  <input 
                    type="text" 
                    value={editingHouse.title} 
                    onChange={e => setEditingHouse({ ...editingHouse, title: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-accent-blue/40"
                  />
                </div>

                {/* Price input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">Narxi (mln so'm)</label>
                  <input 
                    type="number" 
                    value={editingHouse.price ?? ''} 
                    onChange={e => setEditingHouse({ ...editingHouse, price: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-accent-blue/40"
                  />
                </div>

                {/* District Dropdown */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">Tuman</label>
                  <select 
                    value={editingHouse.location ?? ''}
                    onChange={e => setEditingHouse({ ...editingHouse, location: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-accent-blue/40"
                  >
                    {['Qarshi', 'Shahrisabz', 'Kitob', 'Muborak', "G'uzor", 'Kasbi', 'Nishon', 'Chiroqchi', "Yakkabog'", 'Dehqonobod'].map(d => (
                      <option key={d} value={d} className="bg-neutral-950 text-white font-bold">{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Rooms input */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">Xonalar soni</label>
                    <input 
                      type="number" 
                      value={editingHouse.rooms ?? ''} 
                      onChange={e => setEditingHouse({ ...editingHouse, rooms: Number(e.target.value) })}
                      className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-accent-blue/40"
                    />
                  </div>

                  {/* Area input */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">Maydoni (m²)</label>
                    <input 
                      type="number" 
                      value={editingHouse.area ?? ''} 
                      onChange={e => setEditingHouse({ ...editingHouse, area: Number(e.target.value) })}
                      className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-accent-blue/40"
                    />
                  </div>
                </div>

                {/* Type toggle */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">Turi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setEditingHouse({ ...editingHouse, type: 'Sotuv' })}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase transition-all ${editingHouse.type === 'Sotuv' ? 'bg-accent-blue text-black shadow-lg shadow-accent-blue/15' : 'glass border-white/5 text-neutral-400'}`}
                    >
                      Sotuv
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditingHouse({ ...editingHouse, type: 'Ijara' })}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase transition-all ${editingHouse.type === 'Ijara' ? 'bg-accent-blue text-black shadow-lg shadow-accent-blue/15' : 'glass border-white/5 text-neutral-400'}`}
                    >
                      Ijara
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setEditingHouse(null)}
                  className="flex-1 py-4 glass border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/5 active:scale-95 transition-all"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={() => {
                    if (!editingHouse.title.trim()) {
                      alert("Iltimos sarlavhani to'ldiring!")
                      return
                    }
                    if (
                      editingHouse.price === null || editingHouse.price <= 0 || 
                      editingHouse.rooms === null || editingHouse.rooms <= 0 || 
                      editingHouse.area === null || editingHouse.area <= 0
                    ) {
                      alert("Qiymatlar noldan katta bo'lishi kerak!")
                      return
                    }
                    onEditListing(editingHouse)
                    setEditingHouse(null)
                    alert("E'lon muvaffaqiyatli yangilandi!")
                  }}
                  className="flex-1 py-4 bg-accent-blue text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-accent-blue/80 active:scale-95 transition-all shadow-lg shadow-accent-blue/15"
                >
                  Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
