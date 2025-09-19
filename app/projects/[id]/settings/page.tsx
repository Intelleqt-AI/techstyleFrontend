'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InviteOnboardDialog } from '@/components/project-settings/invite-onboard-dialog';
import { OnboardingWizard } from '@/components/project-settings/onboarding-wizard';
import { computeMissingFields, computeProgressPct } from '@/components/project-settings/utils';
import type { OnboardingData } from '@/components/project-settings/types';
import {
  Settings,
  Building2,
  ClipboardList,
  Truck,
  SlidersHorizontal,
  Users,
  Sparkles,
  Calendar as CalendarIcon2,
  DollarSign,
  Building,
  Store,
  Home,
  Globe,
  Clock,
  Plus,
  Search,
  Check,
  CalendarIcon,
  Trash,
  Save,
} from 'lucide-react';
import useProjects from '@/supabase/hook/useProject';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteProject, deleteTasksByProject, getUsers, modifyProject } from '@/supabase/API';
import { toast } from 'sonner';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { TypeChip } from '@/components/chip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Circle, CircleFilled, Ellipsis, Spinner } from '@/components/Delete Animation/DeletionAnimations';

function Labeled({
  icon,
  label,
  children,
  alignTop = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div className="flex flex-col space-y-2 text-sm font-medium text-ink">
      <div className={cn('flex items-center gap-2', alignTop && 'self-start pt-1')}>
        <span className="">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function toDateFromYMD(ymd: string) {
  const [y, m, d] = ymd?.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

type SectionKey =
  | 'overview'
  | 'contacts'
  | 'property'
  | 'rooms'
  | 'delivery'
  | 'preferences'
  | 'team'
  | 'phases'
  | 'contractors'
  | 'automation'
  | 'financial'
  | 'timeline';

const sections: { key: SectionKey; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: Settings },
  { key: 'contacts', label: 'Contacts & Access', icon: Users },
  { key: 'property', label: 'Property', icon: Building2 },
  { key: 'rooms', label: 'Rooms', icon: ClipboardList },
  { key: 'delivery', label: 'Delivery & Billing', icon: Truck },
  {
    key: 'preferences',
    label: 'Preferences & Consent',
    icon: SlidersHorizontal,
  },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'phases', label: 'Phases', icon: CalendarIcon2 },
  { key: 'contractors', label: 'Contractors', icon: Building },
  { key: 'timeline', label: 'Timeline', icon: CalendarIcon2 },
  { key: 'financial', label: 'Financial', icon: DollarSign },
  { key: 'automation', label: 'Automation', icon: Sparkles },
];

function initialsOf(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length > 1) {
    // Take first char of first and last word
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  // Only one word -> take first 2 letters
  return name.substring(0, 2).toUpperCase();
}

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id ?? 'project-1';
  const [selected, setSelected] = useState<SectionKey>('overview');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);
  const { isOpen, item, openDialog, closeDialog } = useDeleteDialog();
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    contacts: { additional: [] },
    property: {},
    rooms: [],
    deliveryBilling: {},
    preferencesConsent: {},
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const { data: project, isLoading: projectLoading, refetch: projectRefetch } = useProjects();
  const queryClient = useQueryClient();

  // Delete task from project
  const { mutate: deleleProjectTask, error: deleteError } = useMutation({
    mutationFn: deleteTasksByProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['task']);
    },
  });

  // Delete Projects
  const { mutate: removeProject } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      projectRefetch();
    },
  });

  // Get Users
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: modifyProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project Updated');
    },
    onError: error => {
      console.log(error);
      toast.error('Error! Try again');
    },
  });

  useEffect(() => {
    if (projectLoading) return;
    setSelectedProject(project?.find(data => data.id == params?.id));
  }, [project, projectLoading, params?.id]);

  const missing = useMemo(() => computeMissingFields(onboardingData), [onboardingData]);
  const progressPct = useMemo(() => computeProgressPct(missing), [missing]);

  async function handleSave(section: SectionKey, payload: unknown) {
    mutation.mutate(selectedProject);
  }

  const handleArchive = id => {
    mutation.mutate({ ...selectedProject, isArchive: true });
    toast.success('Moved to Archive');
  };

  const handleUnArchive = id => {
    mutation.mutate({ ...selectedProject, isArchive: false });
    toast.success('Moved to Active');
  };

  const handleDelete = id => {
    router.push('/projects');
    setTimeout(() => {
      let secondsLeft = 5;
      let timer, updateInterval;
      const createToastContent = seconds => (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <CircleFilled />
            <div>
              <div className="font-sm">Deleting project...</div>
              <div className="text-xs opacity-70">{seconds}s remaining</div>
            </div>
          </div>
          {/* Undo button inside content */}
          <button
            onClick={() => {
              clearTimeout(timer);
              clearInterval(updateInterval);
              toast.dismiss(t);
              toast.success('Deletion cancelled');
            }}
            className="px-3 py-1 text-sm bg-black text-white rounded  transition-colors ml-4"
          >
            Cancel
          </button>
        </div>
      );

      const t = toast.warning(createToastContent(secondsLeft), {
        duration: Infinity,
      });

      // Update toast content every second
      updateInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
          toast.warning(createToastContent(secondsLeft), {
            id: t,
            duration: Infinity,
          });
        }
      }, 1000);

      timer = setTimeout(() => {
        removeProject(id);
        deleleProjectTask({ projectId: id });
        clearInterval(updateInterval);
        toast.dismiss(t);
        toast.success('Project deleted');
      }, 5000);
    }, 1000);
  };

  return (
    <main className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with CTA and onboarding progress */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Project Settings</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={missing.length === 0 ? 'default' : 'secondary'}>
                {missing.length === 0 ? 'Onboarding complete' : `${missing.length} fields remaining`}
              </Badge>
              <div className="w-40">
                <Progress value={progressPct} />
              </div>
            </div>
          </div>
          <InviteOnboardDialog projectId={projectId} onStartWizard={() => setWizardOpen(true)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sticky Sections nav */}
          <aside className="lg:col-span-3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="grid gap-1">
                  {sections.map(s => {
                    const Icon = s.icon;
                    const active = selected === s.key;
                    return (
                      <Button
                        key={s.key}
                        variant={s?.key == 'delete' ? 'destructive' : active ? 'secondary' : 'ghost'}
                        className={`justify-start ${
                          s?.key == 'delete' ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' : active ? 'bg-neutral-100' : ''
                        }`}
                        onClick={() => setSelected(s.key)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {s.label}
                      </Button>
                    );
                  })}
                  <Button
                    className="justify-start bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    onClick={() => setOpenArchive(true)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    {selectedProject?.isArchive ? 'Unarchive' : 'Archive'}
                  </Button>

                  <Button
                    variant={'destructive'}
                    className={`justify-start bg-red-50 text-red-700 hover:bg-red-100 border-red-200`}
                    onClick={() => openDialog(selectedProject?.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Section form */}
          <section className="lg:col-span-9">
            {selected === 'overview' && (
              <OverviewForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('overview', p)}
              />
            )}
            {selected === 'contacts' && (
              <ContactsForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('contacts', p)}
              />
            )}
            {selected === 'property' && (
              <PropertyForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('property', p)}
              />
            )}
            {selected === 'rooms' && (
              <RoomsForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('type', p)}
              />
            )}
            {selected === 'delivery' && (
              <DeliveryForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('delivery', p)}
              />
            )}
            {selected === 'preferences' && (
              <PreferencesForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('preferences', p)}
              />
            )}
            {selected === 'team' && (
              <TeamForm
                value={selectedProject}
                users={users?.data}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('team', p)}
              />
            )}
            {selected === 'phases' && (
              <PhasesForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('phases', p)}
              />
            )}
            {selected === 'contractors' && (
              <ContractorsForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('contractors', p)}
              />
            )}
            {selected === 'timeline' && (
              <TimelineForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('timeline', p)}
              />
            )}
            {selected === 'financial' && (
              <FinancialForm
                value={selectedProject}
                onChange={data => setSelectedProject({ ...selectedProject, ...data })}
                onSave={p => handleSave('financial', p)}
              />
            )}
            {selected === 'automation' && <AutomationForm onSave={p => handleSave('automation', p)} />}
          </section>
        </div>
      </div>

      {/* Wizard */}
      <OnboardingWizard
        projectId={projectId}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCompleted={({ missing: m, progressPct: pct }) => {
          // reflect completion in header badges
          // no-op for now; you can hook real data as needed.
        }}
      />

      <DeleteDialog
        isOpen={openArchive}
        onClose={setOpenArchive}
        onConfirm={selectedProject?.isArchive ? handleUnArchive : handleArchive}
        id={selectedProject?.id}
        itemName={selectedProject?.name}
        requireConfirmation={false}
        confirmationText={selectedProject?.name}
        title={selectedProject?.isArchive ? 'Unarchive Project' : 'Archive Project'}
        confirmText={'Confirm'}
        description={`Move  ${selectedProject?.name} to ${selectedProject?.isArchive ? 'Active' : 'Archive'} .`}
        isArchive={true}
      />

      <DeleteDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onConfirm={handleDelete}
        id={selectedProject?.id}
        itemName={selectedProject?.name}
        requireConfirmation={true}
        confirmationText={selectedProject?.name}
        title="Delete Project"
        description={`This will permanently delete "${selectedProject?.name}" along with all its tasks and related data. This action cannot be undone.`}
      />
    </main>
  );
}

