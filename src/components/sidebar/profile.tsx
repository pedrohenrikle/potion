import { User } from '@phosphor-icons/react'

export function Profile() {
  const isAuthenticated = true

  if (!isAuthenticated) {
    return (
      <button className="text-potion-100 flex mx-5 items-center gap-2 text-sm font-medium group">
        <div className="h-5 w-5 rounded-sm bg-potion-500 p-1">
          <User className="h-3 w-3 text-potion-300" />
        </div>
        Fazer login
      </button>
    )
  }

  return (
    <button className="text-potion-50 flex mx-5 items-center gap-2 text-sm font-medium group">
      <img
        className="h-5 w-5 rounded-sm"
        src="https://github.com/pedrohenrikle.png"
        alt=""
      />
      Pedro Klein
    </button>
  )
}
