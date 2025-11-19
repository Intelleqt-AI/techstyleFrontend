'use client';

import Link from 'next/link';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Eye,
  File,
  FileText,
  Filter,
  FolderIcon,
  ImageIcon,
  MoreHorizontal,
  Search,
  SortAsc,
  Upload,
  User,
  Check,
  Edit2,
  X,
  Trash2,
  FolderPen,
  Link as LinkIcon,
  MessageSquareShare,
  Loader2,
  CloudDownload,
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from 'react-modal';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import {
  getAllFiles,
  createFolder,
  uploadDoc,
  downloadFolderAsZip,
  deleteFile,
  addLink,
  getLinks,
  deleteLink,
  renameFolder,
  renameFile,
  updateProjectClientDocs,
  addNewChat, // <-- added
} from '@/supabase/API';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useRouter } from 'next/navigation';
import { SentToClientDialog } from '@/components/SentToClientDialog';

type FileType = 'image' | 'pdf' | 'spreadsheet' | 'document' | 'cad' | 'design' | 'other';

interface FileItem {
  id: string;
  name: string;
  isFolder: boolean;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
  created_at: string;
  preview?: string;
  originalName?: string;
}

interface LinkItem {
  create_time: number;
  link: string;
  name: string;
  path: string;
}

const FOLDER_INDEX: Record<string, { name: string; id: number }> = {
  '1': { id: 1, name: 'Design Concepts' },
  '2': { id: 2, name: 'Technical Drawings' },
  '3': { id: 3, name: 'Client Communications' },
  '4': { id: 4, name: 'Procurement Documents' },
  '5': { id: 5, name: 'Site Photos' },
  '6': { id: 6, name: 'Contracts & Legal' },
};

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-4 h-4 text-gray-500" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'spreadsheet':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'document':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'cad':
      return <File className="w-4 h-4 text-gray-500" />;
    case 'design':
      return <File className="w-4 h-4 text-gray-500" />;
    default:
      return <File className="w-4 h-4 text-gray-500" />;
  }
};

const formatDate = (input: string | Date) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return date?.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

