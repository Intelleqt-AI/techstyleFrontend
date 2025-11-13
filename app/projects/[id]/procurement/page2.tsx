'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Package, Hash, Clock, DollarSign, Truck, Plus, Search, MoreHorizontal, ChevronDown, ChevronRight, X, Info } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductDetailSheet, type ProductDetails } from '@/components/product-detail-sheet';
import { cn } from '@/lib/utils';

type LogisticsStatus = 'not-ordered' | 'ordered' | 'dispatching' | 'in-transit' | 'delivered' | 'qc-issue';
type Unit = 'ea' | 'm' | 'm²' | 'set';

// Updated type definitions to reflect new fields and structures
type ApprovalStatus = 'approved' | 'pending' | 'rejected' | 'not-needed';
type SampleStatus = 'none' | 'requested' | 'received' | 'sent';
type BillingStatus = 'not-invoiced' | 'invoiced' | 'paid' | 'part-invoiced';
type POStatus = 'draft' | 'sent' | 'ackd' | 'partial' | 'backorder' | 'cancelled' | '';
type PaymentStatus = 'unpaid' | 'part-paid' | 'paid';

type ProcurementItem = {
  id: number;
  name: string;
  image: string;
  room: string;
  finish: string;
  dimensions: string;
  sku: string;
  supplier: string;
  supplierLogo?: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierLeadTime: string;
  sample: SampleStatus;
  clientApproval: ApprovalStatus;
  poId: string | null;
  poSentAt: string | null;
  supplierPaidAt: string | null;
  invoiceId: string | null;
  invoiceSentAt: string | null;
  clientPaidAt: string | null;
  // </CHANGE>
  poNumber: string;
  poStatus: POStatus;
  supplierPayment: PaymentStatus;
  poAmount: number;
  poLastUpdate: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  totalPrice: number;
  billing: BillingStatus;
  invoiceNumber: string;
  orderedDate: string;
  leadTime: string;
  eta: string;
  logisticsStatus: LogisticsStatus;
};