/* Forms — lightweight, aligned to global UI */

function OverviewForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Project title</Label>
          <Input
            id="title"
            className="mt-1"
            placeholder="Chelsea Penthouse"
            value={value?.name}
            onChange={e => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="code">Project code</Label>
          <Input id="code" className="mt-1" placeholder="LUX-001" value={value?.code} onChange={e => onChange({ code: e.target.value })} />
          <p className="text-xs text-ink-muted mt-1">Used in file names and POs.</p>
        </div>
        <div>
          <Label htmlFor="type">Project type</Label>
          <Select value={value?.projectType} onValueChange={val => onChange({ projectType: val })}>
            <SelectTrigger className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="residential" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Residential
                </div>
              </SelectItem>
              <SelectItem value="commercial" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Commercial
                </div>
              </SelectItem>
              <SelectItem value="hospitality" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Store className="w-4 h-4 mr-2" />
                  Hospitality
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            className="mt-1"
            rows={4}
            placeholder="Short project summary…"
            value={value?.description}
            onChange={e => onChange({ description: e.target.value })}
          />
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactsForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData;
  onChange: (v: OnboardingData) => void;
  onSave: (p: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contacts & Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Primary client</Label>
            <Input
              className="mt-1"
              placeholder="Name"
              value={value?.primaryClient?.name || ''}
              onChange={e =>
                onChange({
                  ...value,
                  primaryClient: {
                    ...value?.primaryClient,
                    name: e.target.value,
                  },
                })
              }
            />
            <Input
              className="mt-2"
              type="email"
              placeholder="Email"
              value={value?.primaryClient?.email ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  primaryClient: {
                    ...value?.primaryClient,
                    email: e.target.value,
                  },
                })
              }
            />
            <Input
              className="mt-2"
              placeholder="Phone"
              value={value?.primaryClient?.phone ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  primaryClient: {
                    ...value?.primaryClient,
                    phone: e.target.value,
                  },
                })
              }
            />
            <div className="mt-3 flex items-center gap-2">
              <Switch
                checked={!!value?.primaryClient?.portalAccess}
                onCheckedChange={v =>
                  onChange({
                    ...value,
                    primaryClient: { ...value?.primaryClient, portalAccess: v },
                  })
                }
              />
              <span className="text-sm">Grant portal access</span>
            </div>
          </div>
          <div>
            <Label>Secondary client</Label>
            <Input
              className="mt-1"
              placeholder="Name"
              value={value?.secondaryClient?.name ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  secondaryClient: {
                    ...value?.secondaryClient,
                    name: e.target.value,
                  },
                })
              }
            />
            <Input
              className="mt-2"
              type="email"
              placeholder="Email"
              value={value?.secondaryClient?.email ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  secondaryClient: {
                    ...value?.secondaryClient,
                    email: e.target.value,
                  },
                })
              }
            />
            <Input
              className="mt-2"
              placeholder="Role (Client, Accountant, Site Contact)"
              value={value?.secondaryClient?.role ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  secondaryClient: {
                    ...value?.secondaryClient,
                    role: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PropertyForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData;
  onChange: (v: OnboardingData) => void;
  onSave: (p: any) => void;
}) {
  type NominatimPlace = {
    display_name: string;
    lat: string;
    lon: string;
  };

  const [addressQuery, setAddressQuery] = useState<string>(value?.property?.siteAddress ?? '');
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimPlace[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAddressQuery(value?.property?.siteAddress ?? '');
  }, [value?.property?.siteAddress]);

  useEffect(() => {
    if (!addressQuery || addressQuery.trim().length < 2) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setAddressLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(
          addressQuery.trim()
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json', 'Accept-Language': 'en' },
        });
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const data: NominatimPlace[] = await res.json();
        setAddressSuggestions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setAddressSuggestions([]);
        }
      } finally {
        setAddressLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [addressQuery]);

  const shouldOpenAddressPopover = addressQuery.trim().length >= 2 && (addressLoading || addressSuggestions.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Site address</Label>
          <div className="relative">
            <Input
              className="mt-1"
              placeholder="Search address…"
              value={addressQuery}
              onChange={e => {
                const next = e.target.value;
                setAddressQuery(next);
                onChange({
                  ...value,
                  property: { ...value.property, siteAddress: next },
                });
                setOpen(true);
              }}
            />
            {shouldOpenAddressPopover && open && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                <Command>
                  <CommandList>
                    {addressLoading ? (
                      <div className="py-3 text-sm text-muted-foreground text-center">Searching…</div>
                    ) : addressSuggestions.length === 0 ? (
                      <div className="py-3 text-sm text-muted-foreground text-center">No addresses found</div>
                    ) : (
                      <CommandGroup>
                        {addressSuggestions.map(place => (
                          <CommandItem
                            key={`${place.lat}-${place.lon}-${place.display_name}`}
                            value={place.display_name}
                            onSelect={() => {
                              setAddressQuery(place.display_name);
                              onChange({
                                ...value,
                                property: {
                                  ...value.property,
                                  siteAddress: place.display_name,
                                },
                              });
                              setOpen(false);
                              setAddressSuggestions([]);
                            }}
                          >
                            {place.display_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Access & parking notes</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={value?.property?.accessNotes ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  property: { ...value.property, accessNotes: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Building restrictions</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={value?.property?.restrictions ?? ''}
              onChange={e =>
                onChange({
                  ...value,
                  property: { ...value.property, restrictions: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomsForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData;
  onChange: (v: OnboardingData) => void;
  onSave: (p: any) => void;
}) {
  const handleRemove = (idx: number) => {
    const next = [...(value.type ?? [])];
    next.splice(idx, 1);
    onChange({ ...value, type: next });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rooms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new room */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            placeholder="Room name"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const input = e.currentTarget as HTMLInputElement;
                if (input.value.trim()) {
                  const type = [
                    ...(value.type ?? []),
                    {
                      text: input.value.trim(),
                      id: crypto.randomUUID(),
                      product: [],
                    },
                  ];
                  onChange({ ...value, type });
                  input.value = '';
                }
              }
            }}
          />
          <div className="md:col-span-2 text-sm text-muted-foreground flex items-center">Press Enter to add room</div>
        </div>

        {/* Room list */}
        <div className="space-y-2">
          {(value.type ?? []).map((room, idx) => (
            <div key={room.id ?? idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              <Input
                value={room.text}
                onChange={e => {
                  const next = [...(value.type ?? [])];
                  next[idx] = { ...next[idx], text: e.target.value };
                  onChange({ ...value, type: next });
                }}
              />
              <Input
                placeholder="Dimensions"
                value={room.dimensions ?? ''}
                onChange={e => {
                  const next = [...(value.type ?? [])];
                  next[idx] = { ...next[idx], dimensions: e.target.value };
                  onChange({ ...value, type: next });
                }}
              />
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Delivery constraints"
                  value={room.constraints ?? ''}
                  onChange={e => {
                    const next = [...(value.type ?? [])];
                    next[idx] = { ...next[idx], constraints: e.target.value };
                    onChange({ ...value, type: next });
                  }}
                />

                <Button
                  variant={'destructive'}
                  className={`justify-start bg-red-50 text-red-700 hover:bg-red-100 border-red-200`}
                  onClick={() => handleRemove(idx)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value.type)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DeliveryForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData;
  onChange: (v: OnboardingData) => void;
  onSave: (p: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delivery & Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Billing address</Label>
          <Input
            className="mt-1"
            value={value?.billingAddress ?? ''}
            onChange={e => onChange({ ...value, billingAddress: e.target.value })}
          />
        </div>
        <div>
          <Label>Delivery address</Label>
          <Input
            className="mt-1"
            value={value?.deliveryAddress ?? ''}
            onChange={e => onChange({ ...value, deliveryAddress: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>On‑site contact</Label>
            <Input
              className="mt-1"
              value={value?.onSiteContact ?? ''}
              onChange={e => onChange({ ...value, onSiteContact: e.target.value })}
            />
          </div>
          <div>
            <Label>Delivery windows</Label>
            <Input
              className="mt-1"
              placeholder="e.g., Mon‑Fri 9–5"
              value={value?.deliveryWindows ?? ''}
              onChange={e => onChange({ ...value, deliveryWindows: e.target.value })}
            />
          </div>
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PreferencesForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData;
  onChange: (v: OnboardingData) => void;
  onSave: (p: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferences & Consent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Style tags</Label>
          <Input
            className="mt-1"
            placeholder="modern, warm minimalism"
            value={value?.preferences?.styleTags ?? ''}
            onChange={e =>
              onChange({
                ...value,
                preferences: {
                  ...value?.preferences,
                  styleTags: e.target.value,
                },
              })
            }
          />
        </div>
        <div>
          <Label>Preferred vendors</Label>
          <Input
            className="mt-1"
            placeholder="Vendor A, Vendor B"
            value={value?.preferences?.preferredVendors ?? ' '}
            onChange={e =>
              onChange({
                ...value,
                preferences: {
                  ...value?.preferences,
                  preferredVendors: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={!!value?.preferences?.consents}
              onCheckedChange={v =>
                onChange({
                  ...value,
                  preferences: { ...value?.preferences, consents: v },
                })
              }
            />
            <span className="text-sm">Marketing opt‑in</span>
          </div>
          {/* <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.preferencesConsent.consents?.terms}
                onChange={e =>
                  onChange({
                    ...value,
                    preferencesConsent: {
                      ...value.preferencesConsent,
                      consents: { ...value.preferencesConsent.consents, terms: e.target.checked },
                    },
                  })
                }
              />
              <span>
                {'Agree to '}
                <a href="#" className="underline">
                  Terms
                </a>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                // checked={!!value.preferencesConsent.consents?.privacy}
                onChange={e =>
                  onChange({
                    ...value,
                    preferencesConsent: {
                      ...value.preferencesConsent,
                      consents: { ...value.preferencesConsent.consents, privacy: e.target.checked },
                    },
                  })
                }
              />
              <span>
                {'Agree to '}
                <a href="#" className="underline">
                  Privacy
                </a>
              </span>
            </label>
          </div> */}
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  // Format date for display in input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format for input
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              className="mt-1"
              value={formatDateForInput(value?.startDate)}
              onChange={e => onChange({ startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              className="mt-1"
              value={formatDateForInput(value?.endDate)}
              onChange={e => onChange({ endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={value?.timezone} onValueChange={val => onChange({ timezone: val })}>
            <SelectTrigger id="timezone" className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="Europe/London" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  London (GMT)
                </div>
              </SelectItem>
              <SelectItem value="America/New_York" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  New York (EST)
                </div>
              </SelectItem>
              <SelectItem value="Europe/Paris" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Paris (CET)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const updateData = updates => {
    onChange({
      ...value,
      currency: updates.currency,
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Financial</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              className="mt-1"
              placeholder="850000"
              value={value?.budget}
              onChange={e => onChange({ budget: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="taxRate">Tax/VAT rate (%)</Label>
            <Input
              id="taxRate"
              className="mt-1"
              placeholder="20"
              value={value?.taxRate}
              onChange={e => onChange({ taxRate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          {/* <Select value={value.currency} onValueChange={val => onChange({ currency: val })}>
            <SelectTrigger id="currency" className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="GBP" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  GBP (£)
                </div>
              </SelectItem>
              <SelectItem value="USD" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  USD ($)
                </div>
              </SelectItem>
              <SelectItem value="EUR" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  EUR (€)
                </div>
              </SelectItem>
            </SelectContent>
          </Select> */}
          <CurrencySelector value={value?.currency} onChange={updateData} />
        </div>

        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AutomationForm({ onSave }: { onSave: (p: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Automation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium">Kickoff Pack</div>
            <p className="text-sm text-muted-foreground mt-1">{'Auto‑generate tasks when onboarding completes.'}</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium">Notifications</div>
            <p className="text-sm text-muted-foreground mt-1">{'Notify team when clients join the portal.'}</p>
          </div>
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave({})}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamForm({ value, onChange, onSave, users }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const [openPop, setOpenPop] = React.useState(false);
  const selected = value?.assigned || [];
  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: '',
      role: '',
      avatar: '',
    };
    onChange({ assigned: [...(value.assigned || []), newMember] });
  };

  const updateTeamMember = (index: number, updates: any) => {
    const updatedTeam = [...(value.assigned || [])];
    updatedTeam[index] = { ...updatedTeam[index], ...updates };
    onChange({ assigned: updatedTeam });
  };

  const removeTeamMember = (index: number) => {
    const updatedTeam = [...(value.assigned || [])];
    updatedTeam.splice(index, 1);
    onChange({ assigned: updatedTeam });
  };

  function toggleAssignee(member: any) {
    const alreadyAssigned = value.assigned.some((a: any) => a.id === member.id);

    const updatedValue = {
      ...value,
      assigned: alreadyAssigned
        ? value.assigned.filter((a: any) => a.id !== member.id) // remove
        : [...value.assigned, member], // add
    };

    onChange(updatedValue);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Team Members</CardTitle>
          <Button onClick={addTeamMember} size="sm" className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(value?.assigned || []).map((member: any, index: number) => (
            <div key={member.id || index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-clay-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-clay-600">
                  {member.name
                    ? member.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'TM'}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  readOnly
                  placeholder="Full name"
                  value={member.name}
                  onChange={e => updateTeamMember(index, { name: e.target.value })}
                />
                <Input
                  placeholder="Role (e.g., Lead Designer)"
                  value={member.role}
                  onChange={e => updateTeamMember(index, { role: e.target.value })}
                />
              </div>

              <Button
                variant={'destructive'}
                className={`justify-start bg-red-50 text-red-700 hover:bg-red-100 border-red-200`}
                onClick={() => toggleAssignee(member)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {(!value?.assigned || value?.assigned.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">No team members assigned yet. Click "Add Member" to get started.</div>
          )}
        </div>

        {/* Add Member option */}
        <div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Popover open={openPop} onOpenChange={setOpenPop}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPop}
                    className="w-full justify-between bg-white h-9 text-sm rounded-xl"
                  >
                    <span className="flex items-center gap-2 overflow-hidden">
                      <span className="flex items-center gap-2 text-gray-500">
                        <Search className="h-4 w-4" />
                        Search teammates…
                      </span>
                      {/* {selected?.length > 0 ? (
                        <>
                          <div className="flex -space-x-2">
                            {selected.slice(0, 4).map(m => (
                              <Avatar key={m.id} className="h-6 w-6 ring-2 ring-white">
                                <AvatarImage src={(m as any).avatarUrl || ''} alt={m.name} />
                                <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="truncate text-sm text-gray-600">
                            {selected.length} selected{selected.length > 4 ? ' +' + (selected.length - 4) : ''}
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center gap-2 text-gray-500">
                          <Search className="h-4 w-4" />
                          Search teammates…
                        </span>
                      )} */}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search teammates…"
                      className=" focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
                    />
                    <CommandEmpty>No people found.</CommandEmpty>
                    <CommandList className="max-h-64">
                      <CommandGroup>
                        {users?.map(m => {
                          const checked = value?.assigned?.some(a => a.id === m.id);
                          return (
                            <CommandItem key={m.id} value={m.name} className="flex items-center gap-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleAssignee(m)}
                                className="focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                              />
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={m.avatarUrl || ''} alt={m.name} />
                                <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate">{m.name}</span>
                              {value?.assigned?.some(a => a.id === m.id) && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* {selected?.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange({
                      ...value,
                      assigned: [],
                    })
                  }
                >
                  Clear
                </Button>
              )} */}
            </div>

            {/* {value?.assigned?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value?.assigned?.map(m => (
                  <span onClick={() => toggleAssignee(m)}>
                    <TypeChip key={m.id} label={m.name} className="cursor-pointer" />
                  </span>
                ))}
              </div>
            )} */}
          </div>
        </div>

        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PhasesForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const addPhase = () => {
    const newPhase = {
      name: '',
      duration: '',
      description: '',
    };
    onChange({ phases: [...(value.phases || []), newPhase] });
  };

  const updatePhase = (index: number, updates: any) => {
    const updatedPhases = [...(value.phases || [])];
    updatedPhases[index] = { ...updatedPhases[index], ...updates };
    onChange({ phases: updatedPhases });
  };

  const removePhase = (index: number) => {
    const updatedPhases = [...(value.phases || [])];
    updatedPhases.splice(index, 1);
    onChange({ phases: updatedPhases });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Project Phases</CardTitle>
          <Button onClick={addPhase} size="sm" className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Phase
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {(value.phases || []).map((phase: any, index: number) => (
            <Card key={index} className="border-borderSoft bg-greige-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-white text-ink-muted border-borderSoft">
                      Phase {index + 1}
                    </Badge>
                    <Button
                      variant={'destructive'}
                      className={`justify-start bg-red-50 text-red-700 hover:bg-red-100 border-red-200`}
                      onClick={() => removePhase(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Phase Name</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g., Discovery & Planning"
                        value={phase.name}
                        onChange={e => updatePhase(index, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Duration</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g., 2 weeks"
                        value={phase.duration}
                        onChange={e => updatePhase(index, { duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      className="mt-1"
                      placeholder="Brief description of this phase..."
                      value={phase.description}
                      onChange={e => updatePhase(index, { description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Labeled label={`Phase ${index + 1} Start Date`}>
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                                !phase?.startDate && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-sm font-medium text-ink" />
                              {phase?.startDate ? format(toDateFromYMD(phase?.startDate), 'PPP') : 'Pick start date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                            <Calendar
                              mode="single"
                              selected={phase?.startDate ? toDateFromYMD(phase?.startDate) : undefined}
                              onSelect={d => {
                                // const updatedPhases = [...data.phases];
                                // updatedPhases[index] = {
                                //   ...phase,
                                //   startDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                                // };
                                // updateData({ phases: updatedPhases });
                                updatePhase(index, {
                                  startDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                                });
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {/* {data?.startDate && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => updateData({ startDate: undefined })}>
                                          X
                                        </Button>
                                      )} */}
                      </div>
                    </Labeled>{' '}
                    <Labeled label={`Phase ${index + 1} End Date`}>
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                                !phase?.endDate && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-sm font-medium text-ink" />
                              {phase?.endDate ? format(toDateFromYMD(phase?.endDate), 'PPP') : 'Pick start date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                            <Calendar
                              mode="single"
                              selected={phase?.endDate ? toDateFromYMD(phase?.endDate) : undefined}
                              onSelect={d => {
                                // const updatedPhases = [...data.phases];
                                // updatedPhases[index] = {
                                //   ...phase,
                                //   endDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                                // };
                                // updateData({ phases: updatedPhases });
                                updatePhase(index, {
                                  endDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                                });
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {/* {data?.startDate && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => updateData({ startDate: undefined })}>
                                          X
                                        </Button>
                                      )} */}
                      </div>
                    </Labeled>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!value.phases || value.phases.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No phases defined yet. Click "Add Phase" to create your project timeline.
            </div>
          )}
        </div>
        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value.phases)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractorsForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const addContractor = () => {
    const newContractor = {
      id: Date.now().toString(),
      name: '',
      trade: '',
      contact: '',
      email: '',
      phone: '',
      portalAccess: false,
    };
    onChange({ contractors: [...(value.contractors || []), newContractor] });
  };

  const updateContractor = (index: number, updates: any) => {
    const updatedContractors = [...(value.contractors || [])];
    updatedContractors[index] = { ...updatedContractors[index], ...updates };
    onChange({ contractors: updatedContractors });
  };

  const removeContractor = (index: number) => {
    const updatedContractors = [...(value.contractors || [])];
    updatedContractors.splice(index, 1);
    onChange({ contractors: updatedContractors });
  };

  const inviteToPortal = (contractor: any) => {
    // This would trigger the contractor portal invitation
    console.log(`Inviting ${contractor.name} to contractor portal`);
    // Update portal access status
    const index = value.contractors.findIndex((c: any) => c.id === contractor.id);
    if (index !== -1) {
      updateContractor(index, { portalAccess: true });
    }
  };

  const commonTrades = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Flooring',
    'HVAC',
    'Roofing',
    'Masonry',
    'Glazing',
    'Landscaping',
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Contractors</CardTitle>
          <Button onClick={addContractor} size="sm" className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Contractor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {value?.contractors?.length > 0 &&
            (value?.contractors || [])?.map((contractor: any, index: number) => (
              <Card key={contractor.id || index} className="border-borderSoft bg-greige-50">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-clay-100 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-clay-600" />
                        </div>
                        <div>
                          <div className="font-medium">{contractor.name || 'New Contractor'}</div>
                          <div className="text-sm text-muted-foreground">{contractor.trade}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contractor.portalAccess ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            Portal Access
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => inviteToPortal(contractor)} className="bg-clay-600 text-white hover:bg-clay-700">
                            Invite to Portal
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContractor(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Company Name</Label>
                        <Input
                          className="mt-1"
                          placeholder="e.g., ABC Plumbing Ltd"
                          value={contractor.name}
                          onChange={e => updateContractor(index, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Trade</Label>
                        <Select value={contractor.trade} onValueChange={val => updateContractor(index, { trade: val })}>
                          <SelectTrigger className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft">
                            <SelectValue placeholder="Select trade" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-borderSoft">
                            {commonTrades.map(trade => (
                              <SelectItem key={trade} value={trade} className="focus:bg-greige-50 focus:text-ink">
                                {trade}
                              </SelectItem>
                            ))}
                            <SelectItem value="Other" className="focus:bg-greige-50 focus:text-ink">
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Contact Person</Label>
                        <Input
                          className="mt-1"
                          placeholder="Primary contact name"
                          value={contractor.contact}
                          onChange={e =>
                            updateContractor(index, {
                              contact: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Email</Label>
                        <Input
                          className="mt-1"
                          type="email"
                          placeholder="contact@company.com"
                          value={contractor.email}
                          onChange={e => updateContractor(index, { email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Phone</Label>
                        <Input
                          className="mt-1"
                          placeholder="+44 20 1234 5678"
                          value={contractor.phone}
                          onChange={e => updateContractor(index, { phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-borderSoft">
                      <Switch
                        checked={contractor.portalAccess}
                        onCheckedChange={checked => updateContractor(index, { portalAccess: checked })}
                      />
                      <span className="text-sm">Grant contractor portal access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          {(!value.contractors || value.contractors.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No contractors assigned yet. Click "Add Contractor" to get started.
            </div>
          )}
        </div>

        <div className="flex pt-3 items-center justify-end">
          <Button size={'sm'} onClick={() => onSave(value)}>
            <Save />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
