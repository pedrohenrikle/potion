/* eslint-disable @typescript-eslint/no-unused-vars */
import clsx from 'clsx'
import { CaretDoubleRight, TrashSimple } from '@phosphor-icons/react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import * as Collapsible from '@radix-ui/react-collapsible'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { Document } from '@/@types/document'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api'

interface HeaderProps {
  isSidebarOpen: boolean
}

export function Header({ isSidebarOpen }: HeaderProps) {
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Home'])
  const location = useLocation()

  const { id } = useParams<{ id: string }>()
  const docId = Number(id)

  const updateBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    const newBreadcrumb = ['Home']
    paths.forEach((path, _) => {
      const capitalizedPath = path.charAt(0).toUpperCase() + path.slice(1)
      newBreadcrumb.push(capitalizedPath)
    })
    setBreadcrumb(newBreadcrumb)
  }

  useEffect(() => {
    updateBreadcrumb()
  }, [location])

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: documentData } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response: Document[] = await invoke('get_documents', {
        dbUrl: 'sqlite://../sqlite.db',
      })
      return response
    },
  })

  const document = documentData?.find((doc) => doc.id === docId)

  const { mutateAsync: deleteDocument } = useMutation({
    mutationFn: async () => {
      return invoke('delete_document', {
        documentId: docId,
        dbUrl: 'sqlite://../sqlite.db',
      })
    },
    onSuccess: () => {
      queryClient.setQueryData(['documents'], (documents: Document[]) => {
        return documents.filter((document) => document.id !== docId)
      })

      navigate('/')
    },
  })

  return (
    <div
      id="header"
      className={clsx(
        'border-b h-14 border-potion-600 py-[1.125rem] px-6 flex items-center gap-4 leading-tight transition-all duration-250 region-drag',
        {
          'w-screen': !isSidebarOpen,
          'w-[calc(100vw-240px)]': isSidebarOpen,
        },
      )}
    >
      <Collapsible.Trigger
        className={clsx('h-5 w-5 mt-1 text-potion-200 hover:text-potion-50', {
          hidden: isSidebarOpen,
          block: !isSidebarOpen,
        })}
      >
        <CaretDoubleRight className="h-4 w-4" />
      </Collapsible.Trigger>

      <div className="flex w-full justify-between">
        {document && (
          <>
            <Breadcrumb>
              <BreadcrumbList className="text-base text-potion-100">
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem className="hover:text-potion-50">
                      <BreadcrumbLink href="/">
                        {index === breadcrumb.length - 1
                          ? document.title
                          : item}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index !== breadcrumb.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="inline-flex region-no-drag">
              <button
                onClick={() => deleteDocument()}
                className="inline-flex items-center gap-1 text-potion-100 text-sm hover:text-potion-50 disabled:opacity-60"
              >
                <TrashSimple className="h-4 w-4" />
                Apagar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