interface FileRow {
  id: string;
  name: string;
  type: FileType;
  size: string;
  modifiedAt: string;
  owner: string;
  shared?: boolean;
  starred?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function ProjectFolderPage({ params }: { params: { id: string; folderId: string } }) {
  const folderInfo = FOLDER_INDEX[params.folderId];
  const folderName = folderInfo?.name || decodeURIComponent(params.folderId);
  const router = useRouter();

  // State management
  const [currentPath, setCurrentPath] = useState(folderName);
  const [totalDocs, setTotalDocs] = useState<FileItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [fileRenameModalOpen, setFileRenameModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [link, setLink] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkList, setLinkList] = useState<LinkItem[]>([]);
  const [updatedFolderName, setUpdatedFolderName] = useState('');
  const [updatedFileName, setUpdatedFileName] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<FileItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    name: string;
    isFolder: boolean;
  } | null>(null);
  const [checkedItems, setCheckedItems] = useState<any[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [file, setFile] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [renamingIndex, setRenamingIndex] = useState(-1);
  const [newFileName, setNewFileName] = useState('');
  const [sentDialogOpen, setSentDialogOpen] = useState(false);
  const [selectedForSend, setSelectedForSend] = useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // keep currentPath in sync with the route param (so navigation works via router.push)
  useEffect(() => {
    const derived = FOLDER_INDEX[params.folderId]?.name ?? decodeURIComponent(params.folderId);
    setCurrentPath(derived);
  }, [params.folderId]);

  const openFolder = (doc: FileItem) => {
    const newPath = currentPath ? `${currentPath}/${doc.name}` : doc.name;
    const encoded = encodeURIComponent(newPath);
    // update URL so deep links work and page params change
    router.push(`/projects/${params.id}/docs/folders/${encoded}`);
    // set immediately for a snappy UI (params effect will also set it)
    setCurrentPath(newPath);
  };

  const goUp = () => {
    if (!currentPath) {
      router.push(`/projects/${params.id}/docs`);
      return;
    }
    const parts = currentPath.split('/');
    if (parts.length <= 1) {
      // go back to docs root
      router.push(`/projects/${params.id}/docs`);
      return;
    }
    const parent = parts.slice(0, -1).join('/');
    router.push(`/projects/${params.id}/docs/folders/${encodeURIComponent(parent)}`);
    setCurrentPath(parent);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      file.forEach(file => {
        if ((file as any).preview) URL.revokeObjectURL((file as any).preview);
      });
    };
  }, [file]);

  // Fetch files and folders
  const {
    data: files,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['GetAllFiles', params.id, currentPath],
    queryFn: () => getAllFiles(params.id, currentPath),
    enabled: !!params.id,
  });

  // Fetch Links
  const {
    data: linkData,
    isLoading: linkLoading,
    refetch: LinkRefetch,
  } = useQuery({
    queryKey: ['GetLinks', params.id],
    queryFn: () => getLinks(params.id),
    enabled: !!params.id,
  });

  // Process files data
  useEffect(() => {
    // console.log(files);
    if (isLoading) return;
    if (files?.data) {
      const processedDocs = files.data.map((item: any) => ({
        ...item,
        isFolder: !item.metadata,
      })) as FileItem[];
      setTotalDocs(processedDocs);
    }
  }, [isLoading, files]);

  useEffect(() => {
    if (linkLoading) return;
    setLinkList(linkData || []);
  }, [linkData, linkLoading]);

  // File operations
  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const handleClickDocs = (url: string, fileName: string) => {
    setCurrentDoc([{ uri: url, fileName: fileName }]);
    setShowViewer(true);
  };

  const fileUrl = (name: string) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${params.id}/${
      currentPath ? currentPath + '/' : ''
    }${name}`;
  };

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.some(file => file.size > MAX_FILE_SIZE)) {
        setError('One or more files exceed the 50MB limit');
        return;
      }
      const processedFiles = droppedFiles.map(file => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          originalName: file.name,
          id: Math.random().toString(36).substring(2),
        });
      }) as any[];
      setFile(prev => [...prev, ...processedFiles]);
      setError('');
    }
  };

  const handleSelectByClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFile(prev => [...prev, ...selectedFiles]);
  };

  const handleStartRenaming = (index: number, file: any) => {
    setRenamingIndex(index);
    const lastDot = file.name.lastIndexOf('.');
    const baseName = lastDot > 0 ? file.name.substring(0, lastDot) : file.name;
    setNewFileName(baseName);
  };

  const handleSaveRename = (index: number) => {
    const singleFile = file[index] as any;
    const lastDot = singleFile?.name?.lastIndexOf('.');
    const extension = lastDot > 0 ? singleFile.name.substring(lastDot) : '';
    const renamedFile = Object.assign(singleFile, {
      name: newFileName + extension,
    });
    const updatedFiles = [...file];
    updatedFiles[index] = renamedFile as any;
    setFile(updatedFiles);
    setRenamingIndex(-1);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = file[index] as any;
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const updatedFiles = file.filter((_, i) => i !== index);
    setFile(updatedFiles);
    if (renamingIndex === index) {
      setRenamingIndex(-1);
    }
  };

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: uploadDoc,
    onMutate: () => toast.loading('Uploading...', { id: 'upload-toast' }),
    onSuccess: () => {
      refetch();
      toast.dismiss('upload-toast');
      toast.success(`Uploaded successfully!`);
      setFile([]);
      setUploadModal(false);
    },
    onError: () => {
      toast.dismiss('upload-toast');
      toast.error('Failed to upload document.');
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onMutate: () => toast.loading('Creating folder...', { id: 'folder-toast' }),
    onSuccess: () => {
      refetch();
      setModalOpen(false);
      setNewFolderName('');
      toast.dismiss('folder-toast');
      toast.success('Folder created successfully!');
    },
    onError: () => {
      toast.dismiss('folder-toast');
      toast.error('Failed to create folder.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onMutate: () => toast.loading('Deleting...', { id: 'delete-toast' }),
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

  const renameFolderMutation = useMutation({
    mutationFn: renameFolder,
    onMutate: () => toast.loading('Renaming...', { id: 'rename-toast' }),
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

  // Event handlers
  const handleFileChange = (event: any) => {
    const selectedFiles = file;
    if (selectedFiles.length > 0) {
      const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        setFile([]);
        toast.error(`${oversizedFiles.length} file(s) exceed the 50MB size limit!`);
      } else {
        setFile(selectedFiles);
        if (selectedFiles.length === 1) {
          uploadMutation.mutate({
            file: selectedFiles[0],
            id: params.id,
            path: currentPath,
            projectID: undefined,
            task: undefined,
          });
        } else {
          toast.loading(`Uploading ${selectedFiles.length} files...`, {
            id: 'upload-toast',
          });
          let completed = 0;
          let failed = 0;
          selectedFiles.forEach(file => {
            uploadDoc({
              file,
              id: params.id,
              path: currentPath,
              projectID: undefined,
              task: undefined,
            })
              .then(() => {
                completed++;
                if (completed + failed === selectedFiles.length) {
                  toast.dismiss('upload-toast');
                  if (failed === 0) {
                    toast.success(`All ${selectedFiles.length} files uploaded successfully!`);
                  } else {
                    toast.warning(`Uploaded ${completed}/${selectedFiles.length} files successfully.`);
                  }
                  refetch();
                  setFile([]);
                  setUploadModal(false);
                }
              })
              .catch(() => {
                failed++;
                if (completed + failed === selectedFiles.length) {
                  toast.dismiss('upload-toast');
                  if (failed === selectedFiles.length) {
                    toast.error('Failed to upload all files.');
                  } else {
                    toast.warning(`Uploaded ${completed}/${selectedFiles.length} files successfully.`);
                  }
                  refetch();
                }
              });
          });
        }
      }
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    createFolderMutation.mutate({
      projectId: params.id,
      folderName: newFolderName,
      path: currentPath,
    });
  };

  const handleDeleteTask = (name: string, isFolder: boolean) => {
    const itemPath = currentPath ? `${currentPath}/${name}` : name;
    deleteMutation.mutate({
      file: itemPath,
      id: params.id,
      isFolder: isFolder,
    });
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

  const handeDeleteLink = (time: number) => {
    if (!time) return;
    deleteLinkMutation.mutate({ id: params.id, create_time: time });
  };

  const handleRenameFolder = () => {
    if (!selectedDoc) return;
    renameFolderMutation.mutate({
      projectId: params.id,
      currentPath: currentPath,
      currentFolderName: selectedDoc.name,
      newFolderName: updatedFolderName,
    });
    setUpdatedFolderName('');
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

  // Modal handlers
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openUploadModal = () => {
    setUploadModal(true);
    setFile([]);
  };
  const UploadCloseModal = () => setUploadModal(false);
  const LinkOpenModal = () => setLinkModalOpen(true);
  const LinkCloseModal = () => setLinkModalOpen(false);
  const RenameOpenModal = (doc: FileItem) => {
    setSelectedDoc(doc);
    setRenameModalOpen(true);
    setUpdatedFolderName(doc.name);
  };

  const RenameCloseModal = () => {
    setRenameModalOpen(false);
    setUpdatedFolderName('');
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
  const closeDocModal = () => setShowViewer(false);

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return '-';
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    else if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    else return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileType = (mimetype?: string): FileType => {
    if (!mimetype) return 'other';
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'spreadsheet';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype.includes('dwg') || mimetype.includes('cad')) return 'cad';
    return 'other';
  };

  const handleChange = e => {
    const { value, checked } = e.target;

    setCheckedItems(prev => {
      let updatedItems = [...prev];
      if (checked && value) {
        if (value.link) {
          const exists = updatedItems.some(item => item.link === value.link);
          if (!exists) {
            updatedItems.push(value);
          }
        }
        if (value.metadata && value.metadata.mimetype) {
          const itemWithUrl = {
            ...value,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${params.id}/${
              currentPath ? currentPath + '/' : ''
            }${value.name}`,
          };

          const exists = updatedItems.some(item => item.id === itemWithUrl.id);
          if (!exists) {
            updatedItems.push(itemWithUrl);
          }
        }
      } else {
        updatedItems = updatedItems.filter(item => item.create_time !== value.create_time || item.id !== value.id);
      }

      return updatedItems;
    });
  };

  // Update Product
  const sendDoctoClient = useMutation({
    mutationFn: updateProjectClientDocs,
    onSuccess: () => {
      toast.success('Document Sent to Client');
      setButtonLoading(false);
      setCheckedItems([]);
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

  const handleClick = async () => {
    setButtonLoading(true);
    const updatedDocs = checkedItems.map(item => ({
      ...item,
      path: currentPath,
    }));
    // console.log(updatedDocs);
    sendDoctoClient.mutate({ projectID: params.id, newDocs: updatedDocs });
  };

  const handleCreateChat = (topic: string, document: string) => {
    if (!topic?.trim()) return;
    mutation.mutate({
      topic: `Document : ${topic.trim()}`,
      document,
      projectID: params.id,
    });
  };

  // NEW: normalize items and send (single or multiple), then optionally create chat
  const handleSendConfirmed = async (message?: string) => {
    setButtonLoading(true);
    try {
      // choose items: single selectedForSend (when opened per-file) or checkedItems (bulk)
      const itemsToSend = selectedForSend ? [selectedForSend] : checkedItems;
      if (!itemsToSend || itemsToSend.length === 0) {
        toast.error('No documents selected to send');
        return;
      }

      const updatedDocs = itemsToSend.map((item: any) => {
        // if it's a storage file without URL, build the public URL
        if (item.metadata?.mimetype) {
          return {
            ...item,
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${params.id}/${
              currentPath ? currentPath + '/' : ''
            }${item.name}`,
            path: currentPath,
          };
        }
        // for links or already-augmented items, just set path
        return { ...item, path: currentPath };
      });

      // send documents
      await sendDoctoClient.mutateAsync({
        projectID: params.id,
        newDocs: updatedDocs,
      });

      // create chat if message provided (use document names or ids)
      if (message && message.trim()) {
        handleCreateChat(message, updatedDocs);
      }

      // success cleanup
      setCheckedItems([]);
      setSelectedForSend(null);
      setSentDialogOpen(false);
    } catch (err) {
      console.error('Send failed:', err);
      // errors handled via mutation toasts as well
    } finally {
      setButtonLoading(false);
    }
  };

  const filteredTotalDocs = React.useMemo(() => {
    if (!searchQuery.trim()) return totalDocs;
    const q = searchQuery.toLowerCase();
    return totalDocs.filter(item => item.name?.toLowerCase().includes(q));
  }, [searchQuery, totalDocs]);

  const filteredLinks = React.useMemo(() => {
    if (linkLoading) return [];
    if (!searchQuery.trim()) return linkList;
    const q = searchQuery.toLowerCase();
    return linkList.filter(item => item.name?.toLowerCase().includes(q) || item.link?.toLowerCase().includes(q));
  }, [searchQuery, linkList, linkLoading]);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Breadcrumbs and Back */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => goUp()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Up
            </button>
            <span className="text-gray-300">{'|'}</span>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/projects/${params.id}/docs`}>Docs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </BreadcrumbSeparator>
                {/* build breadcrumb from currentPath */}
                {currentPath &&
                  currentPath.split('/').map((part, idx, arr) => {
                    const pathTo = arr.slice(0, idx + 1).join('/');
                    const isLast = idx === arr.length - 1;
                    return (
                      <span key={pathTo} className="flex items-center">
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage>{part}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={`/projects/${params.id}/docs/folders/${encodeURIComponent(pathTo)}`}>
                              {part}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {idx < arr.length - 1 && (
                          <BreadcrumbSeparator>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </BreadcrumbSeparator>
                        )}
                      </span>
                    );
                  })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-10 w-64"
              />
            </div>
            {/* <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="w-4 h-4 mr-2" />
              Sort
            </Button> */}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openModal}>
              <FolderIcon className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            {/* <Button variant="outline" size="sm" onClick={openUploadModal}>
              <Upload className="w-4 h-4 mr-2" />
              
            </Button> */}

            {/* Open dialog for bulk send (clears any previous single selection) */}
            <Button
              disabled={checkedItems.length === 0 || buttonLoading}
              variant="ghost"
              className={`border w-[170px]`}
              onClick={() => {
                setSelectedForSend(null);
                setSentDialogOpen(true);
              }}
            >
              {buttonLoading ? (
                <>
                  Sending...
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <span>Send to Client</span>
                  <MessageSquareShare className="ml-2" />
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  More
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
                <DropdownMenuItem onSelect={openUploadModal}>{'Upload'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                      {/* <input
                        aria-label="Select all"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                      /> */}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      File
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Size
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Modified
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Owner
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!isLoading &&
                    filteredTotalDocs?.map((doc, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {!doc.isFolder && (
                            <Checkbox
                              key={doc.id}
                              value={doc.id}
                              checked={!!checkedItems.find(items => items.id == doc.id)}
                              onCheckedChange={checked =>
                                handleChange({
                                  target: { value: doc, checked },
                                })
                              }
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                              {doc.isFolder ? (
                                <FolderIcon className="w-4 h-4 text-gray-500" />
                              ) : (
                                getFileIcon(getFileType(doc?.metadata?.mimetype))
                              )}
                            </div>
                            <div className="min-w-0">
                              <div
                                onClick={() => {
                                  if (doc.isFolder) {
                                    openFolder(doc);
                                  } else {
                                    handleClickDocs(fileUrl(doc.name), doc.name);
                                  }
                                }}
                                className="text-sm cursor-pointer hover:underline font-medium text-gray-900 truncate"
                                title={doc.name}
                              >
                                {doc.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {doc.isFolder ? 'Folder' : getFileType(doc?.metadata?.mimetype)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(doc?.metadata?.size)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={`/placeholder.svg?height=20&width=20&query=owner-avatar`} />
                              <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">TS</AvatarFallback>
                            </Avatar>
                            <span className="truncate">Team</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 pr-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            {!doc.isFolder && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label="Preview"
                                  onClick={() => handleClickDocs(fileUrl(doc.name), doc.name)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label="Download"
                                  onClick={() => downloadFile(fileUrl(doc.name), doc.name)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label="More"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {doc.isFolder ? (
                                  <DropdownMenuItem onClick={() => RenameOpenModal(doc)}>
                                    <FolderPen className="w-4 h-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => FileRenameOpenModal(doc)}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                )}

                                {/* NEW: Send to Client for single file */}
                                {/* {!doc.isFolder && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedForSend(doc);
                                      setSentDialogOpen(true);
                                    }}
                                  >
                                    <MessageSquareShare className="w-4 h-4 mr-2" />
                                    Send to Client
                                  </DropdownMenuItem>
                                )} */}

                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeleteTarget({
                                      name: doc.name,
                                      isFolder: doc.isFolder,
                                    });
                                    setIsDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {/* Links */}
                  {!linkLoading &&
                    filteredLinks.map(item => {
                      return item.path == currentPath ? (
                        <tr key={item.create_time} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox
                              key={item.create_time}
                              value={item}
                              checked={!!checkedItems.find(items => items.create_time == item.create_time)}
                              onCheckedChange={checked =>
                                handleChange({
                                  target: { value: item, checked },
                                })
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex-shrink-0">
                                <LinkIcon className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <a
                                  title={item.link}
                                  className="text-sm font-medium hover:underline truncate block"
                                  target="_blank"
                                  href={item?.link}
                                  rel="noopener noreferrer"
                                >
                                  {item?.name ? item.name : item.link}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">Link</td>
                          <td className="px-4 py-3 text-sm text-gray-600">-</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(new Date(item?.create_time).toISOString())}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={`/placeholder.svg?height=20&width=20&query=owner-avatar`} />
                                <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">TS</AvatarFallback>
                              </Avatar>
                              <span className="truncate">Team</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 pr-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                    aria-label="Link actions"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => window.open(item.link, '_blank')}>Open Link</DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      try {
                                        navigator.clipboard.writeText(item.link);
                                        toast.success('Link copied to clipboard');
                                      } catch {
                                        toast.error('Unable to copy link');
                                      }
                                    }}
                                  >
                                    Copy Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handeDeleteLink(item.create_time)}>Delete Link</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ) : null;
                    })}
                </tbody>
              </table>
              {!isLoading && filteredTotalDocs?.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">No files in this folder yet. Use Upload to add files.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Folder Modal */}
      <Modal className="!h-[250px] !max-w-[500px] !py-7" isOpen={modalOpen} onRequestClose={closeModal} contentLabel="Folder Create Modal">
        <div className="navbar flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Create Folder</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={closeModal}
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
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder}>Create</Button>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        className="!h-[600px] !max-w-[700px] !py-7"
        isOpen={uploadModal}
        onRequestClose={UploadCloseModal}
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
              onClick={UploadCloseModal}
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
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
            className="border-dashed cursor-pointer mt-10 w-full border-2 flex flex-col gap-5 items-center justify-center py-6 rounded-2xl border-gray-300 hover:border-gray-400 transition-colors"
          >
            <div className="flex flex-col items-center gap-3">
              <input id="fileInput" type="file" multiple onChange={handleSelectByClick} className="hidden" />
              <div className="bg-gray-100 w-24 h-24 flex items-center justify-center rounded-full">
                <Upload size={23} />
              </div>
              <div className="text-center">
                <p className="text-lg mb-1 font-medium">Drag and Drop or Click </p>
                <p className="text-sm text-gray-600">to upload multiple documents (max: 50MB each)</p>
              </div>
              {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
            </div>
          </div>

          {/* File List */}
          {file.length > 0 && (
            <div className="mt-6 border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Selected Files ({file.length})</h3>
                <button
                  onClick={() => {
                    file.forEach(file => {
                      if ((file as any).preview) URL.revokeObjectURL((file as any).preview);
                    });
                    setFile([]);
                    setRenamingIndex(-1);
                  }}
                  className="text-sm hover:text-red-700"
                >
                  Remove All
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {file.map((file, index) => (
                  <div key={(file as any).id || index} className="bg-gray-50 p-3 rounded-lg">
                    {renamingIndex === index ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newFileName}
                          onChange={e => setNewFileName(e.target.value)}
                          className="flex-1 border rounded-l-md p-2 focus:outline-none"
                          autoFocus
                        />
                        <span className="bg-gray-200 px-2 py-[9px] text-gray-700">
                          {(file as any).name.substring((file as any).name.lastIndexOf('.'))}
                        </span>
                        <button onClick={() => handleSaveRename(index)} className="bg-black text-white px-3 py-3 rounded-r-md">
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
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
                          <span className="truncate flex-1">{(file as any).name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleStartRenaming(index, file)} className="text-black">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleRemoveFile(index)} className="text-black hover:text-red-700">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {file.length > 0 && (
                <button onClick={handleFileChange} className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md transition-colors">
                  Upload {file.length} {file.length === 1 ? 'File' : 'Files'}
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Link Create Modal */}
      <Modal
        className="!h-[300px] !max-w-[500px] !py-7"
        isOpen={linkModalOpen}
        onRequestClose={LinkCloseModal}
        contentLabel="Link Create Modal"
      >
        <div className="navbar flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Submit Link</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={LinkCloseModal}
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
          <Button type="submit" variant="outline" onClick={LinkCloseModal}>
            Cancel
          </Button>
          <Button onClick={handleSubmitLink}>Submit</Button>
        </div>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal
        className="!h-[250px] !max-w-[500px] !py-7"
        isOpen={renameModalOpen}
        onRequestClose={RenameCloseModal}
        contentLabel="Rename Folder Modal"
      >
        <div className="navbar flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Rename Folder</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={RenameCloseModal}
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
          <Input placeholder="New Folder Name" value={updatedFolderName} onChange={e => setUpdatedFolderName(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={RenameCloseModal}>
            Cancel
          </Button>
          <Button onClick={handleRenameFolder}>Rename</Button>
        </div>
      </Modal>

      {/* Rename File Modal */}
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

      {/* Document Viewer Modal */}
      <Modal className="!h-[90vh] !max-w-[1200px] !py-7" isOpen={showViewer} onRequestClose={closeDocModal} contentLabel="Document Viewer">
        <div className="navbar flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2" />
          <div className="buttons flex items-center gap-4 !mt-0 px-2">
            {currentDoc && (currentDoc as any)[0]?.fileName && (
              <button
                onClick={() => downloadFile((currentDoc as any)[0].uri, (currentDoc as any)[0].fileName)}
                className="text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
                title="Download with original filename"
              >
                <CloudDownload size={20} />
              </button>
            )}
            <button
              onClick={closeDocModal}
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
        <div>
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
        </div>
      </Modal>

      {/* Sent to Client Dialog */}
      <SentToClientDialog
        open={sentDialogOpen}
        onOpenChange={v => {
          setSentDialogOpen(v);
          if (!v) {
            setSelectedForSend(null);
          }
        }}
        itemName={
          selectedForSend
            ? selectedForSend?.name
            : checkedItems.length === 1
            ? checkedItems[0].name || checkedItems[0].id
            : checkedItems.length > 1
            ? `${checkedItems.length} items`
            : ''
        }
        onConfirm={async (message: string) => {
          await handleSendConfirmed(message);
        }}
      />

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
