import { Command } from 'cmdk'
import { MagnifyingGlass, File } from '@phosphor-icons/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api'
import { Document } from '@/@types/document'

interface SearchBarProps {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function SearchBar({ open, onOpenChange }: SearchBarProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange, open])

  const { data } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response: Document[] = await invoke('get_documents', {
        dbUrl: 'sqlite://../sqlite.db',
      })
      return response
    },
  })

  function handleOpenDocument(id: string) {
    navigate(`/documents/${id}`)
    onOpenChange(false)
  }

  return (
    <Command.Dialog
      className="fixed top-24 left-1/2 -translate-x-1/2 w-[480px] max-w-full bg-potion-800 rounded-md shadow-2xl text-potion-100 border border-potion-600"
      open={open}
      onOpenChange={onOpenChange}
      label="Search"
    >
      <div className="flex items-center gap-2 border-b border-potion-700 p-4">
        <MagnifyingGlass className="w-5 h-5" />
        <Command.Input
          autoFocus
          placeholder="Buscar documentos..."
          className="w-full bg-transparent focus:outline-none text-sm text-potion-50 placeholder:text-potion-200"
        />
      </div>
      <Command.List className="search-list py-2 max-h-48 scrollbar-thin scrollbar-thumb-potion-600 scrollbar-track-potion-800">
        <Command.Empty className="py-3 px-4 text-potion-200 text-sm">
          Nenhum documento encontrado.
        </Command.Empty>

        {data?.map((document) => {
          return (
            <Command.Item
              key={document.id}
              onSelect={() => handleOpenDocument(String(document.id))}
              className="py-3 px-4 text-potion-50 text-sm flex items-center gap-2 hover:bg-potion-700 aria-selected:!bg-potion-600"
            >
              <File className="w-4 h-4" />
              {document.title}
            </Command.Item>
          )
        })}
      </Command.List>
    </Command.Dialog>
  )
}
