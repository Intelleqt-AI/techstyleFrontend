'use client';

import Link from 'next/link';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  ImageIcon,
  File,
  Folder,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  FolderOpen,
  ChevronDown,
  FileIcon,
  Edit2,
  LinkIcon,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotesFeed } from '@/components/notes-feed';
import { NotesSidePanel } from '@/components/notes-side-panel';
import { mockNotes } from '@/components/notes-mocks';
import type { Note } from '@/components/notes-types';
import { AIPill } from '@/components/ai-pill';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from 'react-modal';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import {
  getAllFiles,
  createFolder,
  uploadDoc,
  downloadFolderAsZip,
  renameFolder,
  deleteFile,
  getFolderStats,
  updateProjectClientDocs,
  addNewChat,
  renameFile,
  addLink,
  getLinks,
  deleteLink,
} from '@/supabase/API';

// NEW: import dialog component
import { SentToClientDialog } from '@/components/SentToClientDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useAdmin } from '@/hooks/useAdmin';

// Derived from storage
type DerivedFolder = {
  id: string;
  name: string;
  fileCount: number;
  lastModified?: string;
};

const notesFolder = {
  id: 999,
  name: 'Notes',
  items: 12,
  needsReview: 3,
  lastModified: '2024-02-07',
};

type DerivedFile = {
  id: string;
  name: string;
  type: string;
  sizeBytes?: number;
  uploadedAt?: string;
};

