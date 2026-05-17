export default function Loading() {
  return (
    <div className="min-h-dvh bg-[#05050f] flex flex-col items-center justify-center gap-6 p-6">
      {/* Central glowing icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-xl border-2 border-[var(--accent-cyan)] animate-spin [animation-duration:3s]" />
        <div className="absolute inset-0 w-16 h-16 rounded-xl border-2 border-[var(--accent-purple)] animate-reverse-spin [animation-duration:2s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-[var(--accent-cyan)] rounded-full animate-pulse shadow-[0_0_15px_var(--accent-cyan)]" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold tracking-widest text-[var(--text-primary)]">
          <span className="text-[var(--accent-cyan)]">UY</span>OLAMIZ
        </h2>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-[var(--accent-cyan)] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Tizim yuklanmoqda...
      </p>

    </div>
  )
}
