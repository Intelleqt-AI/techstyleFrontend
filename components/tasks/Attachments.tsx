import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, Eye, Paperclip, Trash2 } from 'lucide-react';
import { deleteFile, getAllFiles, uploadDoc } from '@/supabase/API';
import { Input } from '../ui/input';
import { DeleteDialog } from '../DeleteDialog';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const Attachments = ({ task, projectID }) => {
  const [file, setFile] = useState(null);
  const [totalDocs, setTotalDocs] = useState([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletedFile, setDeletedFile] = useState(null);

  // Get All Files
  const {
    data: files,
    isLoading: attachentLoading,
    error: attachentError,
    refetch: attachentRefetch,
  } = useQuery({
    queryKey: ['GetAllFiles', task?.id],
    queryFn: () => getAllFiles(task?.id),
    enabled: !!task?.id,
  });

  // File Upload Function
  const attachmentMutation = useMutation({
    mutationFn: uploadDoc,
    onMutate: () => {
      toast.loading('Uploading...', { id: 'upload-toast' });
    },
    onSuccess: data => {
      // queryClient.invalidateQueries(['tasks']);
      attachentRefetch();
      toast.dismiss('upload-toast');
      toast.success(`Uploaded successfully!`);
    },
    onError: () => {
      toast.dismiss('upload-toast');
      toast.error('Failed to upload document.');
    },
  });

  // File delete Function
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onMutate: () => {
      toast.loading('Deleting...', { id: 'delete-toast' });
    },
    onSuccess: () => {
      attachentRefetch();
      toast.dismiss('delete-toast');
      toast.success(`Deleted successfully!`);
      setDeletedFile(null);
    },
    onError: () => {
      toast.dismiss('delete-toast');
      toast.error('Failed to delete file.');
    },
  });

  //  handle Modal open

  const handleModalOpen = file => {
    setDeletedFile(file);
    setIsDeleteOpen(true);
  };

  // Delete files
  const handleDeleteFile = id => {
    console.log({ file: id, id: task?.id });
    deleteMutation.mutate({ file: deletedFile?.name, id: task?.id });
  };

  const handleFileChange = event => {
    if (!task?.id) {
      toast.error('Please enter task name before uploading attachments.');
      return;
    }

    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFile(null);
        toast('File size must be less than 5MB!');
      } else {
        setFile(selectedFile);
        console.log({ file: selectedFile, id: task?.id, projectID: projectID, task });
        attachmentMutation.mutate({ file: selectedFile, id: task?.id, projectID: projectID, task });
      }
    }
  };

  useEffect(() => {
    if (attachentLoading) return;
    setTotalDocs(files?.data);
  }, [attachentLoading, files]);

  return (
    <div className="">
      <div className="list my-10 flex flex-col gap-4">
        {totalDocs &&
          totalDocs?.map((item, i) => {
            return (
              <div key={i} className="item flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="img-box overflow-hidden border flex items-center justify-center  h-[74px] w-[74px] rounded-2xl">
                    {item?.metadata?.mimetype.includes('image') ? (
                      <img
                        className="w-full  h-full object-cover"
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${task?.id}/${item?.name}`}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="35"
                        height="35"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8A9099"
                        stroke-width="0.75"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-file"
                      >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className={`title text-sm font-medium text-[#17181B]`}>{item?.name}</div>
                    <div className="title text-xs font-normal text-[#8A9099] mt-1">
                      Uploaded on {new Date(item?.created_at).toLocaleString()}
                    </div>
                    <div className={`title text-xs font-normal text-[#8A9099] mt-1`}>
                      {(item?.metadata?.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 px-4">
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${task?.id}/${item?.name}`}
                      download={item?.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </a>
                  </Button>
                  <span onClick={() => handleModalOpen(item)} className="hover:bg-gray-100 p-3 cursor-pointer rounded-md">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </span>
                </div>
              </div>
            );
          })}
      </div>
      <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
        <div className="flex items-center gap-2 text-[13px] text-gray-600 self-start pt-1">
          <span className="text-gray-500">
            <Paperclip className="h-4 w-4" />
          </span>
          <span className="truncate">Attachment</span>
        </div>

        <div className="item flex  items-center justify-between gap-2 flex-wrap cursor-pointer">
          <div className="flex w-full justify-between items-center">
            <Input id="files" type="file" multiple onChange={handleFileChange} className="bg-white w-full h-9 text-sm rounded-xl" />
            {/* <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} /> */}
            {/* <Button variant="outline" className="bg-white hover:bg-gray-50" onClick={handleButtonClick}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M18 12h-6m0 0H6m6 0V6m0 6v6"
                />
              </svg>
              Add Attachment
            </Button> */}
          </div>
        </div>
      </div>
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDeleteFile(deletedFile?.id)}
        title="Delete Task"
        description="Are you sure you want to delete this file? This action cannot be undone."
        itemName={deletedFile?.name}
        requireConfirmation={false}
      />
    </div>
  );
};

export default Attachments;
