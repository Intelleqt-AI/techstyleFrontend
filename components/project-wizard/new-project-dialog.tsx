'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Building2, CalendarIcon, ChevronDown, ChevronRight, Clock, DollarSign, Home, Plus, Store, Users, X } from 'lucide-react';
// import { toast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addNewProject, getUsers, modifyProject } from '@/supabase/API';
import { CurrencySelector } from '../ui/CurrencySelector';
import useClient from '@/hooks/useClient';
import { toast } from 'sonner';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectData {
  name: string;
  projectType: any;
  client: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  currency: [];
  paymentSchedule: string;
  phases: Array<{
    name: string;
    duration: string;
    description: string;
  }>;
}

const projectTypes = [
  {
    id: 'residential',
    name: 'Residential',
    icon: Home,
    description: 'Homes, apartments, and living spaces',
  },
  {
    id: 'commercial',
    name: 'Commercial',
    icon: Building2,
    description: 'Offices, retail, and business spaces',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    icon: Store,
    description: 'Hotels, restaurants, and entertainment',
  },
];

const defaultPhases = {
  residential: [
    {
      name: 'Discovery & Planning',
      duration: '2 weeks',
      description: 'Initial consultation and space assessment',
    },
    {
      name: 'Design Development',
      duration: '4 weeks',
      description: 'Concept creation and design refinement',
    },
    {
      name: 'Documentation',
      duration: '3 weeks',
      description: 'Technical drawings and specifications',
    },
    {
      name: 'Implementation',
      duration: '8 weeks',
      description: 'Procurement and installation',
    },
  ],
  commercial: [
    {
      name: 'Strategic Planning',
      duration: '3 weeks',
      description: 'Business requirements and space analysis',
    },
    {
      name: 'Design Development',
      duration: '5 weeks',
      description: 'Concept design and stakeholder approval',
    },
    {
      name: 'Documentation',
      duration: '4 weeks',
      description: 'Construction documents and permits',
    },
    {
      name: 'Implementation',
      duration: '12 weeks',
      description: 'Construction and fit-out',
    },
  ],
  hospitality: [
    {
      name: 'Brand & Concept',
      duration: '4 weeks',
      description: 'Brand alignment and experience design',
    },
    {
      name: 'Design Development',
      duration: '6 weeks',
      description: 'Detailed design and prototyping',
    },
    {
      name: 'Documentation',
      duration: '4 weeks',
      description: 'FF&E specifications and drawings',
    },
    {
      name: 'Implementation',
      duration: '16 weeks',
      description: 'Procurement and installation',
    },
  ],
};

const paymentSchedules = [
  {
    id: '50-50',
    name: '50/50 Split',
    description: '50% upfront, 50% on completion',
  },
  {
    id: 'thirds',
    name: 'Three Payments',
    description: '33% upfront, 33% midway, 34% completion',
  },
  {
    id: 'phases',
    name: 'Per Phase',
    description: 'Payment aligned with project phases',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Equal monthly payments over project duration',
  },
];

