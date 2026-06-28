import { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

const variants = {
  primary: 'bg-harbor text-white hover:bg-teal-800 border-harbor',
  secondary: 'bg-white text-ink hover:bg-slate-50 border-slate-200',
  ghost: 'bg-transparent text-ink hover:bg-white/70 border-transparent',
  danger: 'bg-coral text-white hover:bg-red-600 border-coral',
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