function getFileIcon(type: string) {
  switch (type) {
    case 'image':
      return <ImageIcon className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
    case 'pdf':
      return <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
    case 'spreadsheet':
      return <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
    case 'cad':
      return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
    default:
      return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

export default function ProjectDocsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activePane, setActivePane] = React.useState<'notes' | 'files'>('files');
  const [sideOpen, setSideOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<Note | undefined>(undefined);
  const [currentPath] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [uploadModal, setUploadModal] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [fileQueue, setFileQueue] = React.useState<File[]>([]);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [currentDoc, setCurrentDoc] = React.useState<any>(null);
  const [renameModalOpen, setRenameModalOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState(null);
  const [updatedFolderName, setUpdatedFolderName] = React.useState('');
  const [totalDocs, setTotalDocs] = React.useState([]);

  // NEW: state to manage send-to-client dialog
  const [sentDialogOpen, setSentDialogOpen] = React.useState(false);
  const [selectedForSend, setSelectedForSend] = React.useState<any>(null);
  const [updatedFileName, setUpdatedFileName] = React.useState('');
  const [fileRenameModalOpen, setFileRenameModalOpen] = React.useState(false);
  const [linkModalOpen, setLinkModalOpen] = React.useState(false);
  const [link, setLink] = React.useState('');
  const [linkName, setLinkName] = React.useState('');
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    name: string;
    isFolder: boolean;
  } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch files/folders
  const {
    data: filesResp,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['GetAllFiles', params.id, currentPath],
    queryFn: () => getAllFiles(params.id, currentPath),
    enabled: !!params.id,
  });

  const allItems = React.useMemo(() => {
    const list = filesResp?.data || [];
    return list.map((item: any) => ({ ...item, isFolder: !item.metadata }));
  }, [filesResp]);

  const derivedFolders = React.useMemo<DerivedFolder[]>(() => {
    return totalDocs
      .filter((d: any) => d.isFolder)
      .map((f: any) => ({
        id: encodeURIComponent(f.name),
        name: f.name,
        fileCount: 0,
        lastModified: f.created_at,
        folderStats: f?.folderStats,
        isFolder: f.isFolder,
      }));
  }, [totalDocs]);

  const derivedFiles = React.useMemo<DerivedFolder[]>(() => {
    return totalDocs
      .filter((d: any) => !d.isFolder)
      .map((f: any) => ({
        id: encodeURIComponent(f.name),
        name: f.name,
        fileCount: 0,
        lastModified: f.created_at,
        metadata: f.metadata,
      }));
  }, [totalDocs]);

  const derivedRecentFiles = React.useMemo<DerivedFile[]>(() => {
    if (!allItems || allItems.length === 0) return []; // ⬅️ return blank

    const filesOnly = allItems.filter((d: any) => !d.isFolder);

    const toType = (mime?: string) => {
      if (!mime) return 'file';
      if (mime.startsWith('image/')) return 'image';
      if (mime.includes('pdf')) return 'pdf';
      if (mime.includes('sheet') || mime.includes('excel')) return 'spreadsheet';
      return 'file';
    };

    return filesOnly
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        type: toType(f?.metadata?.mimetype),
        sizeBytes: f?.metadata?.size,
        uploadedAt: f.created_at,
      }));
  }, [allItems]);

  const RenameOpenModal = doc => {
    setSelectedDoc(doc);
    setRenameModalOpen(true);
  };
  function RenameCloseModal() {
    setRenameModalOpen(false);
    setUpdatedFolderName('');
  }

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: (vars: any) => createFolder(vars),
    onMutate: () => toast.loading('Creating folder...', { id: 'folder-toast' }),
    onSuccess: () => {
      toast.dismiss('folder-toast');
      toast.success('Folder created successfully!');
      setModalOpen(false);
      setNewFolderName('');
      refetch();
    },
    onError: () => {
      toast.dismiss('folder-toast');
      toast.error('Failed to create folder.');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (vars: any) => uploadDoc(vars),
    onMutate: () => toast.loading('Uploading...', { id: 'upload-toast' }),
    onSuccess: () => {
      toast.dismiss('upload-toast');
      toast.success('Uploaded successfully!');
      setFileQueue([]);
      setUploadModal(false);
      refetch();
    },
    onError: e => {
      console.log(e);
      toast.dismiss('upload-toast');
      toast.error('Failed to upload document.');
    },
  });

  const handleUploadModalClose = () => {
    setUploadModal(false);
    setFileQueue([]);
  };

  const downloadFolderMutation = useMutation({
    mutationFn: (vars: any) => downloadFolderAsZip(vars),
    onMutate: () => {
      setIsDownloading(true);
      toast.loading('Preparing download...', { id: 'download-toast' });
    },
    onSuccess: (downloadUrl: any, variables: any) => {
      toast.dismiss('download-toast');
      toast.success('Download ready!');
      const link = document.createElement('a');
      link.href = String(downloadUrl);
      link.setAttribute('download', `${variables.folderName}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    },
    onError: () => {
      toast.dismiss('download-toast');
      toast.error('Failed to download folder.');
      setIsDownloading(false);
    },
  });

  // Folder Rename Function
  const renameFolderMutation = useMutation({
    mutationFn: renameFolder,
    onMutate: () => {
      toast.loading('Renaming...', { id: 'rename-toast' });
    },
    onSuccess: () => {
      refetch();
      setRenameModalOpen(false);
      toast.dismiss('rename-toast');
      toast.success(`Renamed successfully!`);
    },
    onError: () => {
      toast.dismiss('rename-toast');
      toast.error('Failed to rename folder.');
    },
  });

  // File delete Function
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onMutate: () => {
      toast.loading('Deleting...', { id: 'delete-toast' });
    },
    onSuccess: () => {
      refetch();
      toast.dismiss('delete-toast');
      toast.success(`Deleted successfully!`);
    },
    onError: () => {
      toast.dismiss('delete-toast');
      toast.error('Failed to delete file.');
    },
  });

  function LinkOpenModal() {
    setLinkModalOpen(true);
  }

  function LinkAfterCloseModal() {
    setModalOpen(false);
  }

  function LinkCloseModal() {
    setLinkModalOpen(false);
  }

  function formatSize(size?: number) {
    if (!size && size !== 0) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function downloadFile(url: string, fileName: string) {
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.blob();
      })
      .then(blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(() => toast.error('Download failed'));
  }

  function openViewer(url: string, name: string) {
    console.log({ uri: url, fileName: name });
    setCurrentDoc([{ uri: url, fileName: name }]);
    setViewerOpen(true);
  }

  function fileUrl(name: string) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/docs/${params.id}/${
      currentPath ? currentPath + '/' : ''
    }${name}`;
  }

  function openNote(n: Note) {
    setSelectedNote(n);
    setSideOpen(true);
    console.log('analytics: open_side_panel', { noteId: n.id });
  }

  function RenameAfterCloseModal() {
    RenameCloseModal();
  }

  // Rename Folder
  const handleRenameFolder = () => {
    renameFolderMutation.mutate({
      projectId: params?.id,
      currentPath: currentPath,
      currentFolderName: selectedDoc.name,
      newFolderName: updatedFolderName,
    });

    setUpdatedFolderName('');
  };

  const { isAdmin } = useAdmin();

  const HandleFolderOpen = folder => {
    const tempName = folder?.name?.toLowerCase();
    if (tempName == 'admin only' && !isAdmin) return;
    router.push(`/projects/${params.id}/docs/folders/${folder.id}`);
  };

  // Delete files or folders
  const handleDeleteTask = (name, isFolder) => {
    const itemPath = currentPath ? `${currentPath}/${name}` : name;
    deleteMutation.mutate({
      file: itemPath,
      id: params?.id,
      isFolder: isFolder,
    });
  };

  // Folder Stats Mutation
  const folderStatsMutation = useMutation({
    mutationFn: getFolderStats,
    onSuccess: (data, variables) => {
      setTotalDocs(prev => prev.map(doc => (doc.name === variables.folderName ? { ...doc, folderStats: data } : doc)));
    },
  });

  React.useEffect(() => {
    if (isLoading) return;

    // Process the data to identify folders and files
    if (filesResp?.data) {
      const processedDocs = filesResp.data.map(item => ({
        ...item,
        isFolder: !item.metadata,
      }));
      setTotalDocs(processedDocs);

      // Fetch stats for all folders
      processedDocs
        .filter(doc => doc.isFolder)
        .forEach(folder => {
          folderStatsMutation.mutate({
            projectId: params.id,
            folderName: folder.name,
            path: '',
          });
        });
    }
  }, [isLoading, filesResp, params.id]);

  // Update Product
  const sendDoctoClient = useMutation({
    mutationFn: updateProjectClientDocs,
    onSuccess: () => {
      toast.success('Document Sent to Client');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Create Chat
  const mutation = useMutation({
    mutationFn: addNewChat,
    onSuccess: () => {
      refetch();
      toast('Chat Created');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  const renameFileMutation = useMutation({
    mutationFn: renameFile,
    onMutate: () => toast.loading('Renaming file...', { id: 'file-rename-toast' }),
    onSuccess: () => {
      refetch();
      setFileRenameModalOpen(false);
      toast.dismiss('file-rename-toast');
      toast.success(`File renamed successfully!`);
    },
    onError: () => {
      toast.dismiss('file-rename-toast');
      toast.error('Failed to rename file.');
    },
  });

  // Fetch Links
  const {
    data,
    isLoading: linkLoading,
    refetch: LinkRefetch,
  } = useQuery({
    queryKey: ['GetLinks', params.id],
    queryFn: () => getLinks(params.id),
    enabled: !!params.id,
  });

  // Link Creation Function
  const linkMutation = useMutation({
    mutationFn: addLink,
    onSuccess: () => {
      LinkRefetch();
      setLinkModalOpen(false);
      setLink('');
      setLinkName('');
      toast.success('Link added!');
    },
    onError: () => {
      toast.error('Failed to add link');
    },
  });

  // Link Delete Function
  const deleteLinkMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      LinkRefetch();
      toast.success('Link Deleted!');
    },
    onError: () => {
      toast.error('Failed to delete link');
    },
  });

  // modify handleClick to accept optional message
  const handleClick = (item: any, message?: string) => {
    let itemWithUrl = item;

    // If the item comes from Supabase storage (has metadata)
    if (item.metadata?.mimetype) {
      itemWithUrl = {
        ...item,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${params.id}/${currentPath ? currentPath + '/' : ''}${
          item.name
        }`,
      };
    }

    const updatedDoc = {
      ...itemWithUrl,
      path: currentPath,
      // message: message ?? undefined, // attach message if provided
    };

    // Send single doc
    // console.log(updatedDoc);
    sendDoctoClient.mutate({ projectID: params.id, newDocs: [updatedDoc] });
    if (message && message.trim()) {
      handleCreateChat(message, [updatedDoc]);
    }
  };

  // handle Create chat (now accepts topic and document)
  const handleCreateChat = (topic: string, document: string) => {
    if (!topic?.trim()) return;
    mutation.mutate({
      topic: `Document : ${topic.trim()}`,
      document,
      projectID: params.id,
    });
  };

  const FileRenameOpenModal = (doc: FileItem) => {
    setSelectedDoc(doc);
    setUpdatedFileName(doc.name);
    setFileRenameModalOpen(true);
  };

  const FileRenameCloseModal = () => {
    setFileRenameModalOpen(false);
    setUpdatedFileName('');
  };

  const handleRenameFile = () => {
    if (!selectedDoc) return;
    renameFileMutation.mutate({
      projectId: params.id,
      currentPath: currentPath,
      currentFileName: selectedDoc.name,
      newFileName: updatedFileName,
    });
    setUpdatedFileName('');
  };

  const handleSubmitLink = () => {
    if (!link.trim()) {
      toast.error('Link cannot be empty');
      return;
    }
    try {
      const url = new URL(link);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error();
      }
      const hostname = url.hostname.toLowerCase();
      const suspiciousDomains = ['example.com', 'test.com', 'localhost'];
      if (suspiciousDomains.some(domain => hostname.includes(domain))) {
        toast.error('This URL appears to be a test or example URL');
        return;
      }
      linkMutation.mutate({
        id: params.id,
        link: link,
        name: linkName,
        create_time: new Date().getTime(),
        path: currentPath,
      });
    } catch (error) {
      toast.error('Please enter a valid URL (starting with http:// or https://)');
    }
  };

  // handle Delete Link
  const handeDeleteLink = time => {
    if (!time) return;
    deleteLinkMutation.mutate({ id: params.id, create_time: time });
  };

  //   const handleDeleteTask = (name: string, isFolder: boolean) => {
  //   const itemPath = currentPath ? `${currentPath}/${name}` : name;
  //   deleteMutation.mutate({
  //     file: itemPath,
  //     id: params.id,
  //     isFolder: isFolder,
  //   });
  // };

  const filteredFolders = React.useMemo(() => {
    if (!searchQuery.trim()) return derivedFolders;

    return derivedFolders.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, derivedFolders]);

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery.trim()) return derivedFiles;

    return derivedFiles.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, derivedFiles]);

  const filterLinks = React.useMemo(() => {
    if (linkLoading) return [];

    const list = (data ?? []).filter(item => item.path === ''); // ⬅️ Only items with empty path

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();

    return list.filter(item => item.name?.toLowerCase().includes(q) || item.link?.toLowerCase().includes(q));
  }, [searchQuery, data, linkLoading]);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Actions Bar */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              {/* Search Input */}
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documents & notes…"
                className="w-72 pl-9"
              />
            </div>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              {'Filter'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              <FolderOpen className="mr-2 h-4 w-4" />
              {'New Folder'}
            </Button>
            {/* <Button
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={() => setUploadModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {"Upload Files"}
            </Button> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  {'More'}
                  <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem
                  onSelect={() =>
                    console.log("new_note_from_zoom", { projectId: params.id })
                  }>
                  {"From Zoom call (paste link or select past meeting)"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    console.log("new_note_from_site_visit", {
                      projectId: params.id,
                    })
                  }>
                  {"From Site Visit (upload audio/photos)"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    console.log("new_note_blank", { projectId: params.id })
                  }>
                  {"Blank note (paste text)"}
                </DropdownMenuItem> */}
                <DropdownMenuItem onSelect={LinkOpenModal}>{'Add Link'}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setUploadModal(true)}>{'Upload Files'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Folders Grid */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-neutral-900">{'Folders'}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFolders.map(folder => {
              return (
                <div
                  key={folder.id}
                  onClick={() => HandleFolderOpen(folder)}
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                  aria-label={`Open ${folder.name}`}
                >
                  <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                          <div>
                            <h4 className="font-medium text-neutral-900">{folder.name}</h4>
                            <p className="mt-1 text-xs text-neutral-500">
                              {folder?.folderStats?.fileCount} files • Updated{' '}
                              {folder?.folderStats?.lastModified ? formatDate(folder?.folderStats?.lastModified) : '-'}
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={e => e.stopPropagation()} // ⬅️ Prevent parent click
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                              aria-label="Folder actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                HandleFolderOpen(folder);
                              }}
                            >
                              {'Open'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                RenameOpenModal(folder);
                              }}
                            >
                              {'Rename'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                // handleDeleteTask(
                                //   folder?.name,
                                //   folder?.isFolder
                                // );
                                setDeleteTarget({
                                  name: folder.name,
                                  isFolder: folder.isFolder,
                                });
                                setIsDeleteOpen(true);
                              }}
                            >
                              {'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            {filteredFiles.map(file => {
              // Build file URL from Supabase (Next.js style env var)
              const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${params.id}/${file.id}`;

              return (
                <div
                  key={file.id}
                  onClick={() => openViewer(fileUrl, file.name)} // ⬅️ opens modal with DocViewer
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                  aria-label={`Open ${file.name}`}
                >
                  <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        {/* File Info */}
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                          <div>
                            <h4 className="font-medium text-neutral-900 truncate max-w-[180px]">{file.name}</h4>
                            <p className="mt-1 text-xs text-neutral-500">
                              Updated {file.lastModified ? formatDate(file.lastModified) : '-'}
                            </p>
                          </div>
                        </div>

                        {/* File Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                              aria-label="File actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                openViewer(fileUrl, file.name);
                              }}
                            >
                              {'Open'}
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                RenameOpenModal(file);
                              }}>
                              {"Rename"}
                            </DropdownMenuItem> */}
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteTask(file?.name, file?.isFolder);
                              }}
                            >
                              {'Delete'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                downloadFile(fileUrl, file.name);
                              }}
                            >
                              {'Download'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                // OPEN the SentToClient dialog instead of sending immediately
                                setSelectedForSend(file);
                                setSentDialogOpen(true);
                              }}
                            >
                              {'Send to Client'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                FileRenameOpenModal(file);
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            {/* // LinksSection component */}
            {filterLinks.map(link => {
              const fileName = link.name || link.link?.split('/').pop() || 'Untitled Link';

              return (
                <div
                  key={link.create_time}
                  onClick={() => window.open(link.link, '_blank')}
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                  aria-label={`Open ${fileName}`}
                >
                  <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        {/* Link Info */}
                        <div className="flex items-center gap-3">
                          <LinkIcon className="h-5 w-5 " aria-hidden="true" />
                          <div>
                            <h4 className="font-medium text-neutral-900 truncate max-w-[180px]">
                              {fileName}
                              <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Link</span>
                            </h4>

                            <p className="mt-1 text-xs text-neutral-400 truncate max-w-[200px]">{link.link}</p>
                          </div>
                        </div>

                        {/* Link Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                              aria-label="Link actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                window.open(link.link, '_blank');
                              }}
                            >
                              Open Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handeDeleteLink(link.create_time);
                              }}
                            >
                              Delete Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(link.link);
                                // Add toast notification here if needed
                              }}
                            >
                              Copy Link
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Optional: Add rename functionality for links
                    LinkRenameOpenModal(link);
                  }}
                >
                  Rename Link
                </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/*Rename Folder Modal */}
            <Modal
              className="!h-[250px] !max-w-[500px] !py-7"
              isOpen={renameModalOpen}
              onRequestClose={RenameAfterCloseModal}
              contentLabel="Rename Folder Modal"
            >
              <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold flex items-center gap-2">{/* <p> {doc?.name}</p> */}</div>
                </div>
                {/* Delete and Close Modal Section */}
                <div className="buttons flex items-center gap-3 !mt-0 px-2">
                  <button
                    onClick={() => RenameCloseModal()}
                    className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="py-4 my-7">
                <Input placeholder="Folder Name" value={updatedFolderName} onChange={e => setUpdatedFolderName(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => RenameCloseModal()}>
                  Cancel
                </Button>
                <Button onClick={() => handleRenameFolder()}>Rename</Button>
              </div>
            </Modal>
            {/* Notes smart folder */}
            {/* <button
              type="button"
              onClick={() => router.push(`/projects/${params.id}/docs/notes`)}
              className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
              aria-label="Open Notes">
              <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          aria-hidden="true"
                          className="flex h-8 w-8 items-center justify-center rounded-md"
                          style={{ backgroundColor: "#F4F1FF" }}>
                          <Folder className="h-5 w-5 text-neutral-600" />
                        </div>
                        <AIPill className="absolute -right-2 -top-2" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900">
                          {"Notes"}
                        </h4>
                        <p className="mt-1 text-xs text-neutral-500">
                          {notesFolder.items} items • {notesFolder.needsReview}{" "}
                          need review • Updated 7 Feb
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          aria-label="Notes actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(`/projects/${params.id}/docs/notes`)
                          }>
                          {"Open Notes"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            console.log("new_note_from_notes_card", {
                              projectId: params.id,
                            })
                          }>
                          {"New Note"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            console.log("manage_notes_defaults", {
                              projectId: params.id,
                            })
                          }>
                          {"Manage defaults (visibility, review workflow)"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </button> */}
          </div>
        </div>

        {/* Two-state panel: Latest Notes (default) / Recent Files */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-neutral-300 bg-white p-0.5">
              {(['notes', 'files'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActivePane(tab);
                    console.log('analytics: toggle_notes_files', { tab });
                  }}
                  aria-pressed={activePane === tab}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium',
                    activePane === tab ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  {tab === 'notes' ? 'Latest Notes' : 'Recent Files'}
                </button>
              ))}
            </div>
          </div>

          {activePane === 'notes' ? (
            <NotesFeed notes={[]} onOpen={n => openNote(n)} className="border border-neutral-200" />
          ) : (
            <Card className="rounded-xl border border-neutral-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {derivedRecentFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 truncate font-medium text-neutral-900">{file.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-neutral-600">
                          <span>{formatSize(file.sizeBytes)}</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={`/placeholder.svg?height=16&width=16&query=uploaded-by`} alt="" />
                              <AvatarFallback className="bg-neutral-900 text-[9px] text-white">{'TS'}</AvatarFallback>
                            </Avatar>
                            {'Team'}
                          </div>
                          <div className="flex items-center gap-1">{file.uploadedAt ? formatDate(file.uploadedAt) : '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          onClick={() => openViewer(fileUrl(file.name), file.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          onClick={() => downloadFile(fileUrl(file.name), file.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Side Panel for notes */}
      <NotesSidePanel open={sideOpen} onOpenChange={setSideOpen} note={selectedNote} />

      {/* Create Folder Modal */}
      <Modal
        className="!h-[250px] !max-w-[500px] !py-7"
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Folder Create Modal"
      >
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Create Folder</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={() => setModalOpen(false)}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="py-4 my-7">
          <Input placeholder="Folder Name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!newFolderName.trim()) return toast.error('Folder name cannot be empty');
              createFolderMutation.mutate({
                projectId: params.id,
                folderName: newFolderName,
                path: currentPath,
              });
            }}
          >
            Create
          </Button>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        className="!h-[600px] !max-w-[700px] !py-7"
        isOpen={uploadModal}
        onRequestClose={handleUploadModalClose}
        contentLabel="Upload Documents Modal"
      >
        <div className="navbar flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Upload Documents</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={handleUploadModalClose}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto">
          {/* File Drop Area */}
          <div
            onClick={() => document.getElementById('fileInput')?.click()}
            className="border-dashed cursor-pointer mt-10 w-full border-2 flex flex-col gap-5 items-center justify-center py-6 rounded-2xl border-gray-300 hover:border-gray-400 transition-colors"
          >
            <div className="flex flex-col items-center gap-3">
              <input
                id="fileInput"
                type="file"
                multiple
                className="hidden"
                onChange={e => setFileQueue(Array.from(e.target.files || []))}
              />
              <div className="bg-gray-100 w-24 h-24 flex items-center justify-center rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg mb-1 font-medium">Drag & Drop or Click</p>
                <p className="text-sm text-gray-600">to upload multiple documents (max: 50MB each)</p>
              </div>
            </div>
          </div>

          {/* File List */}
          {fileQueue.length > 0 && (
            <div className="mt-6 border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Selected Files ({fileQueue.length})</h3>
                <button onClick={() => setFileQueue([])} className="text-sm hover:text-red-700">
                  Remove All
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {fileQueue.map((f, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-2 rounded flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                      </div>
                      <span className="truncate flex-1">{f.name}</span>
                    </div>
                    <button onClick={() => setFileQueue(fileQueue.filter((_, i) => i !== index))} className="text-black hover:text-red-700">
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setUploadModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!fileQueue.length) return toast.error('Select files first');
                    if (fileQueue.length === 1) {
                      uploadMutation.mutate({
                        file: fileQueue[0],
                        id: params.id,
                        path: currentPath,
                        projectID: params.id,
                        task: undefined,
                      });
                    } else {
                      toast.loading(`Uploading ${fileQueue.length} files...`, {
                        id: 'upload-toast',
                      });
                      let completed = 0;
                      let failed = 0;
                      fileQueue.forEach(f => {
                        uploadDoc({
                          file: f,
                          id: params.id,
                          path: currentPath,
                          projectID: undefined,
                          task: undefined,
                        })
                          .then(() => {
                            completed++;
                            if (completed + failed === fileQueue.length) {
                              toast.dismiss('upload-toast');
                              toast.success(`Uploaded ${completed}/${fileQueue.length} files`);
                              setFileQueue([]);
                              setUploadModal(false);
                              refetch();
                            }
                          })
                          .catch(() => {
                            failed++;
                            if (completed + failed === fileQueue.length) {
                              toast.dismiss('upload-toast');
                              toast.error('Some uploads failed');
                              refetch();
                            }
                          });
                      });
                    }
                  }}
                >
                  Upload {fileQueue.length} {fileQueue.length === 1 ? 'File' : 'Files'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Viewer Modal */}
      <Modal
        className="!h-[90vh] !max-w-[1200px] !py-7"
        isOpen={viewerOpen}
        onRequestClose={() => setViewerOpen(false)}
        contentLabel="Document Viewer"
      >
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2" />
          <div className="buttons flex items-center gap-4 !mt-0 px-2">
            {currentDoc && currentDoc[0]?.fileName && (
              <button
                onClick={() => downloadFile(currentDoc[0].uri, currentDoc[0].fileName)}
                className="text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
                title="Download with original filename"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setViewerOpen(false)}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ marginTop: '20px', width: '100%', height: '500px' }}>
          <DocViewer
            pluginRenderers={DocViewerRenderers}
            className="DocViewr"
            documents={currentDoc || []}
            config={{
              header: {
                disableHeader: false,
                disableFileName: false,
                retainURLParams: false,
              },
            }}
            style={{ height: '100%' }}
          />
        </div>
      </Modal>

      {/* Sent to Client Dialog */}
      <SentToClientDialog
        open={sentDialogOpen}
        onOpenChange={v => {
          setSentDialogOpen(v);
          if (!v) setSelectedForSend(null);
        }}
        itemName={selectedForSend?.name}
        onConfirm={async (message: string) => {
          if (!selectedForSend) return;
          // send doc
          handleClick(selectedForSend, message);
          // if message filled, create a chat with topic = message and document = selected item (use name or id)
          // if (message && message.trim()) {
          //   const docIdentifier =
          //     selectedForSend?.name ||
          //     selectedForSend?.id ||
          //     selectedForSend?.path ||
          //     "";
          //   handleCreateChat(message, docIdentifier);
          // }
        }}
      />

      <Modal
        className="!h-[250px] !max-w-[500px] !py-7"
        isOpen={fileRenameModalOpen}
        onRequestClose={FileRenameCloseModal}
        contentLabel="Rename File Modal"
      >
        <div className="navbar flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Rename File</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={FileRenameCloseModal}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="py-4 my-7">
          <Input placeholder="New File Name" value={updatedFileName} onChange={e => setUpdatedFileName(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={FileRenameCloseModal}>
            Cancel
          </Button>
          <Button onClick={handleRenameFile}>Rename</Button>
        </div>
      </Modal>

      <Modal
        className="!h-[300px] !max-w-[500px] !py-7"
        isOpen={linkModalOpen}
        onRequestClose={LinkAfterCloseModal}
        contentLabel="Link Create Modal"
      >
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Submit Link</p>
            </div>
          </div>
          {/* Delete and Close Modal Section */}
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={() => LinkCloseModal()}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="py-4 my-7 space-y-4">
          <Input type="text" placeholder="Link Name" value={linkName} onChange={e => setLinkName(e.target.value)} />
          <Input type="url" placeholder="Enter Link" value={link} onChange={e => setLink(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit" variant="outline" onClick={() => LinkCloseModal()}>
            Cancel
          </Button>
          <Button onClick={handleSubmitLink}>Submit</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteTask(deleteTarget.name, deleteTarget.isFolder);
            setDeleteTarget(null);
          }
        }}
        title={deleteTarget?.isFolder ? 'Delete Folder' : 'Delete File'}
        description="Are you sure you want to delete this item? This action cannot be undone."
        itemName={deleteTarget?.name}
        requireConfirmation={false}
      />
    </div>
  );
}
