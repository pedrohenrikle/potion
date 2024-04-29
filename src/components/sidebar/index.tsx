import * as Collapsible from '@radix-ui/react-collapsible'
import * as Navigation from './navigation'
import { CaretDoubleLeft } from '@phosphor-icons/react'
import { CreatePage } from './create-page'
import { Profile } from './profile'
import { Search } from './search'
import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api'
import { Document } from '@/@types/document'

export function Sidebar() {
  const { data, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response: Document[] = await invoke('get_documents', {
        dbUrl: 'sqlite://../sqlite.db',
      })
      return response
    },
  })

  function handleRefetch() {
    refetch()
  }

  return (
    <Collapsible.Content className="bg-potion-800 flex-shrink-0 border-r border-potion-600 h-screen relative group data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut overflow-hidden">
      <Collapsible.Trigger className="absolute h-5 w-5 right-4 text-potion-200 hover:text-potion-50 flex items-center mt-6 mr-3 justify-center">
        <CaretDoubleLeft className="h-4 w-4" />
      </Collapsible.Trigger>

      <div className="region-drag h-14 hidden"></div>

      <div className="flex-1 pt-6 flex flex-col gap-8 h-full w-[240px] group-data-[state=open]:opacity-100 group-data-[state=closed]:opacity-0 transition-opacity duration-200">
        <Profile />
        <Search />

        <Navigation.Root>
          <Navigation.Section>
            <Navigation.SectionTitle>Workspace</Navigation.SectionTitle>
            <Navigation.SectionContent>
              {data?.map((document) => (
                <Navigation.Link
                  key={document.id}
                  to={`/documents/${document.id}`}
                  handleRefetch={handleRefetch}
                >
                  {document.title}
                </Navigation.Link>
              ))}
            </Navigation.SectionContent>
          </Navigation.Section>
        </Navigation.Root>

        <CreatePage handleRefetch={handleRefetch} />
      </div>
    </Collapsible.Content>
  )
}
