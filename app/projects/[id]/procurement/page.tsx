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
  Check,
  Loader2,
  MessageSquareMore,
  MessageSquareText,
  ChevronDown,
  Info,
  X,
} from 'lucide-react';
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
  createXeroPO,
  getAllProduct,
  getContactbyID,
  modifyProject,
  removeProduct,
  sendProductToClient,
  toggleSendToClient,
  updateAllProductsSendToClient,
  updateProductProcurement,
  updateProductStatusToInternalReview,
  updatePurchaseOrder,
} from '@/supabase/API';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import ProcurementTable from '@/components/project/ProcurementTable';
import { addDays, cn, formatDateObj, parseMoney } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const logisticsLabels = {
  all: 'All',
  Draft: 'Draft',
  Quoting: 'Quoting',
  'Internal Review': 'Internal Review',
  'Out of Stock': 'Out of Stock',
  'Client Review': 'Client Review',
  'Payment Due': 'Payment Due',
  Ordered: 'Ordered',
  'In Transit': 'In Transit',
  Delivered: 'Delivered',
  Installed: 'Installed',
};

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

  const [showTip, setShowTip] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [needsActionActive, setNeedsActionActive] = useState(false);
  const [roomFilter, setRoomFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [poStatusFilter, setPOStatusFilter] = useState('all');
  const [billingFilter, setBillingFilter] = useState('all');
  const [sampleFilter, setSampleFilter] = useState('all');
  const [logisticsFilter, setLogisticsFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem(`procurement-filters-${params.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNeedsActionActive(parsed.needsAction || false);
      setRoomFilter(parsed.room || 'all');
      setSupplierFilter(parsed.supplier || 'all');
      setApprovalFilter(parsed.approval || 'all');
      setPOStatusFilter(parsed.poStatus || 'all');
      setBillingFilter(parsed.billing || 'all');
      setSampleFilter(parsed.sample || 'all');
      setLogisticsFilter(parsed.logistics || 'all');
      setDateFilter(parsed.date || 'all');
    }
  }, [params.id]);

  // Save filters to localStorage on change
  useEffect(() => {
    const filters = {
      needsAction: needsActionActive,
      room: roomFilter,
      supplier: supplierFilter,
      approval: approvalFilter,
      poStatus: poStatusFilter,
      billing: billingFilter,
      sample: sampleFilter,
      logistics: logisticsFilter,
      date: dateFilter,
    };
    localStorage.setItem(`procurement-filters-${params.id}`, JSON.stringify(filters));
  }, [
    params.id,
    needsActionActive,
    roomFilter,
    supplierFilter,
    approvalFilter,
    poStatusFilter,
    billingFilter,
    sampleFilter,
    logisticsFilter,
    dateFilter,
  ]);

  // Old function

  useEffect(() => {
    if (!params?.id) return;
    setProjectID(params?.id);
  }, [params?.id]);

  // Update Product
  const mutationP0Number = useMutation({
    mutationFn: updateProductProcurement,
    onSuccess: () => {
      toast('Status Updated');
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

  // update PO
  const mutationPO = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {},
    onError: () => {
      toast('Error! Try again');
    },
  });

  const { mutate: createPOMutate } = useMutation({
    mutationFn: createXeroPO,
    onSuccess(data, variables, context) {
      try {
        toast.success(data?.message);
        const inv = variables?._originalPo;
        if (data?.bill_id) {
          mutationPO.mutate({
            order: {
              ...inv,
              xero_po_id: data.bill_id,
            },
          });
          const runSequential = async () => {
            for (const product of checkedItems) {
              const { matchedProduct: _, ...updatedProduct } = {
                ...product,
                xeroPoNumber: data.bill_id,
              };

              await mutationP0Number.mutateAsync({
                product: updatedProduct,
                projectID,
                roomID: product.roomID,
              });
            }
          };
          runSequential();
        }
      } catch (error) {
        console.error('Error in onSuccess:', error);
        toast.error('Something went wrong while updating products.');
      } finally {
        setCheckedItems([]);
        toast.success('Purchase Order Synced With Xero');
        setButtonLoadingPO(false);
        queryClient.invalidateQueries(['purchaseOrder']);
        queryClient.refetchQueries('GetAllProduct');
      }
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

        const inv = e?.data?.[0];
        const lineItems = inv.products.map(p => ({
          description: p.itemName,
          quantity: p.QTY,
          unit_amount: parseMoney(p.amount),
          account_code: '200',
        }));
        const issueDate = inv.issueDate.split('T')[0];
        const dueAfter30 = addDays(issueDate, 30);

        const invoicePayload = {
          type: 'ACCPAY',
          contact: inv.supplier.company,
          date: formatDateObj(issueDate),
          due_date: formatDateObj(dueAfter30),
          invoice_number: inv.poNumber,
          reference: inv.poNumber || '',
          currency_code: project?.currency?.code,
          status: 'AUTHORISED',
          line_items: lineItems,
          _originalPo: inv,
        };

        createPOMutate(invoicePayload);

        // await Promise.all(
        //   checkedItems.map(item => {
        //     // Find the room ID for this item
        //     const roomID = groupedItems?.type?.find(room => room.product?.some(product => product.id === item.id))?.id;

        //     const { matchedProduct, ...updatedProduct } = {
        //       ...item,
        //       PO: [
        //         ...(Array.isArray(item.PO) ? item.PO : []),
        //         {
        //           poNumber: e.data[0].poNumber,
        //           poID: e.data[0].id,
        //         },
        //       ],
        //     };
        //     return mutationP0Number.mutateAsync({ product: updatedProduct, projectID: projectID, roomID });
        //   })
        // );
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
    const approvedItems = checkedItems.filter(item => item.status == 'approved' || !item.xeroPoNumber);
    if (approvedItems.length == 0) {
      toast.warning('No approved item found !');
      setButtonLoadingPO(false);
      return;
    }
    mutationUpdateProduct.mutate({ product: approvedItems, projectID });
    try {
      const totalOrder = {
        supplier: supplier.data.find(items => items.company.trim() === approvedItems[0]?.matchedProduct?.supplier?.trim()),
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

  const enrichProjectWithProducts = (
    searchText = '',
    currentSupplier = 'all',
    currentRoom = 'all',
    approvalFilter = 'all',
    sampleFilter = 'all',
    logisticsFilter = 'all'
  ) => {
    if (!project || !Array.isArray(project.type) || !Array.isArray(product)) {
      return project;
    }

    // -------------- ROOM FILTER ---------------
    let filteredTypes =
      currentRoom === 'all'
        ? [...project.type]
        : project.type.filter(t => t.text.trim().toLowerCase() === currentRoom.trim().toLowerCase());

    // Build product lookup (fast)
    const productLookup = {};
    product.forEach(p => {
      if (p?.id) productLookup[p.id] = p;
    });

    // SEARCH normalised once
    const searchLower = searchText.trim().toLowerCase();

    // -------------- ENRICH + APPLY FILTERS ---------------
    const enrichedTypes = filteredTypes.map(typeObj => {
      if (!Array.isArray(typeObj.product)) return typeObj;

      // Filter + enrich each product in the room
      const newProductList = typeObj.product
        .map(prod => {
          const matched = productLookup[prod.id];
          if (!matched) return null;

          // ---------------- FILTERS ----------------

          // Supplier filter
          if (currentSupplier !== 'all') {
            const pSupplier = matched.supplier?.trim().toLowerCase() || '';
            const fSupplier = currentSupplier.trim().toLowerCase();
            if (pSupplier !== fSupplier) return null;
          }

          // Search filter
          if (searchLower) {
            const name = matched.name?.toLowerCase() || '';
            if (!name.includes(searchLower)) return null;
          }

          // Approval filter
          if (approvalFilter !== 'all') {
            const status = prod.status?.toLowerCase() || '';
            if (status !== approvalFilter.toLowerCase()) return null;
          }

          // Sample filter
          if (sampleFilter !== 'all') {
            const sample = prod.sample?.toLowerCase() || '';
            if (sample !== sampleFilter.toLowerCase()) return null;
          }

          // Status filter
          if (logisticsFilter !== 'all') {
            const sample = prod.initialStatus?.toLowerCase() || '';
            if (sample !== logisticsFilter.toLowerCase()) return null;
          }

          // ---------------- RETURN ENRICHED ----------------
          return {
            ...prod,
            matchedProduct: matched,
          };
        })
        .filter(Boolean); // remove null (filtered out)

      return {
        ...typeObj,
        product: newProductList,
      };
    });

    return {
      ...project,
      type: enrichedTypes,
    };
  };

  const groupedItems = project
    ? enrichProjectWithProducts(searchText, supplierFilter, roomFilter, approvalFilter, sampleFilter, logisticsFilter)
    : {};

  useEffect(() => {
    if (isLoading) return;
    setProduct(data);
  }, [isLoading, data]);

  const totalItemsCount = useMemo(() => {
    if (!groupedItems?.type) return 0;

    return groupedItems.type.reduce((sum, item) => {
      return sum + (Array.isArray(item.product) ? item.product.length : 0);
    }, 0);
  }, [groupedItems]);

  const totalPendingCount = useMemo(() => {
    if (!groupedItems || !Array.isArray(groupedItems.type)) return 0;

    let totalCount = 0;

    groupedItems.type.forEach(item => {
      if (item && Array.isArray(item.product)) {
        item.product.forEach(singleItem => {
          if (singleItem.sendToClient && singleItem.status === 'pending') {
            totalCount++;
          }
        });
      }
    });

    return totalCount;
  }, [groupedItems]);

  const totalDeliveryCount = useMemo(() => {
    if (!groupedItems || !Array.isArray(groupedItems.type)) return 0;

    let totalCount = 0;

    groupedItems.type.forEach(item => {
      if (item && Array.isArray(item.product)) {
        item.product.forEach(singleItem => {
          if (singleItem.initialStatus === 'Delivered') {
            totalCount++;
          }
        });
      }
    });

    return totalCount;
  }, [groupedItems]);

  const totalCostCount = useMemo(() => {
    if (!groupedItems || !Array.isArray(groupedItems.type)) return 0;

    let cost = 0;

    groupedItems.type.forEach(typeObj => {
      if (!typeObj || !Array.isArray(typeObj.product)) return;

      typeObj.product.forEach(product => {
        if (product?.status === 'rejected') return;

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

        const priceValue = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
        cost += priceValue * quantity;
      });
    });

    return cost;
  }, [groupedItems]);

  // const totalApprovedCost = useMemo(() => {
  //   if (!groupedItems || !Array.isArray(groupedItems.type)) return 0;

  //   let cost = 0;

  //   groupedItems.type.forEach(typeObj => {
  //     if (!typeObj || !Array.isArray(typeObj.product)) return;

  //     typeObj.product.forEach(product => {
  //       if (product?.status !== 'approved') return;

  //       const quantity = Number(product.qty) < 1 ? 1 : Number(product.qty);
  //       const matched = product.matchedProduct;

  //       let priceString = '';

  //       if (matched?.priceMember && parseFloat(matched.priceMember.replace(/[^\d.]/g, '')) > 0) {
  //         priceString = matched.priceMember;
  //       } else if (matched?.priceRegular && parseFloat(matched.priceRegular.replace(/[^\d.]/g, '')) > 0) {
  //         priceString = matched.priceRegular;
  //       } else {
  //         return;
  //       }

  //       const priceValue = Number(parseFloat(priceString.replace(/[^\d.]/g, '')));
  //       cost += priceValue * quantity;
  //     });
  //   });

  //   return cost;
  // }, [groupedItems]);

  const totalQuantity = useMemo(() => {
    if (!groupedItems || !Array.isArray(groupedItems.type)) return 0;

    let totalQuantity = 0;

    groupedItems.type.forEach(typeObj => {
      if (typeObj && Array.isArray(typeObj.product)) {
        typeObj.product.forEach(product => {
          const quantity = product?.unitType === 'm' || product?.unitType === 'm²' ? 1 : Number(product?.qty) || 1;
          totalQuantity += quantity;
        });
      }
    });

    return totalQuantity;
  }, [groupedItems]);

  // Top summary
  const procurementStats = [
    { title: 'Total Items', value: totalItemsCount, subtitle: 'Products specified', icon: Package },
    { title: 'Total Quantity', value: totalQuantity.toFixed(2), subtitle: 'Units ordered', icon: Hash },
    { title: 'Pending Approval', value: totalPendingCount, subtitle: 'Waiting for sign-off', icon: Clock },
    {
      title: 'Total Cost',
      value: `${project?.currency?.symbol || '£'}${totalCostCount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: 'Estimated cost',
      icon: DollarSign,
    },

    {
      title: 'Delivery Progress',
      value: `${Math.ceil(totalDeliveryCount / totalItemsCount / 100)}%`,
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

  const needsActionCount = useMemo(() => {
    return 10;
    const today = new Date();
    return groupedItems?.filter(item => {
      const condApproval = !item?.clientApproval || item.clientApproval === 'pending';
      const condPO = !item.poId || !item.poSentAt;
      const condInvoice = !item.invoiceId || (item.invoiceId && !item.clientPaidAt);
      const etaDate = item.eta ? new Date(item.eta) : null;
      const condLogistics = !item.orderedDate || (item.logisticsStatus === 'in-transit' && etaDate && etaDate < today);

      return condApproval || condPO || condInvoice || condLogistics;
    }).length;
  }, []);

  const canCreatePO = useMemo(() => {
    64;
    if (checkedItems.length === 0) return false;
    const suppliers = new Set(checkedItems.map(item => item.matchedProduct?.supplier.trim()));
    console.log(suppliers);
    if (suppliers.size !== 1) return false;
    const allApproved = checkedItems.every(item => item.status === 'approved');
    if (!allApproved) return false;
    const noExistingPO = checkedItems.every(item => !item.xeroPoNumber);
    if (!noExistingPO) return false;
    return true;
  }, [checkedItems]);

  const canCreateInvoice = useMemo(() => {
    return false;
    if (checkedItems.size === 0) return false;
    const items = groupedItems?.filter(item => checkedItems.has(item.id));
    return items.every(item => !item.invoiceId);
  }, [checkedItems]);

  const canMarkSupplierPaid = useMemo(() => {
    return false;
    if (checkedItems.size === 0) return false;
    const items = groupedItems.filter(item => checkedItems.has(item.id));
    return items.every(item => item.poId && !item.supplierPaidAt);
  }, [checkedItems]);

  const canMarkClientPaid = useMemo(() => {
    return false;
    if (checkedItems.size === 0) return false;
    const items = groupedItems.filter(item => checkedItems.has(item.id));
    return items.every(item => item.invoiceId && !item.clientPaidAt);
  }, [checkedItems]);

  const hasActiveFilters = useMemo(() => {
    return (
      roomFilter !== 'all' ||
      supplierFilter !== 'all' ||
      approvalFilter !== 'all' ||
      poStatusFilter !== 'all' ||
      billingFilter !== 'all' ||
      sampleFilter !== 'all' ||
      logisticsFilter !== 'all' ||
      dateFilter !== 'all'
    );
  }, [roomFilter, supplierFilter, approvalFilter, poStatusFilter, billingFilter, sampleFilter, logisticsFilter, dateFilter]);

  function resetFilters() {
    setRoomFilter('all');
    setSupplierFilter('all');
    setApprovalFilter('all');
    setPOStatusFilter('all');
    setBillingFilter('all');
    setSampleFilter('all');
    setLogisticsFilter('all');
    setDateFilter('all');
  }

  console.log(checkedItems);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined);
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

            <Button
              variant={needsActionActive ? 'default' : 'outline'}
              size="sm"
              className={cn('h-9', needsActionActive ? 'bg-neutral-600 text-white hover:bg-neutral-700' : 'bg-white border-greige-500/30')}
              onClick={() => setNeedsActionActive(!needsActionActive)}
            >
              Needs action
              {needsActionCount > 0 && (
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded',
                    needsActionActive ? 'bg-white text-neutral-900' : 'bg-neutral-100 text-neutral-700'
                  )}
                >
                  {needsActionCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-white border-greige-500/30" disabled={checkedItems.size === 0}>
                  Bulk actions
                  {checkedItems.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded bg-neutral-100 text-neutral-700">
                      {checkedItems.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleClickPO} disabled={!canCreatePO}>
                  Create PO
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!canCreateInvoice}>Create Invoice</DropdownMenuItem>
                <DropdownMenuItem disabled={!canMarkSupplierPaid}>Mark Supplier Paid</DropdownMenuItem>
                <DropdownMenuItem disabled={!canMarkClientPaid}>Mark Client Paid</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <Popover open={mainOpen} onOpenChange={setMainOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-greige-500/30">
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
            </Popover> */}
          </div>

          <div className="flex items-center gap-2">
            {/* <Button
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
            </Button> */}

            {/* Comment Drawer */}
            <Drawer direction="right">
              <DrawerTrigger asChild>
                <Button variant="outline" className="border-greige-500/30">
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

            <div className="flex bg-white border w-[140px] rounded-lg py-[7px] items-center gap-1">
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
                className="scale-[80%]  data-[state=checked]:bg-black"
              />
              <span className="text-[14px] font-medium">Client Portal</span>
            </div>

            {/* <Button variant="outline" className="border-greige-500/30 bg-transparent">
              Client Portal
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button> */}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-[90px] h-8 bg-white capitalize border-greige-500/30 text-xs">
                <SelectValue>{roomFilter === 'all' ? 'Room' : roomFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rooms</SelectItem>
                {project?.type?.map(room => (
                  <SelectItem className="capitalize" key={room?.text} value={room?.text}>
                    {room?.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue>{supplierFilter === 'all' ? 'Supplier' : supplierFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {!supplierLoading &&
                  supplier?.data?.map(supplier => (
                    <SelectItem key={supplier?.id} value={supplier?.company}>
                      {supplier?.company}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className="w-[90px] capitalize h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue>
                  {approvalFilter === 'all' ? 'Approval' : approvalFilter === 'not-needed' ? 'Not needed' : approvalFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not-needed">Not needed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={poStatusFilter} onValueChange={setPOStatusFilter}>
              <SelectTrigger className="w-[90px] capitalize h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue>{poStatusFilter === 'all' ? 'PO' : poStatusFilter === 'ackd' ? "Ack'd" : poStatusFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="ackd">Ack'd</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="backorder">Backorder</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={billingFilter} onValueChange={setBillingFilter}>
              <SelectTrigger className="w-[90px] capitalize h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue>
                  {billingFilter === 'all'
                    ? 'Billing'
                    : billingFilter === 'not-invoiced'
                    ? 'Not invoiced'
                    : billingFilter === 'part-invoiced'
                    ? 'Part-invoiced'
                    : billingFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not-invoiced">Not invoiced</SelectItem>
                <SelectItem value="invoiced">Invoiced</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="part-invoiced">Part-invoiced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sampleFilter} onValueChange={setSampleFilter}>
              <SelectTrigger className="w-[90px] capitalize h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue>{sampleFilter === 'all' ? 'Sample' : sampleFilter === 'none' ? 'Not needed' : sampleFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="none">Not needed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={logisticsFilter} onValueChange={setLogisticsFilter}>
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue placeholder="Status">{logisticsLabels[logisticsFilter] || logisticsFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(logisticsLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue>{dateFilter === 'all' ? 'Date' : dateFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
              </SelectContent>
            </Select>
            {/* </CHANGE> */}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-neutral-600 hover:text-neutral-900" onClick={resetFilters}>
                Reset
              </Button>
            )}

            <Button variant="outline" size="sm" className="h-8 text-xs bg-white border-greige-500/30">
              Save view
            </Button>
          </div>

          {showTip && (
            <div className="flex items-start mt-5 gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-900 flex-1">Select multiple items from the same supplier to create one PO.</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 shrink-0"
                onClick={() => setShowTip(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
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

      {checkedItems?.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-greige-500/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-neutral-900">
                  {checkedItems?.length} item{checkedItems?.length !== 1 ? 's' : ''} selected
                </span>
                <Button variant="outline" size="sm" className="border-greige-500/30 bg-transparent" onClick={() => setCheckedItems([])}>
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canCreatePO || buttonLoadingPO}
                  onClick={handleClickPO}
                  className="border-greige-500/30 bg-transparent flex items-center gap-2"
                  title={!canCreatePO ? 'All selected items must be from the same supplier and have Approved status' : ''}
                >
                  {buttonLoadingPO ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating..
                    </span>
                  ) : (
                    'Create PO'
                  )}
                </Button>
                {/* 
                <Button variant="outline" size="sm" className="border-greige-500/30 bg-transparent" disabled={!canCreateInvoice}>
                  Create client invoice
                </Button>
                <Button variant="outline" size="sm" className="border-greige-500/30 bg-transparent" disabled={!canMarkSupplierPaid}>
                  Set dates
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