function toDateFromYMD(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Label rail (160px) with small icon + label
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

const initialProject: ProjectData = {
  name: '',
  projectType: '',
  client: '',
  location: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: '',
  currency: [],
  paymentSchedule: '',
  phases: [],
};

export function NewProjectDialog({ open, onOpenChange, task }: NewProjectDialogProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialProject);
  const [expandedSections, setExpandedSections] = useState({
    phases: false,
    budget: false,
  });
  const [teamMembers, setTeamMembers] = useState([]);

  const queryClient = useQueryClient();

  // Set default phases when project type changes
  useEffect(() => {
    if (data.projectType && defaultPhases[data.projectType as keyof typeof defaultPhases]) {
      setData(prev => ({
        ...prev,
        phases: defaultPhases[data.projectType as keyof typeof defaultPhases],
      }));
    }
  }, [data.projectType]);

  const updateData = (updates: Partial<ProjectData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClose = () => {
    setStep(1);
    setData(initialProject);
    setExpandedSections({ phases: false, budget: false });
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Get Users
  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Set users from DB
  useEffect(() => {
    if (isLoading) return;
    setTeamMembers(users?.data);
  }, [isLoading, users]);

  // Get clients
  const { data: clientData, isLoading: loadingClient, refetch: refetchClient } = useClient();

  //   const handleMemberSelect = member => {
  //   setSelectedMembers([...selectedMembers, member]);
  //   setTeamMembers(teamMembers.filter(m => m.email !== member.email));
  //   setTaskValues(prev => ({
  //     ...prev,
  //     assigned: prev.assigned ? [...prev.assigned, member] : [member],
  //   }));
  //   setIsOpen(false);
  // };

  // Define the mutation
  const mutation = useMutation({
    mutationFn: task ? modifyProject : addNewProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast('Project Updated');
      setData(initialProject);
      handleClose(); // Reset form values
    },
    onError: error => {
      console.log(error);
      toast('Error! Try again');
    },
  });

  const handleCreate = async () => {
    // Simulate project creation
    toast({
      title: 'Project Created',
      description: `${data.name} has been created successfully.`,
    });
    const finalData = { ...data, budget: +data?.budget };
    // console.log(finalData);
    // handleClose()
    mutation.mutate(finalData);
  };

  // useEffect(() => {
  //   console.log(clientData.data);
  // }, [clientData]);

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.name && data.projectType && data.client;
      case 2:
        return data.startDate && data.endDate;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-ink">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Chelsea Penthouse Renovation"
                  value={data.name}
                  onChange={e => updateData({ name: e.target.value })}
                  className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-ink">
                  Project Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {projectTypes.map(type => {
                    const IconComponent = type.icon;
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-colors ${
                          data.projectType === type.id ? 'border-clay-600 bg-clay-50' : 'border-borderSoft bg-white hover:bg-greige-50'
                        }`}
                        onClick={() => updateData({ projectType: type.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-ink-muted" />
                            </div>
                            <div>
                              <h4 className="font-medium text-ink">{type.name}</h4>
                              <p className="text-sm text-ink-muted">{type.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-sm font-medium text-ink">
                    Client <span className="text-red-500">*</span>
                  </Label>
                  <Select value={data.client} onValueChange={value => updateData({ client: value })}>
                    <SelectTrigger className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300">
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-borderSoft">
                      {clientData?.data &&
                        clientData?.data.map(client => {
                          return (
                            <SelectItem value={client?.id} className="focus:bg-greige-50 focus:text-ink" key={client?.id}>
                              {client?.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-ink">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., London, UK"
                    value={data.location}
                    onChange={e => updateData({ location: e.target.value })}
                    className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-ink">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project scope and objectives..."
                  value={data.description}
                  onChange={e => updateData({ description: e.target.value })}
                  className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Labeled label="Start Date">
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                            !data?.startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-sm font-medium text-ink" />
                          {data?.startDate ? format(toDateFromYMD(data?.startDate), 'PPP') : 'Pick start date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                        <Calendar
                          mode="single"
                          selected={data?.startDate ? toDateFromYMD(data?.startDate) : undefined}
                          onSelect={d => {
                            updateData({
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
                </Labeled>
              </div>

              <div className="space-y-2">
                <Labeled label="Target End Date">
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                            !data?.endDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-sm font-medium text-ink" />
                          {data?.endDate ? format(toDateFromYMD(data?.endDate), 'PPP') : 'Pick Target End date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                        <Calendar
                          mode="single"
                          selected={data?.endDate ? toDateFromYMD(data?.endDate) : undefined}
                          onSelect={d =>
                            updateData({
                              endDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* {data?.startDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStartDate(undefined)}>
                        Clear
                      </Button>
                    )} */}
                  </div>
                </Labeled>
              </div>
            </div>

            {/* Phase Preview */}
            <Collapsible open={expandedSections.phases} onOpenChange={() => toggleSection('phases')}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer border-borderSoft bg-white hover:bg-greige-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-ink-muted" />
                        </div>
                        <div>
                          <h4 className="font-medium text-ink">Project Phases</h4>
                          <p className="text-sm text-ink-muted">{data.phases.length} phases • Click to customize</p>
                        </div>
                      </div>
                      {expandedSections.phases ? (
                        <ChevronDown className="w-5 h-5 text-ink-muted" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-ink-muted" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {data.phases.map((phase, index) => (
                  <Card key={index} className="border-borderSoft bg-white">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-greige-50 text-ink-muted border-borderSoft">
                            Phase {index + 1}
                          </Badge>
                          <span className="text-sm text-ink-muted">{phase.duration}</span>
                        </div>
                        <div>
                          <Input
                            value={phase.name}
                            onChange={e => {
                              const updatedPhases = [...data.phases];
                              updatedPhases[index] = {
                                ...phase,
                                name: e.target.value,
                              };
                              updateData({ phases: updatedPhases });
                            }}
                            className="font-medium bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
                          />
                        </div>
                        <Textarea
                          value={phase.description}
                          onChange={e => {
                            const updatedPhases = [...data.phases];
                            updatedPhases[index] = {
                              ...phase,
                              description: e.target.value,
                            };
                            updateData({ phases: updatedPhases });
                          }}
                          className="text-sm bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Budget Configuration */}
            <Collapsible open={expandedSections.budget} onOpenChange={() => toggleSection('budget')}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer border-borderSoft bg-white hover:bg-greige-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-ink-muted" />
                        </div>
                        <div>
                          <h4 className="font-medium text-ink">Budget & Payment</h4>
                          <p className="text-sm text-ink-muted">
                            {data.budget
                              ? `${data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : '£'}${Number(
                                  data.budget
                                ).toLocaleString()}`
                              : 'Click to configure'}
                          </p>
                        </div>
                      </div>
                      {expandedSections.budget ? (
                        <ChevronDown className="w-5 h-5 text-ink-muted" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-ink-muted" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-medium text-ink">
                      Total Budget
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="0"
                      value={data.budget}
                      onChange={e => updateData({ budget: e.target.value })}
                      className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-medium text-ink">
                      Currency
                    </Label>
                    <CurrencySelector data={data} onChange={updateData} />
                    {/* <Select
                      value={data.currency}
                      onValueChange={(value) =>
                        updateData({ currency: value })
                      }>
                      <SelectTrigger className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-borderSoft">
                        <SelectItem
                          value="GBP"
                          className="focus:bg-greige-50 focus:text-ink">
                          GBP (£)
                        </SelectItem>
                        <SelectItem
                          value="USD"
                          className="focus:bg-greige-50 focus:text-ink">
                          USD ($)
                        </SelectItem>
                        <SelectItem
                          value="EUR"
                          className="focus:bg-greige-50 focus:text-ink">
                          EUR (€)
                        </SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-ink">Payment Schedule</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentSchedules.map(schedule => (
                      <Card
                        key={schedule.id}
                        className={`cursor-pointer transition-colors ${
                          data.paymentSchedule === schedule.id
                            ? 'border-clay-600 bg-clay-50'
                            : 'border-borderSoft bg-white hover:bg-greige-50'
                        }`}
                        onClick={() => updateData({ paymentSchedule: schedule.id })}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-ink text-sm">{schedule.name}</h5>
                              <p className="text-xs text-ink-muted">{schedule.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Team Assignment */}
            <Card className="border-borderSoft bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-ink-muted" />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">Team Assignment</h4>
                    <p className="text-sm text-ink-muted">Assign team members to this project</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-greige-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-clay-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-clay-600">JD</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">John Doe</p>
                        <p className="text-xs text-ink-muted">Lead Designer</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white text-ink-muted border-borderSoft">
                      Project Lead
                    </Badge>
                  </div>

                  <Button variant="outline" className="w-full gap-2 border-borderSoft bg-white hover:bg-greige-50">
                    <Plus className="w-4 h-4" />
                    Add Team Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-borderSoft">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-ink">Create New Project</DialogTitle>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map(stepNumber => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber === step
                    ? 'bg-clay-600 text-white'
                    : stepNumber < step
                    ? 'bg-sage-500 text-white'
                    : 'bg-greige-200 text-ink-muted'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && <div className={`w-16 h-0.5 mx-2 ${stepNumber < step ? 'bg-sage-500' : 'bg-greige-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        <Separator className="bg-borderSoft" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} className="border-borderSoft bg-white hover:bg-greige-50">
              Cancel
            </Button>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="border-borderSoft bg-white hover:bg-greige-50">
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="bg-clay-600 hover:bg-clay-700 text-white">
                Continue
              </Button>
            ) : (
              <Button onClick={handleCreate} className="bg-clay-600 hover:bg-clay-700 text-white">
                Create Project
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
