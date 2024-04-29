import { Plus } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { invoke } from '@tauri-apps/api'
import { Document } from '@/@types/document'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreatePageProps {
  handleRefetch: () => void
}

export function CreatePage({ handleRefetch }: CreatePageProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutateAsync: createDocument } = useMutation<
    Document,
    Error,
    void,
    Document
  >({
    mutationFn: async () => {
      return invoke('create_document', {
        dbUrl: 'sqlite://../sqlite.db',
      }) as Promise<Document>
    },
    onSuccess: (data) => {
      queryClient.setQueryData<DocumentType[]>(
        ['documents', data],
        (document) => {
          if (document) {
            return { ...document, title: data.title }
          }
          handleRefetch()
          navigate(`/documents/${data}`)
        },
      )
    },
  })

  return (
    <button
      onClick={() => createDocument()}
      className="flex w-[240px] px-5 items-center text-sm gap-2 absolute bottom-0 left-0 right-0 py-4 border-t border-potion-600 hover:bg-potion-700 disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      Novo documento
    </button>
  )
}
