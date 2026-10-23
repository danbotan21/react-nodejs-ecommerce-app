import { Star } from 'lucide-react'

// Shows a rating; pass onChange to make it clickable
export default function Stars({ value, size = 16, onChange }) {
  return (
    <span className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = (
          <Star
            size={size}
            className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}
          />
        )
        return onChange ? (
          <button key={n} type='button' onClick={() => onChange(n)} title={`${n} star${n > 1 ? 's' : ''}`}>
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        )
      })}
    </span>
  )
}