const procurementItems: ProcurementItem[] = [
  {
    id: 1,
    name: 'Italian Leather Sofa',
    image: '/images/products/leather-ottoman.png',
    room: 'Living Room',
    finish: 'Cognac Leather',
    dimensions: '220×95×85',
    sku: 'WE-SOFA-001',
    supplier: 'West Elm',
    supplierEmail: 'orders@westelm.com',
    supplierPhone: '+44 20 1234 5678',
    supplierLeadTime: '8-10 weeks',
    sample: 'received',
    clientApproval: 'approved',
    poId: '24051',
    poSentAt: '2024-09-08',
    supplierPaidAt: null,
    // </CHANGE>
    poNumber: 'PO-24051',
    poStatus: 'sent',
    supplierPayment: 'unpaid',
    poAmount: 3200.0,
    poLastUpdate: '2 days ago',
    quantity: 1,
    unit: 'ea',
    unitPrice: 3200.0,
    totalPrice: 3200.0,
    billing: 'invoiced',
    invoiceId: '24051',
    invoiceSentAt: '2024-09-10',
    clientPaidAt: null,
    // </CHANGE>
    invoiceNumber: 'INV-24051',
    orderedDate: '10 Sep',
    leadTime: '8 w',
    eta: '5 Nov',
    logisticsStatus: 'in-transit',
  },
  {
    id: 2,
    name: 'Marble Coffee Table',
    image: '/images/products/arched-mirror.png',
    room: 'Living Room',
    finish: 'Carrara Marble',
    dimensions: '120×60×45',
    sku: 'JL-TABLE-002',
    supplier: 'John Lewis',
    supplierEmail: 'trade@johnlewis.com',
    supplierPhone: '+44 20 2345 6789',
    supplierLeadTime: '6-8 weeks',
    sample: 'requested',
    clientApproval: 'approved',
    poId: null,
    poSentAt: null,
    supplierPaidAt: null,
    invoiceId: null,
    invoiceSentAt: null,
    clientPaidAt: null,
    // </CHANGE>
    poNumber: '',
    poStatus: '',
    supplierPayment: 'unpaid',
    poAmount: 0,
    poLastUpdate: '',
    quantity: 1,
    unit: 'ea',
    unitPrice: 1850.0,
    totalPrice: 1850.0,
    billing: 'not-invoiced',
    invoiceNumber: '',
    orderedDate: '',
    leadTime: '6 w',
    eta: '',
    logisticsStatus: 'not-ordered',
  },
  {
    id: 3,
    name: 'Designer Floor Lamp',
    image: '/images/products/pleated-table-lamp.png',
    room: 'Living Room',
    finish: 'Brushed Brass',
    dimensions: '30×30×165',
    sku: 'HAB-LAMP-003',
    supplier: 'Habitat',
    supplierEmail: 'sales@habitat.co.uk',
    supplierPhone: '+44 20 3456 7890',
    supplierLeadTime: '4-6 weeks',
    sample: 'received',
    clientApproval: 'approved',
    poId: '24053',
    poSentAt: '2024-09-13',
    supplierPaidAt: '2024-09-20',
    // </CHANGE>
    poNumber: 'PO-24053',
    poStatus: 'ackd',
    supplierPayment: 'paid',
    poAmount: 900.0,
    poLastUpdate: '1 week ago',
    quantity: 2,
    unit: 'ea',
    unitPrice: 450.0,
    totalPrice: 900.0,
    billing: 'paid',
    invoiceId: '24053',
    invoiceSentAt: '2024-09-15',
    clientPaidAt: '2024-09-22',
    // </CHANGE>
    invoiceNumber: 'INV-24053',
    orderedDate: '15 Sep',
    leadTime: '4 w',
    eta: '13 Oct',
    logisticsStatus: 'delivered',
  },
  {
    id: 4,
    name: 'Velvet Dining Chairs',
    image: '/images/products/striped-armchair.png',
    room: 'Dining Room',
    finish: 'Forest Green Velvet',
    dimensions: '55×60×85',
    sku: 'MADE-CHAIR-004',
    supplier: 'Made.com',
    supplierEmail: 'orders@made.com',
    supplierPhone: '+44 20 4567 8901',
    supplierLeadTime: '3-4 weeks',
    sample: 'none',
    clientApproval: 'pending',
    poId: null,
    poSentAt: null,
    supplierPaidAt: null,
    invoiceId: null,
    invoiceSentAt: null,
    clientPaidAt: null,
    poNumber: '',
    poStatus: '',
    supplierPayment: 'unpaid',
    poAmount: 0,
    poLastUpdate: '',
    quantity: 6,
    unit: 'ea',
    unitPrice: 280.0,
    totalPrice: 1680.0,
    billing: 'not-invoiced',
    invoiceNumber: '',
    orderedDate: '',
    leadTime: '3 w',
    eta: '',
    logisticsStatus: 'not-ordered',
  },
  {
    id: 5,
    name: 'Oak Dining Table',
    image: '/images/products/studded-dresser.png',
    room: 'Dining Room',
    finish: 'Natural Oak',
    dimensions: '200×100×75',
    sku: 'HEAL-TABLE-005',
    supplier: "Heal's",
    supplierEmail: 'trade@heals.com',
    supplierPhone: '+44 20 5678 9012',
    supplierLeadTime: '10-12 weeks',
    sample: 'received',
    clientApproval: 'approved',
    poId: '24057',
    poSentAt: '2024-09-02',
    supplierPaidAt: null,
    // </CHANGE>
    poNumber: 'PO-24057',
    poStatus: 'partial',
    supplierPayment: 'part-paid',
    poAmount: 1650.0,
    poLastUpdate: '3 days ago',
    quantity: 1,
    unit: 'ea',
    unitPrice: 1650.0,
    totalPrice: 1650.0,
    billing: 'invoiced',
    invoiceId: '24057',
    invoiceSentAt: '2024-09-05',
    clientPaidAt: null,
    // </CHANGE>
    invoiceNumber: 'INV-24057',
    orderedDate: '1 Sep',
    leadTime: '10 w',
    eta: '25 Oct',
    logisticsStatus: 'dispatching',
  },
  {
    id: 6,
    name: 'Persian Area Rug',
    image: '/images/products/woven-dining-chair.png',
    room: 'Dining Room',
    finish: 'Antique Red',
    dimensions: '300×200',
    sku: 'TRC-RUG-006',
    supplier: 'The Rug Company',
    supplierEmail: 'info@therugcompany.com',
    supplierPhone: '+44 20 6789 0123',
    supplierLeadTime: '2-3 weeks',
    sample: 'requested',
    clientApproval: 'rejected',
    poId: null,
    poSentAt: null,
    supplierPaidAt: null,
    invoiceId: null,
    invoiceSentAt: null,
    clientPaidAt: null,
    poNumber: '',
    poStatus: '',
    supplierPayment: 'unpaid',
    poAmount: 0,
    poLastUpdate: '',
    quantity: 1,
    unit: 'ea',
    unitPrice: 1200.0,
    totalPrice: 1200.0,
    billing: 'not-invoiced',
    invoiceNumber: '',
    orderedDate: '',
    leadTime: '2 w',
    eta: '',
    logisticsStatus: 'not-ordered',
  },
  {
    id: 7,
    name: 'Crystal Chandelier',
    image: '/images/products/travertine-table-lamp.png',
    room: 'Dining Room',
    finish: 'Polished Chrome',
    dimensions: '80×80×100',
    sku: 'HAR-CHAN-007',
    supplier: 'Harrods',
    supplierEmail: 'furniture@harrods.com',
    supplierPhone: '+44 20 7890 1234',
    supplierLeadTime: '12-14 weeks',
    sample: 'received',
    clientApproval: 'approved',
    poId: '24056',
    poSentAt: '2024-09-06',
    supplierPaidAt: null,
    // </CHANGE>
    poNumber: 'PO-24056',
    poStatus: 'sent',
    supplierPayment: 'unpaid',
    poAmount: 2800.0,
    poLastUpdate: '5 days ago',
    quantity: 1,
    unit: 'ea',
    unitPrice: 2800.0,
    totalPrice: 2800.0,
    billing: 'not-invoiced',
    invoiceId: '24056',
    invoiceSentAt: null,
    clientPaidAt: null,
    // </CHANGE>
    invoiceNumber: '',
    orderedDate: '5 Sep',
    leadTime: '12 w',
    eta: '28 Nov',
    logisticsStatus: 'ordered',
  },
  {
    id: 8,
    name: 'Brass Wall Sconces',
    image: '/images/products/fringed-parasol.png',
    room: 'Bedroom',
    finish: 'Antique Brass',
    dimensions: '15×25×30',
    sku: 'LGT-SCONCE-008',
    supplier: 'Lights.co.uk',
    supplierEmail: 'sales@lights.co.uk',
    supplierPhone: '+44 20 8901 2345',
    supplierLeadTime: '6-8 weeks',
    sample: 'none',
    clientApproval: 'not-needed',
    poId: null,
    poSentAt: null,
    supplierPaidAt: null,
    invoiceId: null,
    invoiceSentAt: null,
    clientPaidAt: null,
    poNumber: '',
    poStatus: '',
    supplierPayment: 'unpaid',
    poAmount: 0,
    poLastUpdate: '',
    quantity: 4,
    unit: 'ea',
    unitPrice: 180.0,
    totalPrice: 720.0,
    billing: 'not-invoiced',
    invoiceNumber: '',
    orderedDate: '',
    leadTime: '6 w',
    eta: '',
    logisticsStatus: 'not-ordered',
  },
  {
    id: 9,
    name: 'Linen Bedding Set',
    image: '/images/products/leather-ottoman.png',
    room: 'Bedroom',
    finish: 'Stone Grey',
    dimensions: 'King Size',
    sku: 'WH-BED-009',
    supplier: 'The White Company',
    supplierEmail: 'orders@thewhitecompany.com',
    supplierPhone: '+44 20 9012 3456',
    supplierLeadTime: '1-2 weeks',
    sample: 'received',
    clientApproval: 'approved',
    poId: '24059',
    poSentAt: '2024-09-19',
    supplierPaidAt: '2024-09-21',
    // </CHANGE>
    poNumber: 'PO-24059',
    poStatus: 'ackd',
    supplierPayment: 'paid',
    poAmount: 640.0,
    poLastUpdate: '1 week ago',
    quantity: 2,
    unit: 'set',
    unitPrice: 320.0,
    totalPrice: 640.0,
    billing: 'paid',
    invoiceId: '24059',
    invoiceSentAt: '2024-09-20',
    clientPaidAt: '2024-09-25',
    // </CHANGE>
    invoiceNumber: 'INV-24059',
    orderedDate: '20 Sep',
    leadTime: '1 w',
    eta: '27 Sep',
    logisticsStatus: 'delivered',
  },
  {
    id: 10,
    name: 'Upholstered Headboard',
    image: '/images/products/striped-armchair.png',
    room: 'Bedroom',
    finish: 'Dove Grey Linen',
    dimensions: '180×120',
    sku: 'MADE-HEAD-010',
    supplier: 'Made.com',
    supplierEmail: 'orders@made.com',
    supplierPhone: '+44 20 4567 8901',
    supplierLeadTime: '4-5 weeks',
    sample: 'requested',
    clientApproval: 'approved',
    poId: '24060',
    poSentAt: '2024-09-13',
    supplierPaidAt: null,
    // </CHANGE>
    poNumber: 'PO-24060',
    poStatus: 'sent',
    supplierPayment: 'unpaid',
    poAmount: 580.0,
    poLastUpdate: '4 days ago',
    quantity: 1,
    unit: 'ea',
    unitPrice: 580.0,
    totalPrice: 580.0,
    billing: 'invoiced',
    invoiceId: '24060',
    invoiceSentAt: '2024-09-14',
    clientPaidAt: null,
    // </CHANGE>
    invoiceNumber: 'INV-24060',
    orderedDate: '12 Sep',
    leadTime: '4 w',
    eta: '10 Oct',
    logisticsStatus: 'qc-issue',
  },
  {
    id: 11,
    name: 'Bathroom Vanity Unit',
    image: '/images/products/studded-dresser.png',
    room: 'Bathroom',
    finish: 'Walnut with Marble Top',
    dimensions: '120×55×85',
    sku: 'VIC-VAN-011',
    supplier: 'Victoria Plum',
    supplierEmail: 'trade@victoriaplum.com',
    supplierPhone: '+44 20 0123 4567',
    supplierLeadTime: '3-4 weeks',
    sample: 'none',
    clientApproval: 'approved',
    poId: '24062',
    poSentAt: null,
    supplierPaidAt: null,
    // </CHANGE>
    poNumber: '',
    poStatus: '',
    supplierPayment: 'unpaid',
    poAmount: 0,
    poLastUpdate: '',
    quantity: 1,
    unit: 'ea',
    unitPrice: 1450.0,
    totalPrice: 1450.0,
    billing: 'not-invoiced',
    invoiceId: null,
    invoiceSentAt: null,
    clientPaidAt: null,
    invoiceNumber: '',
    orderedDate: '',
    leadTime: '3 w',
    eta: '',
    logisticsStatus: 'not-ordered',
  },
  {
    id: 12,
    name: 'Rainfall Shower Head',
    image: '/images/products/arched-mirror.png',
    room: 'Bathroom',
    finish: 'Matte Black',
    dimensions: '30×30',
    sku: 'GRO-SHOW-012',
    supplier: 'Grohe',
    supplierEmail: 'uk@grohe.com',
    supplierPhone: '+44 20 1234 5670',
    supplierLeadTime: '2-3 weeks',
    sample: 'received',
    clientApproval: 'approved',
    poId: '24061',
    poSentAt: '2024-09-17',
    supplierPaidAt: '2024-09-23',
    // </CHANGE>
    poNumber: 'PO-24061',
    poStatus: 'ackd',
    supplierPayment: 'unpaid',
    poAmount: 780.0,
    poLastUpdate: '6 days ago',
    quantity: 1,
    unit: 'ea',
    unitPrice: 780.0,
    totalPrice: 780.0,
    billing: 'not-invoiced',
    invoiceId: '24061',
    invoiceSentAt: null,
    clientPaidAt: null,
    // </CHANGE>
    invoiceNumber: '',
    orderedDate: '18 Sep',
    leadTime: '2 w',
    eta: '2 Oct',
    logisticsStatus: 'in-transit',
  },
];

