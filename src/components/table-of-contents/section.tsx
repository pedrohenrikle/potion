import { ReactNode } from 'react'

interface ToCSectionProps {
  children: ReactNode
  level: number
}

export function ToCSection({ children, level }: ToCSectionProps) {
  return <div className={`flex flex-col gap-2 px-${level}`}>{children}</div>
}
