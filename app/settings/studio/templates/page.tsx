'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import useUser from '@/hooks/useUser';
import { updateUser } from '@/supabase/API';
import { toast } from 'sonner';

// TODO : there is some conflict with moving phase , will fix later on

import SortableList, { SortableItem } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';

type Phase = {
  id: string;
  name: string;
  color: string;
  task?: string[];
  order?: number;
};

export default function StudioTemplatesPage() {
  const { user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<typeof user | null>(null);
  const [selectedPhaseForTasks, setSelectedPhaseForTasks] = useState<string>('');

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success('Phases updated successfully');
      queryClient.invalidateQueries(['users', user?.email]);
    },
    onError: error => {
      console.error(error);
      toast.error('Error! Try again');
    },
  });

  // Load current user
  useEffect(() => {
    if (!isLoading && user) {
      setCurrentUser(user);
      setSelectedPhaseForTasks(user.defaultPhases?.[0]?.id ?? '');
    }
  }, [user?.email, isLoading]);

  // ----- Persist function -----
  function persist(message = 'Saved') {
    if (!currentUser) return;

    const phases = currentUser.defaultPhases ?? [];

    // Check for duplicate phase names
    const names = phases.map(p => p.name.trim().toLowerCase());
    const hasDuplicates = names.some((name, idx) => names.indexOf(name) !== idx);
    if (hasDuplicates) {
      toast.error('Duplicate phase names are not allowed');
      return;
    }

    // Update order
    phases.forEach((p, idx) => (p.order = idx));
  }

  // ----- Reset to Techstyles defaults -----
  function onReset() {
    if (!currentUser) return;

    const defaultPhases: Phase[] = [
      {
        id: 'phase-discovery',
        name: 'Discovery',
        task: [
          'Client kickoff meeting',
          'Site survey and measurements',
          'Brief capture and requirements gathering',
          'Budget alignment and feasibility study',
          'Programme outline and timeline',
          'Stakeholder identification',
        ],
        color: '#6B7280',
      },
      {
        id: 'phase-concept',
        name: 'Concept Design',
        task: [
          'Mood boards and style direction',
          'Initial space planning and layouts',
          'Key materials and finishes selection',
          'Concept presentation preparation',
          'Client concept review meeting',
          'Concept refinements',
        ],
        color: '#C7654F',
      },
      {
        id: 'phase-dd',
        name: 'Design Development',
        task: [
          'Detailed floor plans and layouts',
          'Specifications and material schedules',
          'FF&E schedule and sourcing',
          'Joinery details and custom elements',
          'Lighting and electrical plans',
          'Design development sign-off',
        ],
        color: '#9CA3AF',
      },
      {
        id: 'phase-technical',
        name: 'Technical Drawings',
        task: [
          'Technical drawings and construction details',
          'Coordination with consultants',
          'Building regulations compliance',
          'Contractor tender documentation',
          'Issue drawings for pricing',
          'Technical specifications finalization',
        ],
        color: '#3B82F6',
      },
      {
        id: 'phase-procurement',
        name: 'Procurement',
        task: [
          'Issue RFQs to suppliers and contractors',
          'Compare bids and proposals',
          'Negotiate terms and pricing',
          'Issue purchase orders',
          'Track lead times and delivery schedules',
          'Confirm all POs placed',
        ],
        color: '#8B5CF6',
      },
      {
        id: 'phase-implementation',
        name: 'Site / Implementation',
        task: [
          'Site coordination and project management',
          'Progress monitoring and quality control',
          'Snag list capture and resolution',
          'Deliveries scheduling and coordination',
          'Practical completion inspection',
          'Client handover and final walkthrough',
        ],
        color: '#10B981',
      },
    ];

    setCurrentUser(prev => ({ ...prev, defaultPhases }));
    setSelectedPhaseForTasks(defaultPhases[0].id);
    persist('Restored Techstyles defaults');
  }

  // handle save
  const handleSave = () => {
    mutation.mutate(currentUser);
  };
  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Templates</h1>
          <p className="text-sm text-muted-foreground">Studio-wide templates and taxonomy used for new projects.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Techstyles defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save changes
          </Button>
        </div>
      </header>

      {/* Phases */}
      <section id="phases">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Phases</CardTitle>
              <CardDescription>Set studio phases. Reorder with drag handle, rename inline, and pick a color.</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const next: Phase = { id: crypto.randomUUID(), name: 'New phase', color: '#9CA3AF', task: [] };
                setCurrentUser(prev => ({
                  ...prev,
                  defaultPhases: [...prev.defaultPhases, next],
                }));
                setSelectedPhaseForTasks(next.id);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add phase
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <SortableList
              onSortEnd={(oldIndex, newIndex) => {
                if (!currentUser) return;
                const updated = arrayMoveImmutable(currentUser.defaultPhases, oldIndex, newIndex);
                updated.forEach((p, idx) => (p.order = idx));
                setCurrentUser(prev => ({ ...prev, defaultPhases: updated }));
              }}
              className="rounded-md p-1 border space-y-2"
              draggedItemClassName="opacity-70"
            >
              {currentUser.defaultPhases.map(p => (
                <SortableItem key={p.id}>
                  <div className="flex items-center gap-3 bg-white border-b p-3 last:border-b-0">
                    <div className="flex items-center cursor-grab text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="h-8 w-8 rounded-md border overflow-hidden">
                      <input
                        type="color"
                        className="h-full w-full cursor-pointer p-0 border-0"
                        value={p.color}
                        onChange={e => {
                          const updated = currentUser.defaultPhases.map(ph => (ph.id === p.id ? { ...ph, color: e.target.value } : ph));
                          setCurrentUser(prev => ({ ...prev, defaultPhases: updated }));
                        }}
                      />
                    </div>

                    <Input
                      className="max-w-xs"
                      value={p.name}
                      onChange={e => {
                        const updated = currentUser.defaultPhases.map(ph => (ph.id === p.id ? { ...ph, name: e.target.value } : ph));
                        setCurrentUser(prev => ({ ...prev, defaultPhases: updated }));
                      }}
                      onBlur={persist}
                    />

                    <Badge variant="secondary" style={{ backgroundColor: p.color, color: '#fff' }}>
                      {p.name}
                    </Badge>

                    <div className="ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = currentUser.defaultPhases.filter(ph => ph.id !== p.id);
                          setCurrentUser(prev => ({ ...prev, defaultPhases: updated }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableList>
          </CardContent>
        </Card>
      </section>

      {/* Tasks per phase */}
      <section id="tasks">
        <Card>
          <CardHeader>
            <CardTitle>Default tasks per phase</CardTitle>
            <CardDescription>One task per line. Used to seed new projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-4">
                <Label htmlFor="phase-selector">Phase</Label>
                <Select value={selectedPhaseForTasks} onValueChange={val => setSelectedPhaseForTasks(val)}>
                  <SelectTrigger id="phase-selector" className="mt-1 w-full">
                    <SelectValue placeholder="Select a phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser.defaultPhases.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-8">
                <Label htmlFor="tasks-textarea">Tasks</Label>
                <textarea
                  id="tasks-textarea"
                  className="mt-1 h-48 w-full resize-y rounded-md border p-3 font-mono text-sm whitespace-pre-wrap"
                  placeholder="One task per line"
                  value={currentUser.defaultPhases.find(p => p.id === selectedPhaseForTasks)?.task?.join('\n') ?? ''}
                  onChange={e => {
                    const nextTasks = e.target.value.split('\n');
                    const updated = currentUser.defaultPhases.map(p => (p.id === selectedPhaseForTasks ? { ...p, task: nextTasks } : p));
                    setCurrentUser(prev => ({ ...prev, defaultPhases: updated }));
                  }}
                  onBlur={() => {
                    const updated = currentUser.defaultPhases.map(p =>
                      p.id === selectedPhaseForTasks ? { ...p, task: p.task?.filter(line => line.trim() !== '') ?? [] } : p
                    );
                    setCurrentUser(prev => ({ ...prev, defaultPhases: updated }));
                    persist();
                  }}
                />

                <div className="mt-2 text-sm text-muted-foreground">Tip: Paste a list — we’ll keep one item per line.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />
    </div>
  );
}
