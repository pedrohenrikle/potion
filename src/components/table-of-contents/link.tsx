import { ReactNode } from 'react'

interface ToCLinkProps {
  children: ReactNode
  href: string
}

export function ToCLink({ children, href }: ToCLinkProps) {
  return (
    <a href={href} className="hover:text-potion-50 transition-all duration-300">
      {children}
    </a>
  )
}