const procurementStats = [
  { title: 'Total Items', value: '12', subtitle: '', icon: Package },
  { title: 'Total Cost', value: '£18,670.00', subtitle: '', icon: DollarSign },
  { title: 'Pending POs', value: '3', subtitle: '', icon: Hash },
  { title: 'In Transit', value: '3', subtitle: '', icon: Truck },
  { title: 'ETA Soon', value: '5', subtitle: '', icon: Clock },
];

function SamplePill({ status, onChange }: { status: SampleStatus; onChange?: (status: SampleStatus) => void }) {
  const labels = { none: 'Not required', requested: 'Requested', received: 'Received', sent: 'Sent' };
  const colors = {
    none: 'bg-greige-100 text-taupe-700 border-greige-500',
    requested: 'bg-ochre-300/30 text-ochre-700 border-ochre-700/30',
    sent: 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    received: 'bg-sage-300/50 text-olive-700 border-olive-700/20',
  };

  if (onChange) {
    return (
      <Select value={status} onValueChange={onChange}>
        <SelectTrigger className={cn('h-6 text-xs font-medium border whitespace-nowrap w-auto', colors[status])}>
          <SelectValue>{labels[status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not required</SelectItem>
          <SelectItem value="requested">Requested</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="received">Received</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span className={cn('inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap', colors[status])}>
      {labels[status]}
    </span>
  );
}

function ApprovalPill({ status, onChange }: { status: ApprovalStatus; onChange?: (status: ApprovalStatus) => void }) {
  const labels = { 'not-needed': 'Not needed', pending: 'Pending', approved: 'Approved', rejected: 'Changes requested' };
  const colors = {
    'not-needed': 'bg-greige-100 text-taupe-700 border-greige-500',
    pending: 'bg-ochre-300/30 text-ochre-700 border-ochre-700/30',
    approved: 'bg-sage-300/50 text-olive-700 border-olive-700/20',
    rejected: 'bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30',
  };

  if (onChange) {
    return (
      <Select value={status} onValueChange={onChange}>
        <SelectTrigger className={cn('h-6 text-xs font-medium border whitespace-nowrap w-auto', colors[status])}>
          <SelectValue>{labels[status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not-needed">Not needed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Changes requested</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span className={cn('inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap', colors[status])}>
      {labels[status]}
    </span>
  );
}

function BillingPill({ status, invoiceNumber }: { status: BillingStatus; invoiceNumber?: string }) {
  const labels = {
    'not-invoiced': 'Not invoiced',
    invoiced: 'Invoiced',
    paid: 'Paid',
    'part-invoiced': 'Part-invoiced',
  };
  const colors = {
    'not-invoiced': 'bg-greige-100 text-taupe-700 border-greige-500',
    'part-invoiced': 'bg-ochre-300/30 text-ochre-700 border-ochre-700/30',
    invoiced: 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    paid: 'bg-sage-300/50 text-olive-700 border-olive-700/20',
  };
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn('inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap w-fit', colors[status])}
      >
        {labels[status]}
      </span>
      {invoiceNumber && <button className="text-xs text-primary hover:underline text-left">{invoiceNumber}</button>}
    </div>
  );
}

function LogisticsPill({
  status,
  orderedDate,
  leadTime,
  eta,
}: {
  status: LogisticsStatus;
  orderedDate?: string;
  leadTime?: string;
  eta?: string;
}) {
  const labels = {
    'not-ordered': 'Not ordered',
    ordered: 'Ordered',
    dispatching: 'Dispatching',
    'in-transit': 'In transit',
    delivered: 'Delivered',
    'qc-issue': 'Back-ordered',
  };
  const colors = {
    'not-ordered': 'bg-greige-100 text-taupe-700 border-greige-500',
    ordered: 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    dispatching: 'bg-ochre-300/30 text-ochre-700 border-ochre-700/30',
    'in-transit': 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    delivered: 'bg-sage-300/50 text-olive-700 border-olive-700/20',
    'qc-issue': 'bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30',
  };

  if (!orderedDate) {
    return (
      <span className={cn('inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap', colors[status])}>
        {labels[status]}
      </span>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col gap-0.5 flex-1 text-neutral-700">
        <span className="text-sm">
          <span className="font-semibold">Ordered:</span> {orderedDate}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">Lead:</span>
          <Input type="text" defaultValue={leadTime} placeholder="2-4 w" className="h-6 w-16 text-xs px-1.5 py-0" />
        </div>
      </div>
      <div className="flex flex-col gap-0.5 items-start">
        <span
          className={cn(
            'inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap shrink-0',
            colors[status]
          )}
        >
          {labels[status]}
        </span>
        {eta && (
          <span className="text-sm text-neutral-700">
            <span className="font-semibold">ETA:</span> {eta}
          </span>
        )}
      </div>
    </div>
  );
  // </CHANGE>
}

function POStatusDots({ poId, poSentAt, supplierPaidAt }: { poId: string | null; poSentAt: string | null; supplierPaidAt: string | null }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
      <div className="flex items-center gap-1" title="PO created">
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', poId ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">Created</span>
      </div>
      <div className="flex items-center gap-1" title="PO sent to supplier">
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', poSentAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">Sent</span>
      </div>
      <div className="flex items-center gap-1" title="Supplier paid">
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            supplierPaidAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">Paid</span>
      </div>
    </div>
  );
}

function BillingStatusDots({
  invoiceId,
  invoiceSentAt,
  clientPaidAt,
}: {
  invoiceId: string | null;
  invoiceSentAt: string | null;
  clientPaidAt: string | null;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
      <div className="flex items-center gap-1" title="Invoice created">
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', invoiceId ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">Created</span>
      </div>
      <div className="flex items-center gap-1" title="Invoice sent to client">
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            invoiceSentAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">Sent</span>
      </div>
      <div className="flex items-center gap-1" title="Client paid">
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            clientPaidAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">Paid</span>
      </div>
    </div>
  );
}
// </CHANGE>

function POCell({ item }: { item: ProcurementItem }) {
  if (!item.poId) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 px-2 text-sm whitespace-nowrap w-fit',
            item.supplier && item.clientApproval === 'approved' ? 'text-primary hover:bg-primary/10' : 'text-neutral-400 cursor-not-allowed'
          )}
          disabled={!item.supplier || item.clientApproval !== 'approved'}
          title={!item.supplier || item.clientApproval !== 'approved' ? 'Supplier must be set and approval must be Approved' : ''}
        >
          Create PO
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button className="text-sm text-primary hover:underline text-left whitespace-nowrap">PO-{item.poId}</button>
      <POStatusDots poId={item.poId} poSentAt={item.poSentAt} supplierPaidAt={item.supplierPaidAt} />
    </div>
  );
}
// </CHANGE>

function BillingCell({ item }: { item: ProcurementItem }) {
  if (!item.invoiceId) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button variant="ghost" size="sm" className="h-8 px-2 text-sm whitespace-nowrap w-fit text-neutral-400">
          Create invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button className="text-sm text-primary hover:underline text-left whitespace-nowrap">INV-{item.invoiceId}</button>
      <BillingStatusDots invoiceId={item.invoiceId} invoiceSentAt={item.invoiceSentAt} clientPaidAt={item.clientPaidAt} />
    </div>
  );
}
// </CHANGE>

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
              { src: '/images/products/pleated-table-lamp.png', alt: 'Alt view' },
              { src: '/images/products/arched-mirror.png', alt: 'Alt view 2' },
            ],
            // Updated prices to use .toFixed(2) for currency formatting
            prices: { retail: `£${it.totalPrice.toFixed(2)}` },
            size: it.dimensions,
            stockStatus: 'In Stock',
            sampleAvailable: it.sample === 'received' ? 'Yes' : it.sample === 'requested' ? 'Requested' : 'No',
            measurements: it.dimensions,
            description: 'High-quality piece specified for the project.',
            tags: ['Procurement', 'Specified'],
          } as ProductDetails,
        ])
      ),
    [items]
  );
}

