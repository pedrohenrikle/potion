import { ReactNode } from 'react'

interface RootProps {
  children: ReactNode
}

export function Root(props: RootProps) {
  return <nav className="flex mx-2 flex-col gap-8 text-potion-100" {...props} />
}
