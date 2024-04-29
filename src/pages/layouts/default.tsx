import * as Collapsible from '@radix-ui/react-collapsible'

import { Outlet } from 'react-router-dom'
import { Header } from '../../components/header'
import { Sidebar } from '../../components/sidebar'
import { useState } from 'react'

export function Default(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <Collapsible.Root
      onOpenChange={setIsSidebarOpen}
      defaultOpen
      className="h-screen w-screen text-potion-100 flex"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col max-h-screen">
        <Header isSidebarOpen={isSidebarOpen} />
        <Outlet />
      </div>
    </Collapsible.Root>
  )
}
