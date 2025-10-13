'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CrmNav } from '@/components/crm-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TypeChip } from '@/components/chip';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteContact, getContact } from '@/supabase/API';
import { ContactDetailSheet } from '@/components/contact-details';
import { ContactFormModal } from '@/components/create-contact-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteDialog } from '@/components/DeleteDialog';
import { toast } from 'sonner';
import React from 'react';

// 🧱 Contact Row component (memoized)
const ContactRow = React.memo(function ContactRow({
  contact,
  onView,
  onEdit,
  onDelete,
}: {
  contact: any;
  onView: (c: any) => void;
  onEdit: (c: any) => void;
  onDelete: (c: any) => void;
}) {
  return (
    <tr key={contact.id} className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <Checkbox />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
              {contact?.name ? contact.name[0] : contact?.company?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate" title={contact?.name}>
              {contact?.name}
            </div>
            <div className="text-xs text-gray-600 truncate" title={contact?.company}>
              {contact?.company}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-gray-600 whitespace-nowrap truncate" title={contact?.email}>
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{contact?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 whitespace-nowrap truncate" title={contact?.phone}>
            <Phone className="w-4 h-4 shrink-0" />
            <span className="truncate">{contact?.phone}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <TypeChip label={contact?.type} />
      </td>
      <td className="pl-4 pr-6 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              aria-label={`Open actions for ${contact?.name}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(contact)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (contact?.email) {
                  window.location.href = `mailto:${contact?.email}`;
                } else {
                  alert('No email address available for this contact.');
                }
              }}
            >
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
            <DropdownMenuItem>Add Note</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(contact)}>Edit Contact</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(contact)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
});

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'suppliers' | 'contractors'>('all');
  const [contacts, setContacts] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const contactFilters = ['All', 'Clients', 'Suppliers', 'Contractors'];
  const queryClient = useQueryClient();

  const { data: contactData, isLoading } = useQuery({
    queryKey: ['getContacts'],
    queryFn: getContact,
  });

  useEffect(() => {
    document.title = 'Contacts | TechStyles';
  }, []);

  useEffect(() => {
    if (!isLoading && contactData) {
      setContacts(contactData.data);
    }
  }, [isLoading, contactData]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const matchType = (c: any) => {
      if (activeTab === 'all') return true;
      const t = c?.type?.toLowerCase() || '';
      return (
        (activeTab === 'clients' && t.includes('client')) ||
        (activeTab === 'suppliers' && t.includes('supplier')) ||
        (activeTab === 'contractors' && t.includes('contractor'))
      );
    };
    return contacts.filter(c => {
      const matchesSearch =
        c?.name?.toLowerCase().includes(q) || c?.company?.toLowerCase().includes(q) || c?.email?.toLowerCase().includes(q);
      return matchType(c) && (!q || matchesSearch);
    });
  }, [contacts, searchTerm, activeTab]);

  // 🪝 Stable callbacks (memoized)
  const handleOpenSheet = useCallback((contact: any) => {
    setSheetOpen(true);
    setSelected(contact);
  }, []);

  const handleOpenContactForm = useCallback((contact: any) => {
    setContactModalOpen(true);
    setSelected(contact);
  }, []);

  const openDeleteModal = useCallback((contact: any) => {
    setIsDeleteOpen(true);
    setSelected(contact);
  }, []);

  const { mutate } = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      toast('Contact Deleted!');
      queryClient.invalidateQueries(['getContacts']);
    },
    onError: () => {
      toast('Error! Could not delete contact.');
    },
  });

  const handleDelete = useCallback(
    (id: string) => {
      mutate(id);
    },
    [mutate]
  );

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <CrmNav />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {activeTab === 'all'
                    ? 'Filter'
                    : activeTab === 'clients'
                    ? 'Clients'
                    : activeTab === 'suppliers'
                    ? 'Suppliers'
                    : 'Contractors'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {contactFilters.map(label => {
                  const val = label === 'All' ? 'all' : label.toLowerCase();
                  return (
                    <DropdownMenuItem
                      key={label}
                      onClick={() => setActiveTab(val as any)}
                      className={activeTab === val ? 'font-semibold text-black' : ''}
                    >
                      {label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800" onClick={() => setContactModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 48 }}>
                    <Checkbox />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 320 }}>
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 360 }}>
                    Contact Info
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 140 }}>
                    Type
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600" style={{ width: 96 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {!isLoading &&
                  filtered.map(contact => (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      onView={handleOpenSheet}
                      onEdit={handleOpenContactForm}
                      onDelete={openDeleteModal}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ContactDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} contact={selected} />
      <ContactFormModal open={contactModalOpen} onOpenChange={setContactModalOpen} contact={selected} setSelected={setSelected} />
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDelete(selected?.id)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        itemName={selected?.name}
        requireConfirmation={false}
      />
    </div>
  );
}
