'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/chip';
import {
  Package,
  Hash,
  Clock,
  DollarSign,
  Truck,
  Plus,
  Filter,
  Search,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
  Check,
  Loader2,
  MessageSquareMore,
  MessageSquareText,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProductDetailSheet, type ProductDetails } from '@/components/product-detail-sheet';
import useProjects from '@/supabase/hook/useProject';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useUser from '@/hooks/useUser';
import { v4 as uuidv4 } from 'uuid';
import useSupplier from '@/hooks/useSupplier';
import {
  addNewChat,
  changeRoom,
  createPurchaseOrder,
  getAllProduct,
  getContactbyID,
  modifyProject,
  removeProduct,
  sendProductToClient,
  toggleSendToClient,
  updateAllProductsSendToClient,
  updateProductProcurement,
  updateProductStatusToInternalReview,
} from '@/supabase/API';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import ProcurementTable from '@/components/project/ProcurementTable';

// Top summary
const procurementStats = [
  { title: 'Total Items', value: '8', subtitle: 'Products specified', icon: Package },
  { title: 'Total Quantity', value: '17', subtitle: 'Units ordered', icon: Hash },
  { title: 'Pending Approval', value: '2', subtitle: 'Waiting for sign-off', icon: Clock },
  { title: 'Total Cost', value: '£11,610.00', subtitle: 'Estimated cost', icon: DollarSign },
  { title: 'Delivery Progress', value: '38%', subtitle: '3 of 8 delivered', icon: Truck },
];

// Table rows (future-dated)
type ApprovalStatus = 'approved' | 'pending' | 'rejected';
type ProcurementItem = {
  id: number;
  name: string;
  image: string;
  dimensions: string;
  date: string;
  leadTime: string;
  quantity: number;
  price: string;
  status: 'ordered' | 'pending' | 'delivered';
  supplier: string;
  poNumber: string;
  sample: 'Yes' | 'No' | 'Requested';
  clientApproval: ApprovalStatus;
};

// Use real assets added to /public/images/products
const procurementItems: ProcurementItem[] = [
  {
    id: 1,
    name: 'Italian Leather Sofa',
    image: '/images/products/leather-ottoman.png',
    dimensions: '220 x 95 x 85cm',
    date: '2025-08-20',
    leadTime: '8-10 weeks',
    quantity: 1,
    price: '£3,200.00',
    status: 'ordered',
    supplier: 'West Elm',
    poNumber: 'PO-24051',
    sample: 'Requested',
    clientApproval: 'approved',
  },
  {
    id: 2,
    name: 'Marble Coffee Table',
    image: '/images/products/arched-mirror.png',
    dimensions: '120 x 60 x 45cm',
    date: '2025-08-22',
    leadTime: '6-8 weeks',
    quantity: 1,
    price: '£1,850.00',
    status: 'pending',
    supplier: 'John Lewis',
    poNumber: 'PO-24052',
    sample: 'Yes',
    clientApproval: 'pending',
  },
  {
    id: 3,
    name: 'Designer Floor Lamp',
    image: '/images/products/pleated-table-lamp.png',
    dimensions: '30 x 30 x 165cm',
    date: '2025-08-24',
    leadTime: '4-6 weeks',
    quantity: 2,
    price: '£450.00',
    status: 'delivered',
    supplier: 'Habitat',
    poNumber: 'PO-24053',
    sample: 'Yes',
    clientApproval: 'approved',
  },
  {
    id: 4,
    name: 'Velvet Dining Chairs',
    image: '/images/products/striped-armchair.png',
    dimensions: '55 x 60 x 85cm',
    date: '2025-08-26',
    leadTime: '3-4 weeks',
    quantity: 6,
    price: '£280.00',
    status: 'ordered',
    supplier: 'Made.com',
    poNumber: 'PO-24054',
    sample: 'No',
    clientApproval: 'pending',
  },
  {
    id: 5,
    name: 'Persian Area Rug',
    image: '/images/products/woven-dining-chair.png',
    dimensions: '300 x 200cm',
    date: '2025-08-28',
    leadTime: '2-3 weeks',
    quantity: 1,
    price: '£1,200.00',
    status: 'pending',
    supplier: 'The Rug Company',
    poNumber: 'PO-24055',
    sample: 'Requested',
    clientApproval: 'rejected',
  },
  {
    id: 6,
    name: 'Crystal Chandelier',
    image: '/images/products/travertine-table-lamp.png',
    dimensions: '80 x 80 x 100cm',
    date: '2025-09-02',
    leadTime: '12-14 weeks',
    quantity: 1,
    price: '£2,800.00',
    status: 'ordered',
    supplier: 'Harrods',
    poNumber: 'PO-24056',
    sample: 'Yes',
    clientApproval: 'approved',
  },
  {
    id: 7,
    name: 'Oak Dining Table',
    image: '/images/products/studded-dresser.png',
    dimensions: '200 x 100 x 75cm',
    date: '2025-09-05',
    leadTime: '10-12 weeks',
    quantity: 1,
    price: '£1,650.00',
    status: 'delivered',
    supplier: "Heal's",
    poNumber: 'PO-24057',
    sample: 'Yes',
    clientApproval: 'approved',
  },
  {
    id: 8,
    name: 'Brass Wall Sconces',
    image: '/images/products/fringed-parasol.png',
    dimensions: '15 x 25 x 30cm',
    date: '2025-09-08',
    leadTime: '6-8 weeks',
    quantity: 4,
    price: '£180.00',
    status: 'pending',
    supplier: 'Lights.co.uk',
    poNumber: 'PO-24058',
    sample: 'No',
    clientApproval: 'pending',
  },
];

