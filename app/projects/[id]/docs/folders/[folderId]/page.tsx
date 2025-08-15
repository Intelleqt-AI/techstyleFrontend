'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ProjectNav } from '@/components/project-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, ChevronRight, Download, Eye, File, FileText, Filter, FolderIcon, ImageIcon, MoreHorizontal, Search, SortAsc, Upload, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type FileType = 'image' | 'pdf' | 'spreadsheet' | 'document' | 'cad' | 'design' | 'other'

const FOLDER_INDEX: Record<string, { name: string; id: number }> = {
  '1': { id: 1, name: 'Design Concepts' },
  '2': { id: 2, name: 'Technical Drawings' },
  '3': { id: 3, name: 'Client Communications' },
  '4': { id: 4, name: 'Procurement Documents' },
  '5': { id: 5, name: 'Site Photos' },
  '6': { id: 6, name: 'Contracts & Legal' },
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-4 h-4 text-gray-500" />
    case 'pdf':
      return <FileText className="w-4 h-4 text-gray-500" />
    case 'spreadsheet':
      return <FileText className="w-4 h-4 text-gray-500" />
    case 'document':
      return <FileText className="w-4 h-4 text-gray-500" />
    case 'cad':
      return <File className="w-4 h-4 text-gray-500" />
    case 'design':
      return <File className="w-4 h-4 text-gray-500" />
    default:
      return <File className="w-4 h-4 text-gray-500" />
  }
}

const formatDate = (input: string | Date) => {
  const date = typeof input === 'string' ? new Date(input) : input
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface FileRow {
  id: string
  name: string
  type: FileType
  size: string
  modifiedAt: string
  owner: string
  shared?: boolean
  starred?: boolean
}

// Seed example files per folder to demonstrate the layout
const seedFilesForFolder = (folderId: number): FileRow[] => {
  switch (folderId) {
    case 1:
      return [
        { id: 'f1', name: 'Concept_v1.fig', type: 'design', size: '12.3 MB', modifiedAt: '2025-07-31T10:30:00', owner: 'Jane Designer' },
        { id: 'f2', name: 'Moodboard_July.pdf', type: 'pdf', size: '2.1 MB', modifiedAt: '2025-07-28T14:20:00', owner: 'Alex Rivera' },
        { id: 'f3', name: 'Render_Kitchen.jpg', type: 'image', size: '1.2 MB', modifiedAt: '2025-07-25T09:10:00', owner: 'Mike Chen' },
      ]
    case 2:
      return [
        { id: 'f4', name: 'Electrical_Plans_v2.dwg', type: 'cad', size: '3.2 MB', modifiedAt: '2025-07-29T11:00:00', owner: 'Tom Wilson' },
        { id: 'f5', name: 'Plumbing_Schematic.pdf', type: 'pdf', size: '865 KB', modifiedAt: '2025-07-24T16:45:00', owner: 'Sarah Johnson' },
      ]
    case 3:
      return [
        { id: 'f6', name: 'Client_Feedback_Thread.docx', type: 'document', size: '128 KB', modifiedAt: '2025-07-27T15:00:00', owner: 'Jane Designer' },
        { id: 'f7', name: 'Meeting_Notes_2025-07-15.docx', type: 'document', size: '92 KB', modifiedAt: '2025-07-15T12:30:00', owner: 'Sarah Johnson' },
      ]
    case 4:
      return [
        { id: 'f8', name: 'Vendor_Quote_WestElm.pdf', type: 'pdf', size: '945 KB', modifiedAt: '2025-07-22T09:45:00', owner: 'Procurement' },
        { id: 'f9', name: 'Material_Specs_Q3.xlsx', type: 'spreadsheet', size: '856 KB', modifiedAt: '2025-07-20T13:30:00', owner: 'Procurement' },
      ]
    case 5:
      return [
        { id: 'f10', name: 'Site_2025-07-10_01.jpg', type: 'image', size: '2.4 MB', modifiedAt: '2025-07-10T10:00:00', owner: 'Mike Chen' },
        { id: 'f11', name: 'Site_2025-07-10_02.jpg', type: 'image', size: '2.1 MB', modifiedAt: '2025-07-10T10:05:00', owner: 'Mike Chen' },
        { id: 'f12', name: 'Site_2025-07-10_03.jpg', type: 'image', size: '2.6 MB', modifiedAt: '2025-07-10T10:10:00', owner: 'Mike Chen' },
      ]
    case 6:
      return [
        { id: 'f13', name: 'Contract_Master.pdf', type: 'pdf', size: '1.1 MB', modifiedAt: '2025-06-30T08:00:00', owner: 'Legal' },
        { id: 'f14', name: 'NDA_Client.pdf', type: 'pdf', size: '420 KB', modifiedAt: '2025-06-25T09:00:00', owner: 'Legal' },
      ]
    default:
      return []
  }
}

export default function ProjectFolderPage({ params }: { params: { id: string; folderId: string } }) {
  const folderInfo = FOLDER_INDEX[params.folderId]
  const files = useMemo(() => (folderInfo ? seedFilesForFolder(folderInfo.id) : []), [folderInfo])

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Breadcrumbs and Back */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${params.id}/docs`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Folders
            </Link>
            <span className="text-gray-300">{'|'}</span>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/projects/${params.id}/docs`}>Docs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{folderInfo?.name ?? 'Folder'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search files..." className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              More
            </Button>
          </div>
        </div>

        {/* Files List */}
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="relative overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="w-10 px-4 py-3">
                      <input aria-label="Select all" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">File</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Size</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Modified</th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Owner</th>
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input aria-label={`Select ${file.name}`} type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{file.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{file.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(file.modifiedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={`/placeholder.svg?height=20&width=20&query=owner-avatar`} />
                            <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">
                              {file.owner.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate" title={file.owner}>{file.owner}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600" aria-label="Preview">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600" aria-label="Download">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600" aria-label="More">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {files.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No files in this folder yet. Use Upload to add files.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
