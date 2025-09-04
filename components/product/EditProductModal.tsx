import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import Modal from 'react-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomSelect from './CustomSelect';
import useSupplier from '@/hooks/useSupplier';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AddSupplier from '../contacts/AddSupplier';
import { updateProductApi, uploadDoc } from '@/supabase/API';

const initial = {
  id: '',
  name: '',
  supplier: '',
  priceMember: 0,
  priceRegular: 0,
  description: '',
  measurements: '',
  materials: '',
  dimensions: '',
  weight: '',
  boxedDimensions: '',
  boxedWeight: '',
  assemblyRequired: '',
  instructions: '',
  composition: '',
  construction: '',
  feet: 0,
  filling: '',
  frame: '',
  removableCushions: '',
  removableLegs: '',
  seatDepth: '',
  seatHeight: '',
  seatWidth: '',
  type: '',
  product_url: '',
};

const EditProductModal = ({ productInfo, editModal, closeEditModal }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const [product, setProduct] = useState(initial);
  const [open, setOpen] = useState(false);
  const { data, isLoading: loadingClient, refetch: refetchSupplier } = useSupplier();

  // select supplicer
  const handleSelect = value => {
    const e = {
      target: {
        name: 'supplier',
        value: value.company,
      },
    };
    updateProduct(e);
    setOpen(false);
  };

  useEffect(() => {
    if (productInfo) {
      const { images, ...filteredProduct } = productInfo;
      setProduct(filteredProduct);
    }
  }, [productInfo]);

  const afterCloseModal = () => {
    closeEditModal();
  };

  // Update Product
  const mutation = useMutation({
    mutationFn: updateProductApi,
    onSuccess: () => {
      queryClient.refetchQueries(['GetAllProduct']);
      closeEditModal();
      toast('Product Updated');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Image Upload Function
  const attachmentMutation = useMutation({
    mutationFn: async ({ fileList, uuid }) => {
      toast.loading('Uploading...', { id: 'upload-toast' });
      try {
        const uploadPromises = fileList.map(file => uploadDoc({ file: file, id: uuid }));
        const results = await Promise.all(uploadPromises);
        toast.dismiss('upload-toast'); // Dismiss loading toast
        toast.success('Uploaded successfully!');
        setFiles([]); // Clear selected images after upload
        return results;
      } catch (err) {
        toast.dismiss('upload-toast'); // Dismiss in case of error
        toast.error(`Upload failed: ${err.message}`);
        throw err; // Ensure error is still handled by `onError`
      }
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/png': [],
      'image/jpeg': [],
      'image/jpg': [],
      'image/gif': [],
      'image/webp': [],
    },
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles, rejectedFiles) => {
      const validFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
      if (rejectedFiles.length > 0 || validFiles.length !== acceptedFiles.length) {
        setError('Only image files (PNG, JPG, JPEG, GIF, WEBP) are allowed (max: 5MB).');
        return;
      }
      if (files.length + validFiles.length > 5) {
        setError('You can upload a maximum of 5 images.');
        return;
      }
      setError('');
      setFiles(prevFiles => [...prevFiles, ...validFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }))]);
    },
  });

  const removeImage = fileName => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const updateProduct = e => {
    console.log(e);
    const { name, value } = e.target;
    setProduct(prevTask => ({
      ...prevTask,
      [name]: value,
    }));
  };

  // Handle Form Submit
  const handleSubmit = e => {
    e.preventDefault();
    if (files.length === 0) {
      mutation.mutate(product);
      return;
    } else {
      attachmentMutation.mutate({ fileList: files, uuid: product.id });
      mutation.mutate(product);
    }
  };

  return (
    <Modal isOpen={editModal} onRequestClose={afterCloseModal} contentLabel="Example Modal">
      <div className="navbar mb-9 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold flex items-center gap-2">
            <p>{product.name}</p>
          </div>
        </div>
        {/* Delete and Close Modal Section */}
        <div className="buttons flex items-center gap-3 !mt-0 px-2">
          {/* <button>
            <Link size={17} />
          </button> */}
          {/* <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-sm font-semibold text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 5">
                    <circle cx="3" cy="2.5" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="2.5" r="1.5" fill="currentColor" />
                    <circle cx="17" cy="2.5" r="1.5" fill="currentColor" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-white absolute z-[9999] -right-7">
                <DialogTrigger className="w-full">
                  <DropdownMenuItem className="text-sm font-semibold text-gray-700 bg-transparent flex items-center gap-2 transition-all hover:bg-gray-200 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
                    </svg>
                    Delete
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <DeleteDialog task={task} handleDeleteTask={handleDeleteTask} />
          </Dialog> */}
          <button
            onClick={afterCloseModal}
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
      {/*Upload Content */}
      <div {...getRootProps()} className="border mb-7 flex flex-col gap-5 items-center justify-center py-10 rounded-2xl cursor-pointer">
        <input {...getInputProps()} />
        <div className="bg-[#ECEFEC] w-36 h-36 flex items-center justify-center rounded-full">
          <Upload size={45} />
        </div>
        <div className="text-center">
          <p className="text-[27px] mb-1 font-medium">Drag and drop or click here</p>
          <p>to upload your image (max: 5MB, max: 5 images)</p>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

        {/* Preview Uploaded Images */}
        <div className="flex gap-4 mt-4">
          {files.map(file => (
            <div key={file.name} className="relative group">
              <img src={file.preview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
              <button
                onClick={e => {
                  e.stopPropagation();
                  removeImage(file.name);
                }}
                className="absolute top-[-8px] right-[-8px] bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              onChange={updateProduct}
              value={product?.name}
              className="bg-white rounded-lg"
              id="name"
              name="name"
              placeholder="Enter Product Name"
              required
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="supplier">Supplier Name</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-lg  hover:bg-transparent justify-between text-sm font-medium bg-transparent  focus:ring-0 focus:outline-none"
                >
                  {product ? product?.supplier : 'Select Supplier'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full z-[9999] p-0 bg-white">
                <Command>
                  <CommandInput placeholder="Search Supplier..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {!loadingClient &&
                      data?.data?.map(item => (
                        <CommandItem className=" cursor-pointer" key={item.id} value={item} onSelect={() => handleSelect(item)}>
                          <Check className={`mr-2 h-4 w-4 ${product?.supplier == item.company ? 'opacity-100' : 'opacity-0'}`} />
                          {item.company}
                        </CommandItem>
                      ))}
                  </CommandList>
                </Command>
                <AddSupplier refetchSupplier={refetchSupplier} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2 mt-3">
          <Label htmlFor="product_url">Product URL</Label>
          <Input
            onChange={updateProduct}
            value={product?.product_url}
            className="bg-white rounded-lg"
            id="product_url"
            name="product_url"
            type="url"
            placeholder="Enter Product URL"
          />
        </div>
        {/* Description */}
        <div className="space-y-2 mt-3">
          <Label htmlFor="description">Description</Label>
          <Textarea
            rows={5}
            onChange={updateProduct}
            value={product?.description}
            className="bg-white rounded-lg"
            id="description"
            name="description"
            placeholder="Enter Product Description"
          />
        </div>
        {/* Price */}
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="priceMember">Trade Price</Label>
            <Input
              onChange={updateProduct}
              value={product?.priceMember}
              className="bg-white rounded-lg"
              id="priceMember"
              name="priceMember"
              placeholder="Enter Member Price"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="priceRegular">Regular Price</Label>
            <Input
              onChange={updateProduct}
              value={product?.priceRegular}
              className="bg-white rounded-lg"
              id="priceRegular"
              name="priceRegular"
              placeholder="Enter Regular Price"
            />
          </div>
        </div>
        {/* Mesurement */}
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="measurements">Measurements</Label>
            <Input
              onChange={updateProduct}
              value={product?.measurements}
              className="bg-white rounded-lg"
              id="measurements"
              name="measurements"
              placeholder="Enter Measurements"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="materials">Materials</Label>
            <Input
              onChange={updateProduct}
              value={product?.materials}
              className="bg-white rounded-lg"
              id="materials"
              name="materials"
              placeholder="Materials"
            />
          </div>
        </div>
        {/* Weight */}
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              onChange={updateProduct}
              value={product?.dimensions}
              className="bg-white rounded-lg"
              id="dimensions"
              name="dimensions"
              placeholder="Enter Dimensions"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="weight">Weight</Label>
            <Input
              onChange={updateProduct}
              value={product?.weight}
              className="bg-white rounded-lg"
              id="weight"
              name="weight"
              placeholder="Enter Weight"
            />
          </div>
        </div>
        {/* Dimention */}
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="boxedDimensions">Box Dimensions</Label>
            <Input
              onChange={updateProduct}
              value={product?.boxedDimensions}
              className="bg-white rounded-lg"
              id="boxedDimensions"
              name="boxedDimensions"
              placeholder="Box Dimensions"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="boxedWeight">Box Weight</Label>
            <Input
              onChange={updateProduct}
              value={product?.boxedWeight}
              className="bg-white rounded-lg"
              id="boxedWeight"
              name="boxedWeight"
              placeholder="Enter Weight"
            />
          </div>
        </div>

        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className={`space-y-2  col-span-2`}>
            <Label htmlFor="assemblyRequired"> Assembly Required</Label>
            <Select
              value={product?.assemblyRequired || 'none'}
              onValueChange={value => {
                const e = {
                  target: {
                    name: 'assemblyRequired',
                    value: value,
                  },
                };
                updateProduct(e);
              }}
            >
              <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[99]">
                {/* Default option */}
                <SelectItem disabled value="none">
                  Select Status
                </SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="seatWidth">Seat Width</Label>
            <Input
              onChange={updateProduct}
              value={product?.seatWidth}
              className="bg-white rounded-lg"
              id="seatWidth"
              name="seatWidth"
              placeholder="Seat Width"
            />
          </div>
        </div>

        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="composition">Composition</Label>
            <Input
              onChange={updateProduct}
              value={product?.composition}
              className="bg-white rounded-lg"
              id="composition"
              name="composition"
              placeholder="Write composition"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="construction">Construction</Label>
            <Input
              onChange={updateProduct}
              value={product?.construction}
              className="bg-white rounded-lg"
              id="construction"
              name="construction"
              placeholder="Write construction"
            />
          </div>
        </div>
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="feet">Feet</Label>
            <Input
              onChange={updateProduct}
              value={product?.feet}
              className="bg-white rounded-lg"
              id="feet"
              name="feet"
              type="number"
              placeholder="Height (in feet)"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="filling">Filling</Label>
            <Input
              onChange={updateProduct}
              value={product?.filling}
              className="bg-white rounded-lg"
              id="filling"
              name="filling"
              placeholder="Write filling"
            />
          </div>
        </div>
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className={`space-y-2  col-span-2`}>
            <Label htmlFor="removableCushions"> Removable Cushions ?</Label>
            <Select
              value={product?.removableCushions || 'none'}
              onValueChange={value => {
                const e = {
                  target: {
                    name: 'removableCushions',
                    value: value,
                  },
                };
                updateProduct(e);
              }}
            >
              <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[99]">
                {/* Default option */}
                <SelectItem disabled value="none">
                  Select
                </SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={`space-y-2  col-span-2`}>
            <Label htmlFor="removableLegs"> Removable Legs?</Label>
            <Select
              value={product?.removableLegs || 'none'}
              onValueChange={value => {
                const e = {
                  target: {
                    name: 'removableLegs',
                    value: value,
                  },
                };
                updateProduct(e);
              }}
            >
              <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[99]">
                {/* Default option */}
                <SelectItem disabled value="none">
                  Select
                </SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="seatDepth">Seat Depth</Label>
            <Input
              onChange={updateProduct}
              value={product?.seatDepth}
              className="bg-white rounded-lg"
              id="seatDepth"
              name="seatDepth"
              placeholder="Seat Depth"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="seatHeight">Seat Height</Label>
            <Input
              onChange={updateProduct}
              value={product?.seatHeight}
              className="bg-white rounded-lg"
              id="seatHeight"
              name="seatHeight"
              placeholder="Seat Height"
            />
          </div>
        </div>

        <div className="grid gap-3 mt-3 grid-cols-4">
          <div className="space-y-2 col-span-2 mt-3">
            <Label htmlFor="frame">Frame</Label>
            <Input
              onChange={updateProduct}
              value={product?.frame}
              className="bg-white rounded-lg"
              id="frame"
              name="frame"
              placeholder="Frame"
            />
          </div>
          <CustomSelect product={product} updateProduct={updateProduct} />
        </div>

        <div className="space-y-2 mt-3">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            onChange={updateProduct}
            value={product?.instructions}
            className="bg-white rounded-lg"
            id="instructions"
            rows={5}
            name="instructions"
            placeholder="Instructions"
          />
        </div>
        <div className="flex mb-5 justify-between items-center mt-9">
          <button onClick={afterCloseModal} className=" rounded-[12px] bg-gray-200 px-4 py-2 text-gray-500">
            Cancel
          </button>
          <button type="submit" className=" rounded-[12px] bg-black px-4 py-2 text-white">
            Save Product
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