const formatDate = isoString => {
  const date = new Date(isoString);

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
};

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const label = status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending' : 'Rejected';
  return <StatusBadge status={status} label={label} />;
}

function useProductMap(items: ProcurementItem[]) {
  return useMemo<Record<number, ProductDetails>>(
    () =>
      Object.fromEntries(
        items.map(it => [
          it.id,
          {
            id: String(it.id),
            name: it.name,
            supplier: it.supplier,
            url: 'https://example.com/products/' + encodeURIComponent(it.name.toLowerCase().replace(/\s+/g, '-')),
            images: [
              { src: it.image, alt: it.name },
              // provide a couple of sensible fallbacks to let users flip thumbnails
              { src: '/images/products/pleated-table-lamp.png', alt: 'Alt view' },
              { src: '/images/products/arched-mirror.png', alt: 'Alt view 2' },
            ],
            prices: { retail: it.price },
            size: it.dimensions,
            stockStatus: it.status === 'delivered' ? 'Delivered' : it.status === 'ordered' ? 'Ordered' : 'Confirm Stock',
            sampleAvailable: it.sample === 'Requested' ? 'Requested' : it.sample,
            measurements: it.dimensions,
            description: 'High-quality piece specified for the project. Materials and finish align with the studio palette.',
            tags: ['Procurement', 'Specified'],
          } as ProductDetails,
        ])
      ),
    [items]
  );
}

