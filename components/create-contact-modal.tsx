'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CurrencySelector } from './ui/CurrencySelector';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addNewContact, updateContact } from '@/supabase/API';
import { toast } from 'sonner';
import useProjects from '@/supabase/hook/useProject';

const initialValue = {
  name: '',
  company: '',
  email: '',
  type: '',
  connection: '',
  find: '',
  budget: 0,
  project: '',
  status: '',
  phone: '',
  surname: '',
  address: '',
  currency: {},
};

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
  projects: any[];
}

export function ContactFormModal({ open, onOpenChange, contact, setSelected }: ContactFormModalProps) {
  const [formValues, setFormValues] = React.useState(contact ? contact : initialValue);
  const [isClient, setIsClient] = React.useState(contact?.type === 'Client' ? true : false);
  const queryClient = useQueryClient();

  // Update form values when contact prop changes
  React.useEffect(() => {
    if (contact) {
      setFormValues(contact);
      setIsClient(contact.type === 'Client');
    } else {
      setFormValues(initialValue);
      setIsClient(false);
    }
  }, [contact]);

  const { data: projects, isLoading: projectsLoading, error: projectsError, refetch } = useProjects();

  const mutation = useMutation({
    mutationFn: contact ? updateContact : addNewContact,
    onSuccess: () => {
      queryClient.refetchQueries(['contacts']);
      toast(contact ? 'Contact updated successfully!' : 'Contact created successfully!');
      handleClose(false);
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'type') {
      setIsClient(value === 'Client');
    }
  };

  // New handler for currency changes
  const handleCurrencyChange = (currencyData: { currency: any }) => {
    setFormValues(prev => ({
      ...prev,
      currency: currencyData.currency,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formValues);
  };

  const handleClose = e => {
    onOpenChange(e);
    setFormValues(contact ? contact : initialValue);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          <DialogDescription>
            {contact ? 'Update the contact information below.' : 'Fill in the details to create a new contact.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Contact Type</Label>
            <Select onValueChange={value => handleSelectChange('type', value)} value={formValues.type || ''}>
              <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[999]">
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Supplier">Supplier</SelectItem>
                <SelectItem value="Contractor">Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">
              Company {(isClient || contact?.type === 'Client') && <span className="text-xs text-gray-500">(optional)</span>}
            </Label>
            <Input
              onChange={handleInputChange}
              value={formValues.company}
              className="bg-white rounded-lg"
              id="company"
              name="company"
              placeholder="Company Name"
              required={isClient || contact?.type === 'Client' ? false : true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.name}
                className="bg-white rounded-lg"
                id="name"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.surname}
                className="bg-white rounded-lg"
                id="surname"
                name="surname"
                placeholder="Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.email}
                className="bg-white rounded-lg"
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                onChange={handleInputChange}
                value={formValues.phone}
                className="bg-white rounded-lg"
                id="phone"
                name="phone"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          {(isClient || contact?.type === 'Client') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connection">Connection</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.connection}
                  className="bg-white rounded-lg"
                  id="connection"
                  name="connection"
                  placeholder="Very strong with john doe.."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="find">How did they find us</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.find}
                  className="bg-white rounded-lg"
                  id="find"
                  name="find"
                  placeholder="e.g. Via Linkedin"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {(isClient || contact?.type === 'Client') && (
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  onChange={handleInputChange}
                  value={formValues.budget}
                  className="bg-white rounded-lg"
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="e.g. 20000"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={value => handleSelectChange('status', value)} value={formValues.status || ''}>
                <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(isClient || contact?.type === 'Client') && (
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select onValueChange={value => handleSelectChange('project', value)} value={formValues.project || ''}>
                <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {projects.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formValues.type === 'Supplier' && (
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <CurrencySelector value={formValues.currency} onChange={handleCurrencyChange} data={formValues} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              onChange={handleInputChange}
              value={formValues.address}
              className="bg-white rounded-lg"
              id="address"
              name="address"
              placeholder="e.g. Street 53060 N Carolina 12"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button className="bg-white min-w-[150px] rounded-[10px]" type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="min-w-[150px] rounded-[10px]" type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Processing...' : contact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
