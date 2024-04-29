import clsx from 'clsx'
import { DotsThree } from '@phosphor-icons/react'
import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface LinkProps {
  to: string
  children: ReactNode
  handleRefetch: () => void
}

export function Link({ to, children, handleRefetch }: LinkProps) {
  return (
    <NavLink
      to={to}
      onClick={handleRefetch}
      className={({ isActive }) => {
        return clsx(
          'flex items-center text-sm gap-2 text-potion-100 hover:text-potion-50 py-1 px-3 rounded group hover:bg-potion-700',
          {
            'bg-potion-700': isActive,
          },
        )
      }}
    >
      <span className="truncate flex-1">{children}</span>

      <div className="flex items-center h-full group-hover:visible ml-auto text-potion-100">
        <button className="px-px rounded-sm hover:bg-potion-5000">
          <DotsThree weight="bold" className="h-4 w-4" />
        </button>
      </div>
    </NavLink>
  )
}
