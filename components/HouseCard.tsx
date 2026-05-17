'use client'

import { motion } from 'framer-motion'
import { MapPin, Heart, ArrowRight, Star, Ruler, BedDouble } from 'lucide-react'
import { type Listing } from '@/lib/supabase'

interface HouseCardProps {
  listing: Listing
  index: number
  isFavorite?: boolean
  onToggleFavorite?: (listing: Listing) => void
  onClick?: (listing: Listing) => void
}

export function HouseCard({ listing, index, isFavorite, onToggleFavorite, onClick }: HouseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-accent-blue/30 transition-all duration-500 shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden" onClick={() => onClick?.(listing)}>
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.8 }}
          src={listing.image_url || '/placeholder.jpg'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-5 left-5 flex gap-2">
          {(listing.price ?? 0) > 300 && (
            <div className="px-3 py-1 bg-accent-gold text-black text-[9px] font-black rounded-lg flex items-center gap-1 shadow-xl">
              <Star size={10} fill="currentColor" /> TOP
            </div>
          )}
          <div className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-black rounded-lg border border-white/10 uppercase tracking-widest">
            {listing.type}
          </div>
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(listing); }}
          className={`absolute top-5 right-5 p-3 rounded-2xl glass transition-all duration-300 ${isFavorite ? 'text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-white hover:text-red-400'}`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-6 cursor-pointer" onClick={() => onClick?.(listing)}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-black text-white leading-tight mb-2 group-hover:text-accent-blue transition-colors line-clamp-1 uppercase tracking-tight">
              {listing.title}
            </h3>
            <div className="flex items-center gap-2 text-neutral-500">
              <MapPin size={14} className="text-accent-blue" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{listing.location}</span>
            </div>
          </div>
          <div className="text-right pl-4">
            <p className="text-xl font-black text-white tracking-tighter">{listing.price || 0}</p>
            <p className="text-[9px] font-black text-accent-blue uppercase tracking-widest">mln so'm</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <BedDouble size={16} className="text-accent-blue" />
            <span className="text-xs font-bold text-neutral-300">{listing.rooms} xona</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <Ruler size={16} className="text-accent-blue" />
            <span className="text-xs font-bold text-neutral-300">{listing.area} m²</span>
          </div>
        </div>

        <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-accent-blue hover:text-black transition-all group/btn">
          Ko'rish <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  )
}
