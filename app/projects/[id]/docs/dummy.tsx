import {
  FileText,
  Download,
  Trash2,
  FolderSearch,
  Folder,
  ArrowLeft,
  EllipsisVertical,
  Link,
  Eye,
  CloudDownload,
  FolderPen,
  Loader2,
  MessageSquareShare,
  Upload,
  Check,
  Edit2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteFile,
  getAllFiles,
  uploadDoc,
  createFolder,
  downloadFolderAsZip,
  getFolderStats,
  addLink,
  getLinks,
  deleteLink,
  renameFolder,
  updateProjectClientDocs,
  fetchOnlyProject,
} from "@/api/API";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "react-modal";
import "@cyntler/react-doc-viewer/dist/index.css";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function ProjectDocuments({ prjectID }) {
  const fileInputRef = useRef(null);
  // const [fil, setFile] = useState(null);
  const [totalDocs, setTotalDocs] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [link, setLink] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkList, setLinkList] = useState([]);
  const [updatedFolderName, setUpdatedFolderName] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  const [file, setFile] = useState([]);
  const [error, setError] = useState("");
  const [renamingIndex, setRenamingIndex] = useState(-1);
  const [newFileName, setNewFileName] = useState("");

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      file.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  // Handle file input change
  // const handleFileChange = event => {
  //   const selectedFiles = Array.from(event.target.files);

  //   // Validate files
  //   if (selectedFiles.some(file => file.size > 20 * 1024 * 1024)) {
  //     setError('One or more files exceed the 20MB limit');
  //     return;
  //   }

  //   // Process files
  //   const processedFiles = selectedFiles.map(file => {
  //     return Object.assign(file, {
  //       preview: URL.createObjectURL(file),
  //       originalName: file.name,
  //       id: Math.random().toString(36).substring(2),
  //     });
  //   });

  //   setFile(prev => [...prev, ...processedFiles]);
  //   setError('');

  //   // Reset the file input
  //   event.target.value = '';
  // };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleStartRenaming = (index, file) => {
    setRenamingIndex(index);
    const lastDot = file.name.lastIndexOf(".");
    const baseName = lastDot > 0 ? file.name.substring(0, lastDot) : file.name;
    setNewFileName(baseName);
  };

  const handleSaveRename = (index) => {
    const singleFile = file[index];
    const lastDot = singleFile?.name?.lastIndexOf(".");
    const extension = lastDot > 0 ? singleFile.name.substring(lastDot) : "";

    // Create a new file object with the renamed file
    const renamedFile = new File([singleFile], newFileName + extension, {
      type: singleFile.type,
    });

    // Keep the preview and ID
    Object.assign(renamedFile, {
      preview: singleFile.preview,
      originalName: singleFile.originalName,
      id: singleFile.id,
    });

    // Update the file in the array
    const updatedFiles = [...file];
    updatedFiles[index] = renamedFile;
    setFile(updatedFiles);
    setRenamingIndex(-1);
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = file[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updatedFiles = file.filter((_, i) => i !== index);
    setFile(updatedFiles);

    if (renamingIndex === index) {
      setRenamingIndex(-1);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);

      // Validate files
      if (droppedFiles.some((file) => file.size > 50 * 1024 * 1024)) {
        setError("One or more files exceed the 50MB limit");
        return;
      }

      // Process files
      const processedFiles = droppedFiles.map((file) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          originalName: file.name,
          id: Math.random().toString(36).substring(2),
        });
      });

      setFile((prev) => [...prev, ...processedFiles]);
      setError("");
    }
  };

  // Update Product
  const sendDoctoClient = useMutation({
    mutationFn: updateProjectClientDocs,
    onSuccess: () => {
      toast.success("Document Sent to Client");
      setButtonLoading(false);
      setCheckedItems([]);
    },
    onError: () => {
      toast("Error! Try again");
    },
  });

  const handleClick = async () => {
    setButtonLoading(true);
    const updatedDocs = checkedItems.map((item) => ({
      ...item,
      path: currentPath,
    }));
    sendDoctoClient.mutate({ projectID: prjectID, newDocs: updatedDocs });
  };

  const handleChange = (e) => {
    const { value, checked } = e.target;

    setCheckedItems((prev) => {
      let updatedItems = [...prev];
      if (checked && value) {
        if (value.link) {
          const exists = updatedItems.some((item) => item.link === value.link);
          if (!exists) {
            updatedItems.push(value);
          }
        }
        if (value.metadata && value.metadata.mimetype) {
          const itemWithUrl = {
            ...value,
            url: `${
              import.meta.env.VITE_supabaseURl
            }/storage/v1/object/public/Docs/${prjectID}/${
              currentPath ? currentPath + "/" : ""
            }${value.name}`,
          };
          const exists = updatedItems.some(
            (item) => item.id === itemWithUrl.id
          );
          if (!exists) {
            updatedItems.push(itemWithUrl);
          }
        }
      } else {
        updatedItems = updatedItems.filter(
          (item) =>
            item.create_time !== value.create_time || item.id !== value.id
        );
      }

      return updatedItems;
    });
  };

  // For Doc View
  const [showViewer, setShowViewer] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);

  const handleClickDocs = (url, fileName) => {
    setCurrentDoc([
      {
        uri: url,
        fileName: fileName,
      },
    ]);
    setShowViewer(true);
  };

  function closeDocModal() {
    setShowViewer(false);
  }

  function afterCloseViewer() {
    closeDocModal();
  }

  // Fetch Links
  const {
    data,
    isLoading: linkLoading,
    refetch: LinkRefetch,
  } = useQuery({
    queryKey: ["GetLinks", prjectID],
    queryFn: () => getLinks(prjectID),
    enabled: !!prjectID,
  });

  // Fetch Project Data
  const {
    data: ProjectData,
    isLoading: projectLoading,
    refetch: projectRefetch,
  } = useQuery({
    queryKey: ["FetchOnlyProject", prjectID],
    queryFn: () => fetchOnlyProject({ projectID: prjectID }),
    enabled: !!prjectID,
  });

  // const { getRootProps, getInputProps } = useDropzone({
  //   maxSize: 20 * 1024 * 1024, // 5MB limit
  //   onDrop: (acceptedFiles, rejectedFiles) => {
  //     if (rejectedFiles.length > 0 || acceptedFiles.length === 0) {
  //       setError('Only image files (PNG, JPG, JPEG, GIF, WEBP) are allowed (max: 5MB).');
  //       return;
  //     }
  //     const uploadedFile = acceptedFiles[0];
  //     setError('');
  //     setFiles(Object.assign(uploadedFile, { preview: URL.createObjectURL(uploadedFile) }));
  //   },
  // });

  useEffect(() => {
    if (linkLoading) return;
    setLinkList(data);
  }, [data, linkLoading]);

  function closeModal() {
    setModalOpen(false);
  }

  function UploadCloseModal() {
    setUploadModal(false);
  }

  function LinkCloseModal() {
    setLinkModalOpen(false);
  }

  function afterCloseModal() {
    setModalOpen(false);
  }

  function UploadAfterCloseModal() {
    setUploadModal(false);
  }

  function LinkAfterCloseModal() {
    setModalOpen(false);
  }

  function openModal() {
    setModalOpen(true);
  }

  function openUploadModal() {
    setUploadModal(true);
  }

  function LinkOpenModal() {
    setLinkModalOpen(true);
  }

  const RenameOpenModal = (doc) => {
    setSelectedDoc(doc);
    setRenameModalOpen(true);
  };
  function RenameCloseModal() {
    setRenameModalOpen(false);
    setUpdatedFolderName("");
  }

  function RenameAfterCloseModal() {
    RenameCloseModal();
  }

  // Get All Files
  const {
    data: files,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["GetAllFiles", prjectID, currentPath],
    queryFn: () => getAllFiles(prjectID, currentPath),
    enabled: !!prjectID,
  });

  // File Upload Function
  const mutation = useMutation({
    mutationFn: uploadDoc,
    onMutate: () => {
      toast.loading("Uploading...", { id: "upload-toast" });
    },
    onSuccess: (data) => {
      refetch();
      toast.dismiss("upload-toast");
      toast.success(`Uploaded successfully!`);
      setFile([]);
      setUploadModal(false);
    },
    onError: () => {
      toast.dismiss("upload-toast");
      toast.error("Failed to upload document.");
    },
  });

  // Link Creation Function
  const linkMutation = useMutation({
    mutationFn: addLink,
    onSuccess: () => {
      LinkRefetch();
      setLinkModalOpen(false);
      setLink("");
      setLinkName("");
      toast.success("Link added!");
    },
    onError: () => {
      toast.error("Failed to add link");
    },
  });

  // Link Delete Function
  const deleteLinkMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      LinkRefetch();
      toast.success("Link Deleted!");
    },
    onError: () => {
      toast.error("Failed to delete link");
    },
  });

  // handle Delete Link
  const handeDeleteLink = (time) => {
    if (!time) return;
    deleteLinkMutation.mutate({ id: prjectID, create_time: time });
  };

  // Folder Creation Function
  const folderMutation = useMutation({
    mutationFn: createFolder,
    onMutate: () => {
      toast.loading("Creating folder...", { id: "folder-toast" });
    },
    onSuccess: () => {
      refetch();
      setModalOpen(false);
      setNewFolderName("");
      toast.dismiss("folder-toast");
      toast.success("Folder created successfully!");
    },
    onError: () => {
      toast.dismiss("folder-toast");
      toast.error("Failed to create folder.");
    },
  });

  // Folder Stats Mutation
  const folderStatsMutation = useMutation({
    mutationFn: getFolderStats,
    onSuccess: (data, variables) => {
      setTotalDocs((prev) =>
        prev.map((doc) =>
          doc.name === variables.folderName
            ? { ...doc, folderStats: data }
            : doc
        )
      );
    },
  });

  // Folder Download Mutation
  const downloadFolderMutation = useMutation({
    mutationFn: downloadFolderAsZip,
    onMutate: () => {
      setIsDownloading(true);
      toast.loading("Preparing download...", { id: "download-toast" });
    },
    onSuccess: (downloadUrl, variables) => {
      toast.dismiss("download-toast");
      toast.success("Download ready!");

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${variables.folderName}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);
    },
    onError: () => {
      toast.dismiss("download-toast");
      toast.error("Failed to download folder.");
      setIsDownloading(false);
    },
  });

  // File delete Function
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onMutate: () => {
      toast.loading("Deleting...", { id: "delete-toast" });
    },
    onSuccess: () => {
      refetch();
      toast.dismiss("delete-toast");
      toast.success(`Deleted successfully!`);
    },
    onError: () => {
      toast.dismiss("delete-toast");
      toast.error("Failed to delete file.");
    },
  });

  // Folder Rename Function
  const renameFolderMutation = useMutation({
    mutationFn: renameFolder,
    onMutate: () => {
      toast.loading("Renaming...", { id: "rename-toast" });
    },
    onSuccess: () => {
      refetch();
      setRenameModalOpen(false);
      toast.dismiss("rename-toast");
      toast.success(`Renamed successfully!`);
    },
    onError: () => {
      toast.dismiss("rename-toast");
      toast.error("Failed to rename folder.");
    },
  });

  useEffect(() => {
    if (isLoading) return;

    // Process the data to identify folders and files
    if (files?.data) {
      const processedDocs = files.data.map((item) => ({
        ...item,
        isFolder: !item.metadata,
      }));
      setTotalDocs(processedDocs);

      // Fetch stats for all folders
      processedDocs
        .filter((doc) => doc.isFolder)
        .forEach((folder) => {
          folderStatsMutation.mutate({
            projectId: prjectID,
            folderName: folder.name,
            path: currentPath,
          });
        });
    }
  }, [isLoading, files, prjectID, currentPath]);

  const handleSelectByClick = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFile((prev) => [...prev, ...selectedFiles]);
  };

  // Upload Files
  const handleFileChange = (event) => {
    const selectedFiles = file;
    if (selectedFiles.length > 0) {
      // Check if any file exceeds the size limit
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > MAX_FILE_SIZE
      );

      if (oversizedFiles.length > 0) {
        // Alert about oversized files
        setFile(null);
        toast.error(
          `${oversizedFiles.length} file(s) exceed the 50MB size limit!`
        );
      } else {
        // Store all selected files in state
        setFile(selectedFiles);

        // Handle uploads based on the number of files
        if (selectedFiles.length === 1) {
          // Single file upload
          mutation.mutate({
            file: selectedFiles[0],
            id: prjectID,
            path: currentPath,
          });
        } else {
          // Multiple files - create a toast group
          toast.loading(`Uploading ${selectedFiles.length} files...`, {
            id: "upload-toast",
          });

          // Track upload progress
          let completed = 0;
          let failed = 0;

          selectedFiles.forEach((file) => {
            uploadDoc({ file, id: prjectID, path: currentPath })
              .then(() => {
                completed++;
                if (completed + failed === selectedFiles.length) {
                  // All uploads finished
                  toast.dismiss("upload-toast");
                  if (failed === 0) {
                    toast.success(
                      `All ${selectedFiles.length} files uploaded successfully!`
                    );
                  } else {
                    toast.warning(
                      `Uploaded ${completed}/${selectedFiles.length} files successfully.`
                    );
                  }
                  refetch();
                  setFile([]);
                  setUploadModal(false);
                }
              })
              .catch(() => {
                failed++;
                if (completed + failed === selectedFiles.length) {
                  // All uploads finished
                  toast.dismiss("upload-toast");
                  if (failed === selectedFiles.length) {
                    toast.error("Failed to upload all files.");
                  } else {
                    toast.warning(
                      `Uploaded ${completed}/${selectedFiles.length} files successfully.`
                    );
                  }
                  refetch();
                }
              });
          });
        }
      }
    }
  };

  // Delete files or folders
  const handleDeleteTask = (name, isFolder) => {
    const itemPath = currentPath ? `${currentPath}/${name}` : name;
    deleteMutation.mutate({
      file: itemPath,
      id: prjectID,
      isFolder: isFolder,
    });
  };

  // Navigate into a folder
  const navigateToFolder = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  // Navigate back to parent folder
  const navigateUp = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split("/");
    pathParts.pop();
    const parentPath = pathParts.join("/");
    setCurrentPath(parentPath);
  };

  // handle Submit Link
  const handleSubmitLink = () => {
    if (!link.trim()) {
      toast.error("Link cannot be empty");
      return;
    }
    try {
      const url = new URL(link);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error();
      }
      const hostname = url.hostname.toLowerCase();
      const suspiciousDomains = ["example.com", "test.com", "localhost"];
      if (suspiciousDomains.some((domain) => hostname.includes(domain))) {
        toast.error("This URL appears to be a test or example URL");
        return;
      }
      linkMutation.mutate({
        id: prjectID,
        link: link,
        name: linkName,
        create_time: new Date().getTime(),
        path: currentPath,
      });
    } catch (error) {
      toast.error(
        "Please enter a valid URL (starting with http:// or https://)"
      );
    }
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }
    folderMutation.mutate({
      projectId: prjectID,
      folderName: newFolderName,
      path: currentPath,
    });
  };

  // Rename Folder
  const handleRenameFolder = () => {
    renameFolderMutation.mutate({
      projectId: prjectID,
      currentPath: currentPath,
      currentFolderName: selectedDoc.name,
      newFolderName: updatedFolderName,
    });

    setUpdatedFolderName("");
  };

  // Download folder as zip
  const handleFolderDownload = (folderName) => {
    const folderPath = currentPath
      ? `${currentPath}/${folderName}`
      : folderName;

    setIsDownloading(true);
    toast.loading("Creating ZIP file...", { id: "download-toast" });
    downloadFolderMutation.mutate(
      {
        projectId: prjectID,
        folderPath,
        folderName,
      },
      {
        onSuccess: () => {
          toast.dismiss("download-toast");
          toast.success("Download complete!");
          setIsDownloading(false);
        },
        onError: (error) => {
          toast.dismiss("download-toast");
          toast.error(`Download failed: ${error.message}`);
          setIsDownloading(false);
        },
      }
    );
  };

  // Format file size
  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return "-";

    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg text-gray-700 font-medium">
            Project Documents
          </h2>
          {currentPath && (
            <div className="flex items-center ml-4">
              <Button variant="ghost" size="sm" onClick={navigateUp}>
                <ArrowLeft className="w-3 h-3" />
                Back
              </Button>
              <span className="text-gray-500 text-sm ml-2">
                <span className="inline-block">{currentPath}</span>
              </span>
            </div>
          )}
        </div>
        {/* <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple /> */}
        <div className="flex items-center gap-3">
          <Button
            disabled={checkedItems.length === 0 || buttonLoading}
            variant="ghost"
            className={`border w-[170px]`}
            onClick={handleClick}>
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
              <button className="text-sm font-semibold text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
                <EllipsisVertical size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] bg-white absolute z-[9999] -right-7">
              <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all   cursor-pointer">
                <button
                  onClick={openModal}
                  className=" w-full flex items-center py-1 px-2 ">
                  <Folder className="w-4 h-4 mr-2" />
                  <span>Create Folder</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all !hover:bg-red-500 cursor-pointer">
                <div>
                  <button
                    // onClick={e => {
                    //   fileInputRef.current.click();
                    // }}
                    onClick={openUploadModal}
                    className=" w-full flex items-center py-1 px-2 ">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Upload Document</span>
                  </button>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all   cursor-pointer">
                <button
                  onClick={LinkOpenModal}
                  className=" w-full flex items-center py-1 px-2 ">
                  <Link className="w-4 h-4 mr-2" />
                  <span>Add Link</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[10px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading &&
            totalDocs?.map((doc, index) => (
              <TableRow key={index}>
                <TableCell>
                  {!doc.isFolder && (
                    <Checkbox
                      key={doc.id}
                      value={doc.id}
                      checked={
                        !!checkedItems.find((items) => items.id == doc.id)
                      }
                      onCheckedChange={(checked) =>
                        handleChange({ target: { value: doc, checked } })
                      }
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-[250px]">
                  {doc.isFolder ? (
                    <button className="flex items-center gap-2 ">
                      <Folder
                        strokeWidth={1.2}
                        className="w-6 h-6 text-gray-500"
                      />
                      <span
                        onClick={() => navigateToFolder(doc.name)}
                        className="truncate">
                        {doc.name}
                      </span>
                      {/*Rename Folder Modal */}
                      <Modal
                        className="!h-[250px] !max-w-[500px] !py-7"
                        isOpen={renameModalOpen}
                        onRequestClose={RenameAfterCloseModal}
                        contentLabel="Rename Folder Modal">
                        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold flex items-center gap-2">
                              <p> {doc.name}</p>
                            </div>
                          </div>
                          {/* Delete and Close Modal Section */}
                          <div className="buttons flex items-center gap-3 !mt-0 px-2">
                            <button
                              onClick={() => RenameCloseModal()}
                              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24">
                                <path
                                  fill="currentColor"
                                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="py-4 my-7">
                          <Input
                            placeholder="Folder Name"
                            value={updatedFolderName}
                            onChange={(e) =>
                              setUpdatedFolderName(e.target.value)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            onClick={() => RenameCloseModal()}>
                            Cancel
                          </Button>
                          <Button onClick={() => handleRenameFolder()}>
                            Rename
                          </Button>
                        </div>
                      </Modal>
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      {doc?.metadata?.mimetype == "image/jpeg" ||
                      doc?.metadata?.mimetype == "image/png" ? (
                        <div className="w-10 flex-shrink-0 h-10 rounded-lg overflow-hidden">
                          <img
                            className="w-full h-full object-cover"
                            src={`${
                              import.meta.env.VITE_supabaseURl
                            }/storage/v1/object/public/Docs/${prjectID}/${
                              currentPath ? currentPath + "/" : ""
                            }${doc.name}`}
                            alt=""
                          />
                        </div>
                      ) : (
                        <FileText
                          strokeWidth={1.2}
                          className="w-6 h-6 text-gray-500"
                        />
                      )}

                      {!doc.isFolder ? (
                        doc?.metadata?.mimetype == "image/heic" ? (
                          <a
                            className=" truncate"
                            target="_blank"
                            href={`${
                              import.meta.env.VITE_supabaseURl
                            }/storage/v1/object/public/Docs/${prjectID}/${
                              currentPath ? currentPath + "/" : ""
                            }${doc.name}`}>
                            {" "}
                            {doc.name}
                          </a>
                        ) : (
                          <span
                            className="w-full truncate cursor-pointer hover:underline flex items-center gap-2"
                            onClick={() =>
                              handleClickDocs(
                                `${
                                  import.meta.env.VITE_supabaseURl
                                }/storage/v1/object/public/Docs/${prjectID}/${
                                  currentPath ? currentPath + "/" : ""
                                }${doc.name}`,
                                doc.name
                              )
                            }>
                            {doc.name}
                          </span>
                        )
                      ) : (
                        <span className="truncate">{doc.name}</span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {doc.isFolder ? `Folder` : doc?.metadata?.mimetype}
                </TableCell>
                <TableCell>
                  {doc.isFolder
                    ? doc.folderStats?.lastModified
                      ? new Date(
                          doc.folderStats.lastModified
                        ).toLocaleDateString()
                      : new Date(doc.created_at).toLocaleDateString()
                    : new Date(doc.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {doc.isFolder
                    ? formatFileSize(doc.folderStats?.size)
                    : formatFileSize(doc?.metadata?.size)}
                </TableCell>
                <TableCell align="center">
                  <Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-sm font-semibold text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
                          <EllipsisVertical size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-white absolute z-[9999] -right-7">
                        {doc.isFolder && (
                          <DropdownMenuItem
                            onClick={() => RenameOpenModal(doc)}
                            className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                            <FolderPen className="w-4 h-4 text-gray-500" />
                            Rename
                          </DropdownMenuItem>
                        )}
                        {!doc.isFolder && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleClickDocs(
                                `${
                                  import.meta.env.VITE_supabaseURl
                                }/storage/v1/object/public/Docs/${prjectID}/${
                                  currentPath ? currentPath + "/" : ""
                                }${doc.name}`,
                                doc.name
                              )
                            }
                            className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                            <Eye className="w-4 h-4 text-gray-500" />
                            View
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                          <button
                            className="flex items-center gap-2"
                            disabled={isDownloading && doc.isFolder}
                            onClick={() => {
                              if (doc.isFolder) {
                                handleFolderDownload(doc.name);
                              }
                            }}>
                            {!doc.isFolder ? (
                              // <a
                              //   href={`${import.meta.env.VITE_supabaseURl}/storage/v1/object/public/Docs/${prjectID}/${
                              //     currentPath ? currentPath + '/' : ''
                              //   }${doc.name}`}
                              //   download={doc.name}
                              //   target="_blank"
                              //   rel="noopener noreferrer"
                              //   className="w-full flex items-center gap-2"
                              // >
                              //   <Download className="w-4 h-4 text-gray-500" /> Download
                              // </a>
                              <button
                                onClick={() =>
                                  downloadFile(
                                    `${
                                      import.meta.env.VITE_supabaseURl
                                    }/storage/v1/object/public/Docs/${prjectID}/${
                                      currentPath ? currentPath + "/" : ""
                                    }${doc.name}`,
                                    doc.name
                                  )
                                }
                                className="w-full flex items-center gap-2">
                                <Download className="w-4 h-4 text-gray-500" />{" "}
                                Download
                              </button>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Download className="w-4 h-4 text-gray-500" />{" "}
                                Download
                              </span>
                            )}
                          </button>
                        </DropdownMenuItem>
                        <DialogTrigger className="w-full">
                          <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                            <Trash2 className="w-4 h-4 text-gray-500" />
                            Delete
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DeleteDialog
                      task={{ id: doc.name, isFolder: doc.isFolder }}
                      handleDeleteTask={() =>
                        handleDeleteTask(doc.name, doc.isFolder)
                      }
                    />
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          {/* Links */}
          {!linkLoading &&
            linkList.map((item) => {
              return item.path == currentPath ? (
                <TableRow>
                  <TableCell>
                    <Checkbox
                      key={item.create_time}
                      value={item.create_time}
                      checked={
                        !!checkedItems.find(
                          (items) => items.create_time == item.create_time
                        )
                      }
                      onCheckedChange={(checked) =>
                        handleChange({ target: { value: item, checked } })
                      }
                    />
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="flex font-medium items-center gap-2">
                      <Link className="!w-4 !h-4 text-gray-500 flex-shrink-0"></Link>
                      <a
                        title={item.link}
                        className="duration-300 truncate hover:underline"
                        target="_blank"
                        href={item?.link}>
                        {item?.name ? item.name : item.link}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>Link</TableCell>
                  <TableCell>
                    {new Date(item?.create_time).toLocaleDateString()}
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell align="center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-sm font-semibold text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
                          <EllipsisVertical size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-white absolute z-[9999] -right-7">
                        <DropdownMenuItem
                          onClick={() => handeDeleteLink(item.create_time)}
                          className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                          <Trash2 className="w-4 h-4 text-gray-500" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ) : null;
            })}
        </TableBody>
      </Table>{" "}
      {!isLoading && totalDocs?.length < 1 && (
        <div className="py-10 pt-12 flex flex-col gap-4 items-center w-full justify-center">
          <button
            // onClick={e => {
            //   fileInputRef.current.click();
            // }}
            onClick={openUploadModal}
            className="border rounded-md flex items-center py-2 px-4 hover:bg-slate-100 ">
            <FileText className="w-4 h-4 mr-2" />
            <span>Upload Document</span>
          </button>
        </div>
      )}
      <div>
        <h2 className="text-lg text-gray-700 mb-7 mt-9 font-medium">
          Tasks Documents
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead></TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!projectLoading &&
              ProjectData?.attachments?.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium max-w-[250px]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex flex-shrink-0 h-10 items-center justify-center rounded-lg overflow-hidden">
                        {/\.(jpg|jpeg|ico|png|gif|bmp|webp|svg)$/i.test(
                          doc.link
                        ) ? (
                          <img
                            className="w-full h-full object-cover"
                            src={doc.link}
                            alt=""
                          />
                        ) : (
                          <FileText
                            strokeWidth={1.2}
                            className="w-6 h-6 text-gray-500"
                          />
                        )}
                      </div>

                      <span
                        className="w-full truncate cursor-pointer hover:underline flex items-center gap-2"
                        onClick={() =>
                          handleClickDocs(doc.link, doc.link.split("/")[9])
                        }>
                        {doc.link.split("/")[9]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{doc?.taskName}</TableCell>
                  <TableCell>
                    {new Date(doc?.time).toLocaleDateString()}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell align="center">
                    {/* <Dialog> */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-sm font-semibold text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
                          <EllipsisVertical size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-white absolute z-[9999] -right-7">
                        {!doc.isFolder && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleClickDocs(doc.link, doc.link.split("/")[9])
                            }
                            className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                            <Eye className="w-4 h-4 text-gray-500" />
                            View
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                          <button
                            className="flex items-center gap-2"
                            disabled={isDownloading && doc.isFolder}>
                            <a
                              href={doc.link}
                              download={doc.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center gap-2">
                              <Download className="w-4 h-4 text-gray-500" />{" "}
                              Download
                            </a>
                          </button>
                        </DropdownMenuItem>
                        {/* <DialogTrigger className="w-full">
                            <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                              <Trash2 className="w-4 h-4 text-gray-500" />
                              Delete
                            </DropdownMenuItem>
                          </DialogTrigger> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* <DeleteDialog
                        task={{ id: doc.name, isFolder: doc.isFolder }}
                        handleDeleteTask={() => handleDeleteTask(doc.name, doc.isFolder)}
                      /> */}
                    {/* </Dialog> */}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {/* Folder Create Modal */}
      <Modal
        className="!h-[250px] !max-w-[500px] !py-7"
        isOpen={modalOpen}
        onRequestClose={afterCloseModal}
        contentLabel="Folder Create Modal">
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Create Folder</p>
            </div>
          </div>
          {/* Delete and Close Modal Section */}
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={() => closeModal()}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="py-4 my-7">
          <Input
            placeholder="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder}>Create</Button>
        </div>
      </Modal>
      {/* Image Upload Modal */}
      <Modal
        className="!h-[600px] !max-w-[700px] !py-7"
        isOpen={uploadModal}
        onRequestClose={UploadAfterCloseModal}
        contentLabel="Link Create Modal">
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Upload Documents</p>
            </div>
          </div>
          {/* Delete and Close Modal Section */}
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={() => UploadCloseModal()}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24">
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
            onClick={() => document.getElementById("fileInput").click()}
            className="border-dashed cursor-pointer mt-10 w-full border-2 flex flex-col gap-5 items-center justify-center py-6 rounded-2xl  border-gray-300 hover:border-gray-400 transition-colors">
            <div className="flex flex-col items-center gap-3">
              <input
                id="fileInput"
                type="file"
                multiple
                onChange={handleSelectByClick}
                className="hidden"
              />
              <div className="bg-gray-100 w-24 h-24 flex items-center justify-center rounded-full">
                <Upload size={23} />
              </div>
              <div className="text-center">
                <p className="text-lg mb-1 font-medium">
                  Drag and Drop or Click{" "}
                </p>
                <p className="text-sm text-gray-600">
                  to upload multiple documents (max: 50MB each)
                </p>
              </div>
              {error && (
                <p className="text-red-500 text-sm font-semibold">{error}</p>
              )}
            </div>
          </div>

          {/* File List */}
          {file.length > 0 && (
            <div className="mt-6 border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Selected Files ({file.length})</h3>
                <button
                  onClick={() => {
                    file.forEach((file) => {
                      if (file.preview) URL.revokeObjectURL(file.preview);
                    });
                    setFile([]);
                    setRenamingIndex(-1);
                  }}
                  className="text-sm  hover:text-red-700">
                  Remove All
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {file.map((file, index) => (
                  <div key={file.id} className="bg-gray-50 p-3 rounded-lg">
                    {renamingIndex === index ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          className="flex-1 border rounded-l-md p-2 focus:outline-none "
                          autoFocus
                        />
                        <span className="bg-gray-200 px-2 py-[9px] text-gray-700">
                          {file.name.substring(file.name.lastIndexOf("."))}
                        </span>
                        <button
                          onClick={() => handleSaveRename(index)}
                          className="bg-black text-white px-3 py-3 rounded-r-md ">
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
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </div>
                          <span className="truncate flex-1">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartRenaming(index, file)}
                            className="text-black ">
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-black hover:text-red-700">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {file.length > 0 && (
                <button
                  onClick={handleFileChange}
                  className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md  transition-colors">
                  Upload {file.length} {file.length === 1 ? "File" : "Files"}
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
        onRequestClose={LinkAfterCloseModal}
        contentLabel="Link Create Modal">
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
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="py-4 my-7 space-y-4">
          <Input
            type="text"
            placeholder="Link Name"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
          />
          <Input
            type="url"
            placeholder="Enter Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="submit"
            variant="outline"
            onClick={() => LinkCloseModal()}>
            Cancel
          </Button>
          <Button onClick={handleSubmitLink}>Submit</Button>
        </div>
      </Modal>
      {/* Document view Modal */}
      <Modal
        className="!h-[90vh] !max-w-[1200px] !py-7"
        isOpen={showViewer}
        onRequestClose={afterCloseViewer}
        contentLabel="Folder Create Modal">
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p></p>
            </div>
          </div>
          {/* Delete and Close Modal Section */}
          <div className="buttons flex items-center gap-4 !mt-0 px-2">
            {/* Custom download button with original filename */}
            {currentDoc && currentDoc[0]?.fileName && (
              <button
                onClick={() =>
                  downloadFile(currentDoc[0].uri, currentDoc[0].fileName)
                }
                className="text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
                title="Download with original filename">
                <CloudDownload size={20} />
              </button>
            )}
            <button
              onClick={() => closeDocModal()}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <div style={{ marginTop: "20px", width: "100%", height: "500px" }}>
            <DocViewer
              pluginRenderers={DocViewerRenderers}
              className="DocViewr"
              documents={currentDoc}
              config={{
                header: {
                  disableHeader: false,
                  disableFileName: false,
                  retainURLParams: false,
                },
              }}
              style={{ height: "100%" }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