export default function ProjectProcurementPage({ params }: { params: { id: string } }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(['Living Room', 'Dining Room', 'Bedroom', 'Bathroom']));
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

  // Load filters from localStorage on mount
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

  const productMap = useProductMap(procurementItems);

  const filteredItems = useMemo(() => {
    const today = new Date();

    return procurementItems.filter(item => {
      // Search filter
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Needs action logic
      if (needsActionActive) {
        const condApproval = !item.clientApproval || item.clientApproval === 'pending';
        const condPO = !item.poId || !item.poSentAt;
        const condInvoice = !item.invoiceId || (item.invoiceId && !item.clientPaidAt);
        const etaDate = item.eta ? new Date(item.eta) : null;
        const condLogistics = !item.orderedDate || (item.logisticsStatus === 'in-transit' && etaDate && etaDate < today);

        if (!(condApproval || condPO || condInvoice || condLogistics)) {
          return false;
        }
      }

      // Room filter
      if (roomFilter !== 'all' && item.room !== roomFilter) return false;

      // Supplier filter
      if (supplierFilter !== 'all' && item.supplier !== supplierFilter) return false;

      // Approval filter
      if (approvalFilter !== 'all') {
        if (approvalFilter === 'pending' && !(item.clientApproval === 'pending' || !item.clientApproval)) return false;
        if (approvalFilter === 'approved' && item.clientApproval !== 'approved') return false;
        if (approvalFilter === 'rejected' && item.clientApproval !== 'rejected') return false;
        if (approvalFilter === 'not-needed' && item.clientApproval !== 'not-needed') return false;
      }

      // PO status filter
      if (poStatusFilter !== 'all') {
        if (poStatusFilter === 'draft' && item.poId) return false;
        if (poStatusFilter === 'sent' && !item.poSentAt) return false;
        if (poStatusFilter === 'ackd' && item.poStatus !== 'ackd') return false;
        if (poStatusFilter === 'partial' && item.poStatus !== 'partial') return false;
        if (poStatusFilter === 'backorder' && item.poStatus !== 'backorder') return false;
        if (poStatusFilter === 'cancelled' && item.poStatus !== 'cancelled') return false;
      }

      // Billing filter
      if (billingFilter !== 'all') {
        if (billingFilter === 'not-invoiced' && item.invoiceId) return false;
        if (billingFilter === 'invoiced' && !item.invoiceId) return false;
        if (billingFilter === 'paid' && !item.clientPaidAt) return false;
        if (billingFilter === 'part-invoiced' && item.billing !== 'part-invoiced') return false;
      }

      // Sample filter
      if (sampleFilter !== 'all' && item.sample !== sampleFilter) return false;

      // Logistics filter
      if (logisticsFilter !== 'all') {
        if (logisticsFilter === 'not-ordered' && item.orderedDate) return false;
        if (logisticsFilter === 'ordered' && item.logisticsStatus !== 'ordered') return false;
        if (logisticsFilter === 'dispatching' && item.logisticsStatus !== 'dispatching') return false;
        if (logisticsFilter === 'in-transit' && item.logisticsStatus !== 'in-transit') return false;
        if (logisticsFilter === 'delivered' && item.logisticsStatus !== 'delivered') return false;
        if (logisticsFilter === 'qc-issue' && item.logisticsStatus !== 'qc-issue') return false;
      }

      return true;
    });
  }, [
    searchQuery,
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

  const needsActionCount = useMemo(() => {
    const today = new Date();
    return procurementItems.filter(item => {
      const condApproval = !item.clientApproval || item.clientApproval === 'pending';
      const condPO = !item.poId || !item.poSentAt;
      const condInvoice = !item.invoiceId || (item.invoiceId && !item.clientPaidAt);
      const etaDate = item.eta ? new Date(item.eta) : null;
      const condLogistics = !item.orderedDate || (item.logisticsStatus === 'in-transit' && etaDate && etaDate < today);

      return condApproval || condPO || condInvoice || condLogistics;
    }).length;
  }, []);

  const itemsByRoom = useMemo(() => {
    const grouped = new Map<string, ProcurementItem[]>();
    filteredItems.forEach(item => {
      const room = item.room;
      if (!grouped.has(room)) grouped.set(room, []);
      grouped.get(room)!.push(item);
    });
    return grouped;
  }, [filteredItems]);

  const roomSubtotals = useMemo(() => {
    const subtotals = new Map<string, { count: number; total: string }>();
    itemsByRoom.forEach((items, room) => {
      const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
      subtotals.set(room, {
        count: items.length,
        total: `£${total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      });
    });
    return subtotals;
  }, [itemsByRoom]);

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

  const uniqueRooms = useMemo(() => Array.from(new Set(procurementItems.map(item => item.room))).sort(), []);
  const uniqueSuppliers = useMemo(() => Array.from(new Set(procurementItems.map(item => item.supplier))).sort(), []);

  const canCreatePO = useMemo(() => {
    if (selectedItems.size === 0) return false;
    const items = procurementItems.filter(item => selectedItems.has(item.id));
    const suppliers = new Set(items.map(item => item.supplier));
    const allApproved = items.every(item => item.clientApproval === 'approved');
    return suppliers.size === 1 && allApproved && items.every(item => !item.poId);
  }, [selectedItems]);

  const canCreateInvoice = useMemo(() => {
    if (selectedItems.size === 0) return false;
    const items = procurementItems.filter(item => selectedItems.has(item.id));
    return items.every(item => !item.invoiceId);
  }, [selectedItems]);

  const canMarkSupplierPaid = useMemo(() => {
    if (selectedItems.size === 0) return false;
    const items = procurementItems.filter(item => selectedItems.has(item.id));
    return items.every(item => item.poId && !item.supplierPaidAt);
  }, [selectedItems]);

  const canMarkClientPaid = useMemo(() => {
    if (selectedItems.size === 0) return false;
    const items = procurementItems.filter(item => selectedItems.has(item.id));
    return items.every(item => item.invoiceId && !item.clientPaidAt);
  }, [selectedItems]);

  // Handler functions for room expansion and item selection
  const toggleRoom = (room: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  };

  const toggleAllInRoom = (roomItems: ProcurementItem[]) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      const allSelected = roomItems.every(item => prev.has(item.id));
      roomItems.forEach(item => {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      });
      return next;
    });
  };

  const toggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const openProduct = (productId: number) => {
    setSelected(productMap[productId]);
    setOpen(true);
  };

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

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 bg-white border-greige-500/30"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant={needsActionActive ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-9',
                  needsActionActive ? 'bg-neutral-600 text-white hover:bg-neutral-700' : 'bg-white border-greige-500/30'
                )}
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
                  <Button variant="outline" size="sm" className="h-9 bg-white border-greige-500/30" disabled={selectedItems.size === 0}>
                    Bulk actions
                    {selectedItems.size > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded bg-neutral-100 text-neutral-700">
                        {selectedItems.size}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem disabled={!canCreatePO}>Create PO</DropdownMenuItem>
                  <DropdownMenuItem disabled={!canCreateInvoice}>Create Invoice</DropdownMenuItem>
                  <DropdownMenuItem disabled={!canMarkSupplierPaid}>Mark Supplier Paid</DropdownMenuItem>
                  <DropdownMenuItem disabled={!canMarkClientPaid}>Mark Client Paid</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button className="h-9 bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New item
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
                <SelectValue>{roomFilter === 'all' ? 'Room' : roomFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rooms</SelectItem>
                {uniqueRooms.map(room => (
                  <SelectItem key={room} value={room}>
                    {room}
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
                {uniqueSuppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
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
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
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
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
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
              <SelectTrigger className="w-[90px] h-8 bg-white border-greige-500/30 text-xs">
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
                <SelectValue>
                  {logisticsFilter === 'all'
                    ? 'Logistics'
                    : logisticsFilter === 'not-ordered'
                    ? 'Not ordered'
                    : logisticsFilter === 'in-transit'
                    ? 'In transit'
                    : logisticsFilter === 'qc-issue'
                    ? 'Back-ordered'
                    : logisticsFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not-ordered">Not ordered</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="dispatching">Dispatching</SelectItem>
                <SelectItem value="in-transit">In transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="qc-issue">Back-ordered</SelectItem>
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
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
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

        {filteredItems.length === 0 ? (
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-neutral-600 mb-4">No items match your filters.</p>
              <Button variant="outline" onClick={resetFilters}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-greige-500/30 shadow-sm overflow-hidden rounded-xl">
            <CardContent className="p-0">
              {Array.from(itemsByRoom.entries()).map(([room, items]) => {
                const isExpanded = expandedRooms.has(room);
                const subtotal = roomSubtotals.get(room);

                return (
                  <div key={room} className="border-b border-greige-500/30 last:border-b-0">
                    <div className="bg-neutral-100 border-b border-greige-500/30">
                      <button
                        onClick={() => toggleRoom(room)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-200 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-neutral-600 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                        )}
                        <span className="font-semibold text-neutral-900">
                          {room} — {subtotal?.count} items • Subtotal {subtotal?.total}
                        </span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                        <table className="w-full min-w-[1600px]">
                          <thead className="bg-neutral-50 border-b border-greige-500/30">
                            <tr>
                              <th className="sticky left-0 z-10 bg-neutral-50 px-4 py-3 text-left w-12">
                                <input
                                  type="checkbox"
                                  className="rounded border-greige-500/30"
                                  checked={items.every(item => selectedItems.has(item.id))}
                                  onChange={() => toggleAllInRoom(items)}
                                />
                              </th>
                              <th className="sticky left-12 z-10 bg-neutral-50 px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[280px]">
                                Product
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[140px]">Supplier</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[120px]">Sample</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[140px]">Qty / Unit</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 min-w-[100px]">Unit £</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 min-w-[110px]">Total £</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[140px]">Approval</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[120px]">PO</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[140px]">Billing</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[240px]">Logistics</th>
                              <th className="px-4 py-3 w-12"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200">
                            {items.map(item => {
                              const isSelected = selectedItems.has(item.id);

                              return (
                                <tr
                                  key={item.id}
                                  className={cn('hover:bg-neutral-50 transition-colors group', isSelected && 'bg-primary/5')}
                                >
                                  <td className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50 px-4 py-3">
                                    <input
                                      type="checkbox"
                                      className="rounded border-greige-500/30"
                                      checked={isSelected}
                                      onChange={() => toggleItem(item.id)}
                                    />
                                  </td>

                                  <td className="sticky left-12 z-10 bg-white group-hover:bg-neutral-50 px-4 py-3">
                                    <div className="flex items-start gap-3">
                                      <button
                                        onClick={() => openProduct(item.id)}
                                        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                                      >
                                        <img
                                          src={item.image || '/placeholder.svg'}
                                          alt={item.name}
                                          className="w-12 h-12 rounded-lg object-cover border border-greige-500/30"
                                        />
                                      </button>
                                      <div className="flex-1 min-w-0 pt-0.5">
                                        <button
                                          onClick={() => openProduct(item.id)}
                                          className="font-semibold text-sm text-neutral-900 hover:text-primary block truncate max-w-[180px]"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </button>
                                        <div className="text-xs text-neutral-600 mt-1">
                                          {item.sku} • {item.dimensions}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <button
                                      className="text-sm text-neutral-900 hover:text-primary truncate max-w-[130px] block"
                                      title={`${item.supplier}\n${item.supplierEmail}\n${item.supplierPhone}\nLead time: ${item.supplierLeadTime}`}
                                    >
                                      {item.supplier}
                                    </button>
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <SamplePill
                                      status={item.sample}
                                      onChange={status => console.log('[v0] Sample status changed:', status)}
                                    />
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <div className="flex items-center gap-2">
                                      <Input type="number" defaultValue={item.quantity} className="h-9 w-16 text-sm px-2 tabular-nums" />
                                      <Select defaultValue={item.unit}>
                                        <SelectTrigger className="h-9 w-16 text-sm px-2">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ea">ea</SelectItem>
                                          <SelectItem value="m">m</SelectItem>
                                          <SelectItem value="m²">m²</SelectItem>
                                          <SelectItem value="set">set</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 text-right align-top pt-4">
                                    <span className="text-sm text-neutral-600 tabular-nums">£{item.unitPrice.toFixed(2)}</span>
                                  </td>

                                  <td className="px-4 py-3 text-right align-top pt-4">
                                    <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                                      £{item.totalPrice.toFixed(2)}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <ApprovalPill
                                      status={item.clientApproval}
                                      onChange={status => console.log('[v0] Approval status changed:', status)}
                                    />
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <POCell item={item} />
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <BillingCell item={item} />
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <LogisticsPill
                                      status={item.logisticsStatus}
                                      orderedDate={item.orderedDate}
                                      leadTime={item.leadTime}
                                      eta={item.eta}
                                    />
                                  </td>

                                  <td className="px-4 py-3 align-top pt-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openProduct(item.id)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                        <DropdownMenuItem>Move to room</DropdownMenuItem>
                                        <DropdownMenuItem>Archive</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedItems.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-greige-500/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-neutral-900">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-greige-500/30 bg-transparent"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-greige-500/30 bg-transparent"
                  disabled={!canCreatePO}
                  title={!canCreatePO ? 'All selected items must be from the same supplier and have Approved status' : ''}
                >
                  Create PO
                </Button>
                <Button variant="outline" size="sm" className="border-greige-500/30 bg-transparent" disabled={!canCreateInvoice}>
                  Create client invoice
                </Button>
                <Button variant="outline" size="sm" className="border-greige-500/30 bg-transparent" disabled={!canMarkSupplierPaid}>
                  Set dates
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product detail sheet */}
      <ProductDetailSheet open={open} onOpenChange={setOpen} product={selected} />
    </div>
  );
}
