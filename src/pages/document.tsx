import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Editor, onContentUpdatedParams } from '../components/editor'
import { ToC } from '../components/table-of-contents'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api'
import { Document as DocumentType } from '@/@types/document'
import { LoaderCircle } from 'lucide-react'
import { extractTitles } from '@/lib/utils'

export function Document() {
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const docId = Number(id)

  const { data, isFetching } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response: DocumentType = await invoke('get_document', {
        dbUrl: 'sqlite://../sqlite.db',
        documentId: docId,
      })
      return response
    },
  })

  const [editorContent, setEditorContent] = useState<string>('')

  useEffect(() => {
    if (data) {
      setEditorContent(`<h1>${data.title}</h1>${data.description || '<p></p>'}`)
    }
  }, [data])

  const { mutateAsync: saveDocument } = useMutation({
    mutationFn: async ({
      title,
      description,
    }: {
      title: string
      description: string
    }) => {
      return invoke('save_document', {
        id: docId,
        title,
        description,
        dbUrl: 'sqlite://../sqlite.db',
      })
    },
    onSuccess: (_, { title }) => {
      queryClient.setQueryData<DocumentType[]>(['documents'], (documents) => {
        if (!documents) return documents

        return documents.map((document) => {
          if (document.id === docId) {
            return { ...document, title }
          }
          return document
        })
      })
    },
  })

  const titles = useMemo(() => {
    if (data) {
      return extractTitles(`${data.title}${data.description || 'Untitled'}`)
    }
    return []
  }, [data])

  function handleEditorContentUpdated({
    title,
    description,
  }: onContentUpdatedParams) {
    let newTitle = title
    const filteredTitle = title.match(/^(.*?)<\/h1>/)

    if (filteredTitle) {
      newTitle = filteredTitle[1]
    } else if (title === 'Untitled') {
      newTitle = 'Untitled Document'
    }

    saveDocument({ title: newTitle, description })
  }

  return (
    <main className="flex-1 flex py-12 px-10 gap-8 overflow-y-auto scrollbar-thin scrollbar-thumb-potion-600 scrollbar-track-potion-800">
      <aside className="hidden lg:block sticky top-0">
        <span className="text-rotion-300 font-semibold text-xs">
          TABLE OF CONTENTS
        </span>
        <ToC.Root>
          {titles.map((title) => (
            <ToC.Section level={title.level} key={title.title}>
              <ToC.Link href={`#${title.title}`}>{title.title}</ToC.Link>
            </ToC.Section>
          ))}
        </ToC.Root>
      </aside>

      <section className="flex-1 flex flex-col items-center">
        {isFetching && (
          <div className="flex h-full items-center">
            <LoaderCircle className="animate-spin w-8 h-8 mr-10" />
          </div>
        )}

        {!isFetching && data && (
          <Editor
            onContentUpdated={handleEditorContentUpdated}
            content={editorContent}
          />
        )}
      </section>
    </main>
  )
}