export default function ProjectProcurementPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState([]);
  const [project, setProject] = useState<any>(null);
  const { data: projectData, isLoading: projectLoading, refetch } = useProjects();
  const [checkedItems, setCheckedItems] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonLoadingPO, setButtonLoadingPO] = useState(false);
  const queryClient = useQueryClient();
  const [client, setClient] = useState();
  const { user } = useUser();
  const [comment, setComment] = useState('');
  const [searchText, setSearchText] = useState('');
  const { data: supplier, isLoading: supplierLoading } = useSupplier();
  const [currentSupplier, setCurrentSupplier] = useState('All');
  const [projectID, setProjectID] = useState(null);

  const [currentRoom, setCurrentRoom] = useState('All Rooms');
  const [filterType, setFilterType] = useState(null);
  const [mainOpen, setMainOpen] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    setProjectID(params?.id);
  }, [params?.id]);

  // Update Product
  const mutationP0Number = useMutation({
    mutationFn: updateProductProcurement,
    onSuccess: () => {
      toast('Status Updated');
      queryClient.refetchQueries('GetAllProduct');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Update Send to Client
  const mutationClientToggle = useMutation({
    mutationFn: toggleSendToClient,
    onSuccess: e => {
      toast('Status Updated');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Update Send to Client
  const sendAllProductToClient = useMutation({
    mutationFn: updateAllProductsSendToClient,
  });

  const handleSendClientToggle = (id, state) => {
    setProject({ ...project, sendToClient: state });
    mutationClientToggle.mutate({ id, state });
  };

  // Update Product
  const mutationUpdateProduct = useMutation({
    mutationFn: updateProductStatusToInternalReview,
    onSuccess: () => {
      toast('Status Updated');
      queryClient.refetchQueries('GetAllProduct');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Handle filter type selection
  const handleFilterTypeSelect = type => {
    setFilterType(type);
  };

  // Handle supplier selection
  const handleSupplierSelect = value => {
    setCurrentSupplier(value);
    setFilterType(null);
    setMainOpen(false);
  };

  // Handle room selection
  const handleRoomSelect = value => {
    setCurrentRoom(value);
    setFilterType(null);
    setMainOpen(false);
  };

  const { data: contact, isLoading: clientLoading } = useQuery({
    queryKey: ['contact', project?.client],
    queryFn: () => getContactbyID(project?.client),
    enabled: !!project?.client,
  });

  // Define the mutation
  const mutationComment = useMutation({
    mutationFn: modifyProject,
    onSuccess: () => {
      setComment('');
      refetch();
    },
    onError: error => {
      console.log(error);
      toast('Error! Try again');
    },
  });

  useEffect(() => {
    if (clientLoading) return;
    setClient(contact);
  }, [clientLoading, contact]);

  // Create Thread
  const threadMutation = useMutation({
    mutationFn: addNewChat,
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Sent Product to Client
  const productMutation = useMutation({
    mutationFn: sendProductToClient,
    onSuccess: e => {
      setTimeout(() => {
        setCheckedItems([]);
        setButtonLoading(false);
        if (e.success) {
          toast.success(e.message);
          threadMutation.mutate({
            topic: 'Procurement Product For Approval',
            description:
              'Please review the listed procurement products for approval at your earliest convenience. Let me know if any adjustments are needed. Looking forward to your confirmation. Best regards,',
            projectID: projectID,
            products: checkedItems,
          });
        } else {
          toast.error(e.message);
        }
      }, 1000);
    },
    onError: () => {
      toast.error(e.message);
      setButtonLoading(false);
    },
  });

  // Send Product for purchase Order
  const createPurchase = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: async e => {
      try {
        if (!e?.data?.[0]) {
          toast.error('Failed to get PO details from response.');
          setButtonLoadingPO(false);
          return;
        }

        await Promise.all(
          checkedItems.map(item => {
            // Find the room ID for this item
            const roomID = groupedItems?.type?.find(room => room.product?.some(product => product.id === item.id))?.id;

            const { matchedProduct, ...updatedProduct } = {
              ...item,
              PO: [
                ...(Array.isArray(item.PO) ? item.PO : []),
                {
                  poNumber: e.data[0].poNumber,
                  poID: e.data[0].id,
                },
              ],
            };
            return mutationP0Number.mutateAsync({ product: updatedProduct, projectID: projectID, roomID });
          })
        );

        // After all mutations are done
        setCheckedItems([]);
        toast.success('Purchase Order Created!');
        setButtonLoadingPO(false);
        queryClient.invalidateQueries(['purchaseOrder']);
      } catch (err) {
        toast.error(err.message || 'An error occurred during product updates.');
        setButtonLoadingPO(false);
      }
    },
    onError: e => {
      toast.error(e.message || 'Failed to create purchase order.');
      setButtonLoadingPO(false);
    },
  });

  const handleClickPO = async () => {
    setButtonLoadingPO(true);
    // Filter to only include approved items
    const approvedItems = checkedItems.filter(item => item.status == 'approved');
    if (approvedItems.length == 0) {
      toast.warning('No approved item found !');
      setButtonLoadingPO(false);
      return;
    }

    mutationUpdateProduct.mutate({ product: approvedItems, projectID });

    try {
      if (currentSupplier === 'All') {
        try {
          const mutations = approvedItems.map(item => {
            createPurchase.mutate({
              order: {
                supplier: supplier.data.find(items => items.company.trim() === item.matchedProduct.supplier.trim()),
                projectID: projectID,
                projectName: project?.name,
                issueDate: new Date().toISOString(),
                dueDate: new Date().toISOString(),
                status: 'Pending',
                clientName: client ? client.name + ' ' + client.surname : null,
                clientEmail: client ? client.email : null,
                clientPhone: client ? client.phone : null,
                clientAddress: client ? client.address : null,
                products: [
                  {
                    QTY: item.matchedProduct.qty,
                    itemName: item.matchedProduct.name,
                    itemID: item.matchedProduct.id,
                    amount:
                      item?.matchedProduct.priceMember && parseFloat(item?.matchedProduct.priceMember?.replace(/[^0-9.-]+/g, '')) > 0
                        ? item.matchedProduct.priceMember
                        : item.matchedProduct.priceRegular,
                    dueDate: item.install,
                    dimensions: item?.matchedProduct?.dimensions,
                    imageURL:
                      item.matchedProduct?.imageURL?.length > 0
                        ? item.matchedProduct?.imageURL[0]
                        : item.matchedProduct?.images?.length > 0 && item?.matchedProduct?.images[0],
                  },
                ],
              },
            });
          });
          await Promise.all(mutations);
        } catch (error) {
          console.error('Error creating purchase orders:', error);
          throw error;
        }
      } else {
        try {
          const totalOrder = {
            supplier: supplier.data.find(items => items.company.trim() === currentSupplier.trim()),
            projectID: projectID,
            projectName: project?.name,
            status: 'Pending',
            clientName: client ? client.name + ' ' + client.surname : null,
            clientEmail: client ? client.email : null,
            clientPhone: client ? client.phone : null,
            clientAddress: client ? client.address : null,
            issueDate: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            products: [],
          };
          const products = approvedItems.map(item => {
            return {
              dueDate: item?.install,
              amount:
                item?.matchedProduct?.priceMember && parseFloat(item?.matchedProduct.priceMember?.replace(/[^0-9.-]+/g, '')) > 0
                  ? item.matchedProduct?.priceMember
                  : item.matchedProduct.priceRegular,
              QTY: item.qty,
              itemName: item.matchedProduct.name,
              itemID: item.matchedProduct.id,
              dimensions: item?.matchedProduct?.dimensions,
              imageURL:
                item?.matchedProduct?.imageURL?.length > 0
                  ? item?.matchedProduct?.imageURL[0]
                  : item?.matchedProduct?.images?.length > 0 && item?.matchedProduct?.images[0],
            };
          });
          totalOrder.products = [...products];
          createPurchase.mutate({ order: totalOrder });
        } catch (error) {
          console.error('Error creating purchase orders:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error in handleClickPO:', error);
    } finally {
      // setButtonLoadingPO(false);
    }
  };

  const mutation = useMutation({
    mutationFn: removeProduct,
    onSuccess: () => {
      refetch();
      toast('Product Removed');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // change room
  const room = useMutation({
    mutationFn: changeRoom,
    onSuccess: () => {
      refetch();
      toast('Room Changed');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  useEffect(() => {
    if (projectLoading) return;
    const foundProject = projectData.find(item => item.id === projectID);
    setProject(foundProject);
  }, [projectLoading, projectData, projectID]);

  const productIds = useMemo(() => {
    if (!project) return [];
    const fromTypes = project.type ? project.type.flatMap(t => (t.product ?? []).map(p => p.id)) : [];
    const fromProject = (project.product ?? []).map(p => p.id);
    const items = [...new Set([...fromTypes, ...fromProject])];

    return items.filter(item => item != undefined || null);
  }, [project]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['GetAllProduct', productIds],
    queryFn: () => getAllProduct(productIds),
    enabled: !!productIds,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const enrichProjectWithProducts = (searchText = '', currentSupplier = 'All', currentRoom = 'All Rooms') => {
    // Early return if required data is missing
    if (!project || !project.type || !Array.isArray(product)) return project;

    // Create a deep copy of the project only once at the end
    let enrichedProject = JSON.parse(JSON.stringify(project));

    if (currentRoom == 'All Rooms') {
      // enrichedProject = JSON.parse(JSON.stringify(project));
    } else {
      enrichedProject = { ...enrichedProject, type: project?.type?.filter(item => item.text.trim() == currentRoom.trim()) };
    }

    // Filter products first - only create filtered list once
    let filteredItems = product.filter(item => {
      // Make sure item exists
      if (!item) return false;

      // Filter by supplier if not 'All'
      if (currentSupplier !== 'All') {
        // Handle possible undefined supplier gracefully
        const itemSupplier = item.supplier?.trim().toLowerCase() || '';
        const supplierToMatch = currentSupplier.trim().toLowerCase();
        if (itemSupplier !== supplierToMatch) return false;
      }

      // Filter by search text if provided
      if (searchText?.trim()) {
        const itemName = item.name?.toLowerCase() || '';
        if (!itemName.includes(searchText.toLowerCase())) return false;
      }

      return true;
    });

    // Only create lookup once with filtered products
    const productLookup = {};
    filteredItems.forEach(product => {
      if (product?.id) {
        productLookup[product.id] = product;
      }
    });

    // Enrich project with matched products
    if (Array.isArray(enrichedProject.type)) {
      enrichedProject.type.forEach(typeObj => {
        if (typeObj && Array.isArray(typeObj.product)) {
          // Replace array instead of modifying in place for better performance
          typeObj.product = typeObj.product
            .map(productEntry => {
              if (productEntry?.id && productLookup[productEntry.id]) {
                return {
                  ...productEntry,
                  matchedProduct: productLookup[productEntry.id],
                };
              }
              // Skip items that don't match our filter
              return null;
            })
            .filter(Boolean); // Remove null entries
        }
      });
    }

    return enrichedProject;
  };

  const groupedItems = project ? enrichProjectWithProducts(searchText, currentSupplier, currentRoom) : {};

  useEffect(() => {
    if (isLoading) return;
    setProduct(data);
  }, [isLoading, data]);

  const totalItem = () => {
    if (!groupedItems) {
      return 0;
    }
    if (!Array.isArray(groupedItems.type)) {
      return 0;
    }

    let totalCount = 0;
    groupedItems.type.forEach(item => {
      if (item && Array.isArray(item.product)) {
        totalCount += item.product.length;
      }
    });
    return totalCount;
  };

  const totalPendingItem = () => {
    if (!groupedItems) {
      return 0;
    }
    if (!Array.isArray(groupedItems.type)) {
      return 0;
    }
    let totalCount = 0;
    groupedItems.type.forEach(item => {
      if (item && Array.isArray(item.product)) {
        item.product.forEach(singleItem => {
          if (singleItem.sendToClient && singleItem.status == 'review') {
            totalCount++;
          }
        });
      }
    });
    return totalCount;
  };

  const totalDelivered = () => {
    if (!groupedItems) {
      return 0;
    }
    if (!Array.isArray(groupedItems.type)) {
      return 0;
    }
    let totalCount = 0;
    groupedItems.type.forEach(item => {
      if (item && Array.isArray(item.product)) {
        item.product.forEach(singleItem => {
          if (singleItem.initialStatus == 'Delivered') {
            totalCount++;
          }
        });
      }
    });
    return totalCount;
  };

  const totalCost = () => {
    if (!groupedItems || !Array.isArray(groupedItems.type)) return 0;
    let cost = 0;
    groupedItems.type.forEach(typeObj => {
      if (!typeObj || !Array.isArray(typeObj.product)) return;

      typeObj.product.forEach(product => {
        if (product?.status == 'rejected') return;

        const quantity = Number(product.qty) < 1 ? 1 : Number(product.qty);
        const matched = product.matchedProduct;
        let priceString = '';

        if (matched?.priceMember && parseFloat(matched.priceMember.replace(/[^\d.]/g, '')) > 0) {
          priceString = matched.priceMember;
        } else if (matched?.priceRegular && parseFloat(matched.priceRegular.replace(/[^\d.]/g, '')) > 0) {
          priceString = matched.priceRegular;
        } else {
          return;
        }

        const priceValue = Number(parseFloat(priceString.replace(/[^\d.]/g, '')));
        cost += priceValue * quantity;
      });
    });

    return cost;
  };

  const approvedCost = () => {
    if (!groupedItems || !Array.isArray(groupedItems.type)) return 0;
    let cost = 0;
    groupedItems.type.forEach(typeObj => {
      if (!typeObj || !Array.isArray(typeObj.product)) return;

      typeObj.product.forEach(product => {
        if (product?.status !== 'approved') return;

        const quantity = Number(product.qty) < 1 ? 1 : Number(product.qty);
        const matched = product.matchedProduct;
        let priceString = '';

        if (matched?.priceMember && parseFloat(matched.priceMember.replace(/[^\d.]/g, '')) > 0) {
          priceString = matched.priceMember;
        } else if (matched?.priceRegular && parseFloat(matched.priceRegular.replace(/[^\d.]/g, '')) > 0) {
          priceString = matched.priceRegular;
        } else {
          return;
        }

        const priceValue = Number(parseFloat(priceString.replace(/[^\d.]/g, '')));
        cost += priceValue * quantity;
      });
    });

    return cost;
  };

  const totalQty = () => {
    if (!groupedItems || !Array.isArray(groupedItems.type)) {
      return 0;
    }

    let totalQuantity = 0;
    groupedItems.type.forEach(typeObj => {
      if (typeObj && Array.isArray(typeObj.product)) {
        typeObj.product.forEach(product => {
          // Convert to number and use 0 as fallback if NaN
          const quantity = Number(product?.qty) || 1;
          totalQuantity += quantity;
        });
      }
    });

    return totalQuantity;
  };

  const totalItemsCount = totalItem();
  const totalCostCount = totalCost();
  const totalApprovedCost = approvedCost();
  const totalQuantity = totalQty();
  const totalPendingCount = totalPendingItem();
  const totalDeliveryCount = totalDelivered();

  // Top summary
  const procurementStats = [
    { title: 'Total Items', value: totalItemsCount, subtitle: 'Products specified', icon: Package },
    { title: 'Total Quantity', value: totalQuantity, subtitle: 'Units ordered', icon: Hash },
    { title: 'Pending Approval', value: totalPendingCount, subtitle: 'Waiting for sign-off', icon: Clock },
    { title: 'Total Cost', value: `${project?.currency?.symbol}${totalCostCount}`, subtitle: 'Estimated cost', icon: DollarSign },
    {
      title: 'Delivery Progress',
      value: `${totalDeliveryCount / totalItemsCount / 100}%`,
      subtitle: `${totalItemsCount} of ${totalDeliveryCount} delivered`,
      icon: Truck,
    },
  ];

  // handleProductDelete
  const handleDelete = (itemID, roomID) => {
    mutation.mutate({ projectID: project.id, productID: itemID, roomID });
  };

  // handle change room
  const handleChangeRoom = (roomID, productID) => {
    room.mutate({ projectID, roomID, productID });
  };

  // handle Comment
  const handleComment = e => {
    e.preventDefault();
    if (comment.trim().length == 0) return;
    const singleComment = {
      userName: user?.name,
      userEmail: user.email,
      time: new Date(),
      id: uuidv4(),
      comment,
    };
    const updateInfo = {
      ...project,
      comment: [...(project.comment || []), singleComment],
    };
    mutationComment.mutate(updateInfo);
  };

  // Send to client product if button is enabled
  useEffect(() => {
    if (project?.sendToClient == false) return;
    if (project?.sendToClient == true) {
      sendAllProductToClient.mutate({ projectID: projectID });
    }
  }, [project?.sendToClient, project?.type, projectID]);

  //

  ////

  //
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined);
  const productMap = useProductMap(procurementItems);

  function openProduct(id: number) {
    const p = productMap[id];
    setSelected(p ?? undefined);
    setOpen(true);
  }

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {procurementStats.map(stat => (
            <Card key={stat.title} className="border border-greige-500/30 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-slatex-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700">{stat.title}</p>
                    <p className="text-lg font-semibold text-neutral-900">{stat.value}</p>
                    <p className="text-xs text-neutral-600">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search items..."
                className="pl-10 w-64 h-9"
              />
            </div>

            <Popover open={mainOpen} onOpenChange={setMainOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent border-greige-500/30">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-white">
                {filterType === null ? (
                  <Command>
                    <CommandList>
                      <CommandItem onSelect={() => handleFilterTypeSelect('room')} className="cursor-pointer">
                        Room
                      </CommandItem>
                      <CommandItem onSelect={() => handleFilterTypeSelect('supplier')} className="cursor-pointer">
                        Supplier
                      </CommandItem>
                    </CommandList>
                  </Command>
                ) : filterType === 'room' ? (
                  <Command>
                    <CommandInput placeholder="Search room.." />
                    <CommandList>
                      <CommandItem value="All Rooms" key={'all'} onSelect={handleRoomSelect} className="cursor-pointer">
                        <Check className={`mr-2 h-4 w-4 ${currentRoom === 'All Rooms' ? 'opacity-100' : 'opacity-0'}`} />
                        All Rooms
                      </CommandItem>
                      {project?.type?.map((option, index) => (
                        <CommandItem
                          key={index}
                          value={option?.text}
                          onSelect={() => handleRoomSelect(option?.text)}
                          className="cursor-pointer"
                        >
                          <Check className={`mr-2 h-4 w-4 ${currentRoom === option?.text ? 'opacity-100' : 'opacity-0'}`} />
                          {option?.text}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                ) : (
                  <Command>
                    <CommandInput placeholder="Search supplier.." />
                    <CommandList>
                      <CommandItem value="All" key={'all'} onSelect={handleSupplierSelect} className="cursor-pointer">
                        <Check className={`mr-2 h-4 w-4 ${currentSupplier === 'All' ? 'opacity-100' : 'opacity-0'}`} />
                        All
                      </CommandItem>
                      {!supplierLoading &&
                        supplier?.data?.map((option, index) => (
                          <CommandItem
                            key={index}
                            value={option?.company}
                            onSelect={() => handleSupplierSelect(option?.company)}
                            className="cursor-pointer"
                          >
                            <Check className={`mr-2 h-4 w-4 ${currentSupplier === option?.company ? 'opacity-100' : 'opacity-0'}`} />
                            {option?.company}
                          </CommandItem>
                        ))}
                    </CommandList>
                  </Command>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleClickPO}
              disabled={checkedItems.length === 0 || buttonLoadingPO}
              // variant="ghost"
              className="bg-clay-600 text-white hover:bg-clay-700"
            >
              {buttonLoadingPO ? (
                <>
                  <Loader2 className=" h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create PO
                </>
              )}
            </Button>

            {/* Comment Drawer */}
            <Drawer direction="right">
              <DrawerTrigger asChild>
                <Button variant="outline" className="border-greige-500/30 bg-transparent">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-full w-full max-w-[400px] bg-white  rounded-none ml-auto">
                <div className="mx-auto flex flex-col h-full w-full max-w-sm">
                  <DrawerHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <MessageSquareMore className="text-gray-600" size={20} />
                      </div>
                      <p className="font-medium text-[20px] text-gray-600">Comments</p>
                    </div>
                  </DrawerHeader>

                  <div className="overflow-y-scroll h-[400px]">
                    {project?.comment?.length < 1 ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageSquareText className="text-gray-400" strokeWidth={0.7} size={150} />
                      </div>
                    ) : (
                      project?.comment?.map(item => {
                        return (
                          <div className="py-6 border-b px-2">
                            <div className="flex gap-3 ">
                              <span className="w-10 flex-shrink-0 h-10 text-xl font-semibold rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                                {item.userName[0]}
                              </span>
                              <div className="w-full">
                                <div className="flex justify-between items-center">
                                  <p className="flex items-center gap-3">
                                    <span className="font-semibold text-[16px] text-gray-600">{item.userName}</span>
                                  </p>
                                  <p className="text-gray-400 text-xs font-medium">{formatDate(item?.time)}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mt-3">{item?.comment}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <DrawerFooter className="fixed bg-white bottom-0 w-full">
                    <form onSubmit={handleComment}>
                      <div className="py-4 border-y w-full flex items-center gap-2">
                        <div className="img-box mt-1 h-9 flex-shrink-0 w-9  bg-gray-200 rounded-full">
                          <div className="flex h-full items-center justify-center">
                            {user?.name && <p className="uppercase font-semibold text-gray-500">{user?.name[0]}</p>}
                          </div>
                        </div>
                        <input
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          name="comment"
                          required
                          placeholder="Write comment"
                          type="text"
                          className=" w-full py-4 px-2 outline-none"
                        />
                      </div>
                      <div className="flex justify-end mt-5">
                        <button className="text-sm bg-black text-white py-2  px-4 rounded-3xl">Comment</button>
                      </div>
                    </form>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>

            <div className="flex border w-[140px] rounded-lg py-[7px] items-center gap-1">
              <Switch
                title="Toggle Send To Client"
                checked={project?.sendToClient}
                onCheckedChange={checked => {
                  if (checked) {
                    handleSendClientToggle(projectID, true);
                  } else {
                    handleSendClientToggle(projectID, false);
                  }
                }}
                id="timer-toggle"
                className="scale-[80%] data-[state=checked]:bg-black"
              />
              <span className="text-[14px] font-medium">Client Portal</span>
            </div>

            {/* <Button variant="outline" className="border-greige-500/30 bg-transparent">
              Client Portal
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button> */}
          </div>
        </div>

        {/*Table */}
        <ProcurementTable
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          handleChangeRoom={handleChangeRoom}
          handleDelete={handleDelete}
          project={project}
          groupedItems={groupedItems}
          refetch={refetch}
          loading={isLoading}
          projectID={projectID}
        />
      </div>

      {/* Product detail sheet */}
      <ProductDetailSheet open={open} onOpenChange={setOpen} product={selected} />
    </div>
  );
}
