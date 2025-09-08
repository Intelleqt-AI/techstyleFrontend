'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Filter, GripHorizontal, Target, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Local types to keep this component self-contained and compatible with varying task shapes
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Status = 'todo' | 'in_progress' | 'in_review' | 'done';
type TeamMember = { id: string; name: string };
type ListColumn = { id: string; title: string; tasks: any[]; colorClass?: string };
type Phase = { id: string; name: string };
type UITask = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee?: string;
  assigneeIds?: string[];
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  phaseId?: string;
  listId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Layout constants
const LEFT_WIDTH = 280;
const ROW_HEIGHT = 40;
const BAR_HEIGHT = 20;
const HEADER_H = 60;
const MONTH_WIDTH = 120;
const WEEK_WIDTH = 120;

type Timescale = 'month' | 'week' | 'day';

function toggle<T>(id: T, values: T[], setter: React.Dispatch<React.SetStateAction<T[]>>) {
  if (values.includes(id)) setter(values.filter(v => v !== id));
  else setter([...values, id]);
}
function cap(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function TimelineView({
  tasks,
  setTasks,
  phases,
  lists,
  team,
  onEditTask,
  onCreateTask,
}: {
  tasks: any[];
  setTasks?: React.Dispatch<React.SetStateAction<UITask[]>>;
  phases: Phase[];
  lists: (ListColumn & { id: string; colorClass?: string })[];
  team: TeamMember[];
  onEditTask: (t: UITask) => void;
  onCreateTask: (phaseId?: string) => void;
}) {
  // Normalize incoming data: support board-style columns data as provided in the example
  type BoardAssignee = { id: string; name: string };
  type BoardItem = {
    id: string;
    name: string;
    startDate?: string | null;
    dueDate?: string | null;
    status?: string;
    priority?: string;
    phase?: string;
    assigned?: BoardAssignee[];
    created_at?: string;
  };
  type BoardColumn = { 
    id: string;
    name: string; 
    status?: string; 
    colorClass?: string; 
    items: BoardItem[];
    icon?: string | null;
  };

  function toYMDString(d?: string | null): string | undefined {
    if (!d) return undefined;
    if (d.includes('T')) return d.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    try {
      const dd = new Date(d);
      if (!isNaN(+dd)) return toYMD(dd);
    } catch {}
    return undefined;
  }

  function normalizeStatus(s?: string): any {
    if (!s) return 'todo';
    return s.replace(/\s+/g, '_').replace(/-/g, '_').toLowerCase();
  }

  const isBoardShape = Array.isArray(tasks as any) && (tasks as any)[0] && 'items' in (tasks as any)[0];

  const { tasksView, phasesView, listsView } = React.useMemo(() => {
    if (!isBoardShape) return { tasksView: tasks, phasesView: phases, listsView: lists };
    const cols = (tasks as unknown as BoardColumn[]) || [];
    const outTasks: UITask[] = [];
    const phaseSet = new Map<string, { name: string; colorClass?: string }>();
    const outLists: (ListColumn & { id: string; colorClass?: string })[] = [];

    for (const col of cols) {
      const listId = col.id || col.status || col.name;
      outLists.push({ id: listId, title: col.name, tasks: [] as any, colorClass: col.colorClass });
      
      // Store phase information
      if (col.id && !phaseSet.has(col.id)) {
        phaseSet.set(col.id, { name: col.name, colorClass: col.colorClass });
      }
      
      for (const it of col.items || []) {
        const start = toYMDString(it.startDate);
        const due = toYMDString(it.dueDate);
        const end = due || start;
        const title = it.name || '';
        const status = normalizeStatus(it.status);
        const priority = (it.priority || '').toString().toLowerCase() as any;
        const assigneeIds = (it.assigned || []).map(a => a.id);
        const phaseId = it.phase || col.id || '__unscheduled__';
        
        outTasks.push({
          id: it.id,
          title,
          description: undefined as any,
          status: status as any,
          priority: (priority || 'low') as any,
          assignee: undefined as any,
          assigneeIds: assigneeIds as any,
          startDate: start,
          endDate: end,
          dueDate: due,
          phaseId: phaseId as any,
          listId: listId as any,
          createdAt: it.created_at || new Date().toISOString(),
          updatedAt: it.created_at || new Date().toISOString(),
        } as UITask & any);
      }
    }

    // Merge detected phases with provided phases so empty phases are preserved
    const providedPhaseMap = new Map<string, { name: string; colorClass?: string }>((phases || []).map(p => [p.id, { name: p.name }]));
    for (const [id, phaseInfo] of phaseSet.entries()) {
      if (!providedPhaseMap.has(id)) providedPhaseMap.set(id, phaseInfo);
    }
    const outPhases: Phase[] = Array.from(providedPhaseMap.entries()).map(([id, phaseInfo]) => ({ id, name: phaseInfo.name })) as any;
    return { tasksView: outTasks, phasesView: outPhases, listsView: outLists };
  }, [tasks, phases, lists, isBoardShape]);

  const [workingTasks, setWorkingTasks] = React.useState<UITask[]>([]);
  React.useEffect(() => {
    setWorkingTasks(tasksView);
  }, [tasksView]);
  function updateWorkingTasks(updater: (prev: UITask[]) => UITask[]) {
    setWorkingTasks(prev => {
      const next = updater(prev);
      if (!isBoardShape && setTasks) setTasks(() => next);
      return next;
    });
  }
  // Controls
  const [timescale, setTimescale] = React.useState<Timescale>('month');
  const dayWidth = 48; // used only in Week mode
  const monthWidth = 120; // Declare monthWidth variable

  // Filters
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [assignees, setAssignees] = React.useState<string[]>([]);
  const [priorities, setPriorities] = React.useState<Priority[]>([]);
  const [phasesSel, setPhasesSel] = React.useState<string[]>([]);
  const [statuses, setStatuses] = React.useState<Status[]>([]);

  // Collapse phases
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  // Phases with Unscheduled
  const ALL_PHASES = [{ id: '__unscheduled__', name: 'Unscheduled' }, ...(phasesView || [])];
  
  // Helper to get colorClass for a phase
  const getPhaseColorClass = (phaseId: string) => {
    if (isBoardShape) {
      const cols = (tasks as unknown as BoardColumn[]) || [];
      const col = cols.find(c => c.id === phaseId);
      return col?.colorClass;
    }
    return undefined;
  };

  // Filtered tasks for rows
  const filteredTasks = React.useMemo(() => {
    return workingTasks.filter(t => {
      if (assignees.length && !(t.assigneeIds || []).some(id => assignees.includes(id))) return false;
      if (priorities.length && !priorities.includes(t.priority)) return false;
      if (phasesSel.length) {
        const pid = t.phaseId ?? '__unscheduled__';
        const uns = !t.startDate && !t.endDate && !t.dueDate;
        if (phasesSel.includes('__unscheduled__')) {
          if (!uns) return false;
        } else if (!phasesSel.includes(pid)) {
          return false;
        }
      }
      if (statuses.length && !statuses.includes(t.status)) return false;
      return true;
    });
  }, [workingTasks, assignees, priorities, phasesSel, statuses]);

  // Build rows: phase header row + task rows
  type Row = { key: string; type: 'phase' | 'task'; phaseId: string; task?: UITask };
  const rows: Row[] = React.useMemo(() => {
    const out: Row[] = [];
    for (const p of ALL_PHASES) {
      out.push({ key: `phase-${p.id}`, type: 'phase', phaseId: p.id });
      if (!collapsed[p.id]) {
        const pts = filteredTasks
          .filter(t => {
            const pid = t.phaseId ?? '__unscheduled__';
            const uns = !t.startDate && !t.endDate && !t.dueDate;
            return p.id === '__unscheduled__' ? uns : pid === p.id;
          })
          .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        for (const t of pts) out.push({ key: `task-${t.id}`, type: 'task', phaseId: p.id, task: t });
      }
    }
    return out;
  }, [filteredTasks, collapsed]);

  // Determine project range (min→max) from all tasks, but show at least a full year
  const projectRange = React.useMemo(() => {
    let min: Date | null = null;
    let max: Date | null = null;
    for (const t of workingTasks) {
      const s = t.startDate ?? t.dueDate;
      const e = t.endDate ?? t.dueDate;
      if (!s || !e) continue;
      const sd = toDate(s);
      const ed = toDate(e);
      if (!min || +sd < +min) min = sd;
      if (!max || +ed > +max) max = ed;
    }
    
    // If no tasks have dates, show current year
    if (!min || !max) {
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      return { from: yearStart, to: yearEnd };
    }
    
    // Ensure we show at least 12 months
    const rangeMonths = (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth());
    if (rangeMonths < 12) {
      const centerDate = new Date((+min + +max) / 2);
      const sixMonthsBefore = new Date(centerDate);
      sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
      const sixMonthsAfter = new Date(centerDate);
      sixMonthsAfter.setMonth(sixMonthsAfter.getMonth() + 6);
      return { from: sixMonthsBefore, to: sixMonthsAfter };
    }
    
    return { from: min, to: max };
  }, [workingTasks]);

  // DAY MODE CALENDAR: daily columns from project start to end (aligned)
  const { dates, monthSpans, todayIndex } = React.useMemo(() => {
    if (timescale !== 'day')
      return {
        dates: [] as string[],
        monthSpans: [] as { startIndex: number; length: number; label: string }[],
        todayIndex: -1,
      };

    const from = startOfWeekMonday(projectRange.from);
    const to = endOfWeekSunday(projectRange.to);
    const ds = enumerateDays(from, to);
    const todayStr = toYMD(new Date());
    const tIdx = ds.indexOf(todayStr);

    // Month spans for top header row
    const spans: { startIndex: number; length: number; label: string }[] = [];
    if (ds.length > 0) {
      let i = 0;
      while (i < ds.length) {
        const d = toDate(ds[i]);
        const monthStart = i;
        const m = d.getMonth();
        const y = d.getFullYear();
        while (i < ds.length) {
          const di = toDate(ds[i]);
          if (di.getMonth() !== m || di.getFullYear() !== y) break;
          i++;
        }
        const length = i - monthStart;
        const label = new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        spans.push({ startIndex: monthStart, length, label });
      }
    }

    return { dates: ds, monthSpans: spans, todayIndex: tIdx };
  }, [timescale, projectRange]);

  // WEEK MODE CALENDAR: weekly columns from project start to end
  const { weeks, weekMonthSpans, weekTodayIndex } = React.useMemo(() => {
    if (timescale !== 'week')
      return {
        weeks: [] as string[],
        weekMonthSpans: [] as { startIndex: number; length: number; label: string }[],
        weekTodayIndex: -1,
      };

    const from = startOfWeekMonday(projectRange.from);
    const to = endOfWeekSunday(projectRange.to);

    const weekList: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      weekList.push(toYMD(cur));
      cur.setDate(cur.getDate() + 7);
    }

    const todayStr = toYMD(new Date());
    const todayWeekStart = startOfWeekMonday(new Date());
    const tIdx = weekList.findIndex(weekStart => {
      const weekEnd = new Date(toDate(weekStart));
      weekEnd.setDate(weekEnd.getDate() + 6);
      return toDate(todayStr) >= toDate(weekStart) && toDate(todayStr) <= weekEnd;
    });

    // Month spans for top header row
    const spans: { startIndex: number; length: number; label: string }[] = [];
    if (weekList.length > 0) {
      let i = 0;
      while (i < weekList.length) {
        const weekStart = toDate(weekList[i]);
        const monthStart = i;
        const m = weekStart.getMonth();
        const y = weekStart.getFullYear();
        while (i < weekList.length) {
          const wi = toDate(weekList[i]);
          if (wi.getMonth() !== m || wi.getFullYear() !== y) break;
          i++;
        }
        const length = i - monthStart;
        const label = new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        spans.push({ startIndex: monthStart, length, label });
      }
    }

    return { weeks: weekList, weekMonthSpans: spans, weekTodayIndex: tIdx };
  }, [timescale, projectRange]);

  // MONTH MODE CALENDAR: project months only (may span multiple years)
  const { months, monthTodayIndex } = React.useMemo(() => {
    if (timescale !== 'month') return { months: [] as string[], monthTodayIndex: -1 };
    const startM = startOfMonth(projectRange.from);
    const endM = startOfMonth(projectRange.to);
    const out: string[] = [];
    let cur = new Date(startM);
    while (cur <= endM) {
      out.push(monthKey(cur));
      cur = addMonths(cur, 1);
    }
    const todayKey = monthKey(new Date());
    const idx = out.indexOf(todayKey);
    return { months: out, monthTodayIndex: idx };
  }, [timescale, projectRange]);

  // Ensure the timeline fills the available scroller width
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [scrollerWidth, setScrollerWidth] = React.useState<number>(0);
  React.useLayoutEffect(() => {
    if (!scrollerRef.current) return;
    const el = scrollerRef.current;
    const update = () => setScrollerWidth(el.clientWidth);
    update();
    const ROClass = (window as any).ResizeObserver;
    const ro = ROClass ? new ROClass(() => update()) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const naturalGridWidth =
    timescale === 'day' ? dates.length * dayWidth : timescale === 'week' ? weeks.length * WEEK_WIDTH : months.length * MONTH_WIDTH;
  const minGridWidth = Math.max(0, scrollerWidth - LEFT_WIDTH);
  const gridWidth = Math.max(naturalGridWidth, minGridWidth);
  const bodyHeight = rows.length * ROW_HEIGHT;

  function scrollToToday() {
    if (!scrollerRef.current) return;
    const idx = timescale === 'day' ? todayIndex : timescale === 'week' ? weekTodayIndex : monthTodayIndex;
    if (idx < 0) return;
    const cellWidth = timescale === 'day' ? dayWidth : timescale === 'week' ? WEEK_WIDTH : MONTH_WIDTH;
    const left = idx * cellWidth - scrollerRef.current.clientWidth / 2 + LEFT_WIDTH / 2;
    scrollerRef.current.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }
  function fitProject() {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }

  // Drag state and behavior
  const [dragging, setDragging] = React.useState<{
    taskId: string;
    mode: 'move' | 'resize-start' | 'resize-end' | 'schedule';
    startX: number;
    originalStart?: string;
    originalEnd?: string;
    dragOffset?: number;
  } | null>(null);

  React.useEffect(() => {
    if (!dragging) return;
    
    let animationFrame: number;
    
    function onMove(e: MouseEvent) {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      animationFrame = requestAnimationFrame(() => {
        const d = dragging!;
        const deltaPx = e.clientX - d.startX;
        
        if (timescale === 'day') {
          const deltaDays = Math.round(deltaPx / dayWidth);
          updateWorkingTasks(prev => {
            const idx = prev.findIndex(t => t.id === d.taskId);
            if (idx === -1) return prev;
            const t = { ...prev[idx] } as UITask;
            if (d.mode === 'move') {
              if (t.startDate && t.endDate) {
                t.startDate = toYMD(shiftDate(toDate(t.startDate), deltaDays));
                t.endDate = toYMD(shiftDate(toDate(t.endDate), deltaDays));
              } else if (t.dueDate) {
                t.dueDate = toYMD(shiftDate(toDate(t.dueDate), deltaDays));
              }
            } else if (d.mode === 'resize-start' && d.originalStart) {
              t.startDate = toYMD(shiftDate(toDate(d.originalStart), deltaDays));
            } else if (d.mode === 'resize-end' && d.originalEnd) {
              t.endDate = toYMD(shiftDate(toDate(d.originalEnd), deltaDays));
            } else if (d.mode === 'schedule') {
              if (d.originalStart) {
                const start = toYMD(shiftDate(toDate(d.originalStart), deltaDays));
                t.startDate = start;
                t.endDate = start;
              }
            }
            const next = [...prev];
            next[idx] = t;
            return next;
          });
        } else if (timescale === 'week') {
          const deltaWeeks = Math.round(deltaPx / WEEK_WIDTH);
          updateWorkingTasks(prev => {
            const idx = prev.findIndex(t => t.id === d.taskId);
            if (idx === -1) return prev;
            const t = { ...prev[idx] } as UITask;
            if (d.mode === 'move') {
              if (t.startDate && t.endDate) {
                t.startDate = toYMD(shiftDate(toDate(t.startDate), deltaWeeks * 7));
                t.endDate = toYMD(shiftDate(toDate(t.endDate), deltaWeeks * 7));
              } else if (t.dueDate) {
                t.dueDate = toYMD(shiftDate(toDate(t.dueDate), deltaWeeks * 7));
              }
            } else if (d.mode === 'resize-start' && d.originalStart) {
              t.startDate = toYMD(shiftDate(toDate(d.originalStart), deltaWeeks * 7));
            } else if (d.mode === 'resize-end' && d.originalEnd) {
              t.endDate = toYMD(shiftDate(toDate(d.originalEnd), deltaWeeks * 7));
            } else if (d.mode === 'schedule') {
              if (d.originalStart) {
                const start = toYMD(shiftDate(toDate(d.originalStart), deltaWeeks * 7));
                t.startDate = start;
                t.endDate = start;
              }
            }
            const next = [...prev];
            next[idx] = t;
            return next;
          });
        } else {
          const deltaMonths = Math.round(deltaPx / MONTH_WIDTH);
          updateWorkingTasks(prev => {
            const idx = prev.findIndex(t => t.id === d.taskId);
            if (idx === -1) return prev;
            const t = { ...prev[idx] } as UITask;
            if (d.mode === 'move') {
              if (t.startDate && t.endDate) {
                t.startDate = toYMD(shiftMonths(toDate(t.startDate), deltaMonths));
                t.endDate = toYMD(shiftMonths(toDate(t.endDate), deltaMonths));
              } else if (t.dueDate) {
                t.dueDate = toYMD(shiftMonths(toDate(t.dueDate), deltaMonths));
              }
            } else if (d.mode === 'resize-start' && d.originalStart) {
              t.startDate = toYMD(shiftMonths(toDate(d.originalStart), deltaMonths));
            } else if (d.mode === 'resize-end' && d.originalEnd) {
              t.endDate = toYMD(shiftMonths(toDate(d.originalEnd), deltaMonths));
            } else if (d.mode === 'schedule') {
              if (d.originalStart) {
                const base = toDate(d.originalStart);
                const start = toYMD(shiftMonths(base, deltaMonths));
                t.startDate = start;
                t.endDate = start;
              }
            }
            const next = [...prev];
            next[idx] = t;
            return next;
          });
        }
      });
    }
    
    function onUp() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      setDragging(null);
    }
    
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, dayWidth, setTasks, timescale]);

  // Phase ranges computed from ALL tasks (not filtered), per your rule
  const phaseRanges = React.useMemo(() => {
    const map = new Map<string, { start: string; end: string }>();
    for (const t of workingTasks) {
      const pid = t.phaseId ?? '__unscheduled__';
      const s = t.startDate ?? t.dueDate;
      const e = t.endDate ?? t.dueDate;
      if (!s || !e) continue;
      const cur = map.get(pid);
      if (!cur) map.set(pid, { start: s, end: e });
      else {
        if (s < cur.start) cur.start = s;
        if (e > cur.end) cur.end = e;
      }
    }
    return map;
  }, [workingTasks]);

  // Active filter pills
  const activePills: string[] = [
    ...assignees.map(id => `@${team.find(t => t.id === id)?.name?.split(' ')[0] || id}`),
    ...phasesSel.map(pid => `Phase: ${(phasesView || []).find(p => p.id === pid)?.name || 'Unscheduled'}`),
    ...priorities.map(p => `Priority: ${p}`),
    ...statuses.map(s => `Status: ${s.replaceAll('_', ' ')}`),
  ];

  const scrollbarStyles = `
  .timeline-scroller::-webkit-scrollbar {
    height: 8px;
  }
  .timeline-scroller::-webkit-scrollbar-track {
    background: transparent;
  }
  .timeline-scroller::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  .timeline-scroller::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  .timeline-header::-webkit-scrollbar {
    display: none;
  }
  .timeline-header {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

  const [currentPeriod, setCurrentPeriod] = useState({
    month: new Date(2025, 7), // August 2025
    week: new Date(2025, 7, 4), // Week starting Aug 4, 2025
    today: new Date(2025, 7, 6), // Aug 6, 2025
    year: new Date(2025, 0), // 2025
  });

  const generateTimelineData = () => {
    switch (timescale) {
      case 'month': {
        // Show 12 months of the year
        const year = currentPeriod.year.getFullYear();
        const months = [];
        for (let i = 0; i < 12; i++) {
          months.push({
            label: new Date(year, i, 1).toLocaleDateString('en-US', { month: 'short' }),
            fullLabel: new Date(year, i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            date: new Date(year, i, 1),
            width: 100,
          });
        }
        return { periods: months, type: 'month' as const };
      }
      case 'week': {
        // Show weeks in the current month
        const year = currentPeriod.month.getFullYear();
        const month = currentPeriod.month.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Find the first Monday of or before the first day of the month
        const startDate = new Date(firstDay);
        const dayOfWeek = startDate.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - daysToSubtract);

        const weeks = [];
        const currentWeek = new Date(startDate);

        while (currentWeek <= lastDay || currentWeek.getMonth() === month) {
          const weekEnd = new Date(currentWeek);
          weekEnd.setDate(weekEnd.getDate() + 6);

          weeks.push({
            label: `Week ${Math.ceil(currentWeek.getDate() / 7)}`,
            fullLabel: `${currentWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric' }
            )}`,
            date: new Date(currentWeek),
            width: 120,
          });

          currentWeek.setDate(currentWeek.getDate() + 7);

          // Break if we've gone too far past the month
          if (weeks.length > 6) break;
        }
        return { periods: weeks, type: 'week' as const };
      }
      case 'day': {
        // Show days in the current month
        const year = currentPeriod.month.getFullYear();
        const month = currentPeriod.month.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(year, month, i);
          days.push({
            label: i.toString(),
            fullLabel: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            date: date,
            width: 40,
          });
        }
        return { periods: days, type: 'day' as const };
      }
      default:
        return { periods: [], type: 'month' as const };
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-3 items-center px-4" style={{ height: 56 }}>
        <div className="flex items-center gap-2 overflow-hidden">
          {activePills.map(pill => (
            <span
              key={pill}
              className="inline-flex items-center h-8 px-3 rounded-full border border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white text-sm"
              title={pill}
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            className={cn(
              'h-9 px-4 rounded-md border text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)] focus-visible:ring-offset-0',
              timescale === 'day'
                ? 'bg-[var(--clay-filled)] text-[var(--clay-on-filled)]'
                : 'border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white'
            )}
            aria-pressed={timescale === 'day'}
            onClick={() => setTimescale('day')}
          >
            Day
          </button>
          <button
            className={cn(
              'h-9 px-4 rounded-md border text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)] focus-visible:ring-offset-0',
              timescale === 'week'
                ? 'bg-[var(--clay-filled)] text-[var(--clay-on-filled)]'
                : 'border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white'
            )}
            aria-pressed={timescale === 'week'}
            onClick={() => setTimescale('week')}
          >
            Week
          </button>
          <button
            className={cn(
              'h-9 px-4 rounded-md border text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)] focus-visible:ring-offset-0',
              timescale === 'month'
                ? 'bg-[var(--clay-filled)] text-[var(--clay-on-filled)]'
                : 'border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white'
            )}
            aria-pressed={timescale === 'month'}
            onClick={() => setTimescale('month')}
          >
            Month
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-md border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)] focus-visible:ring-offset-0"
            onClick={scrollToToday}
          >
            <Target className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-md border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)] focus-visible:ring-offset-0"
            onClick={fitProject}
          >
            <GripHorizontal className="h-4 w-4 mr-2" />
            Fit
          </Button>

          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)] focus-visible:ring-offset-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[360px] p-0">
              <SheetHeader className="px-5 py-4 border-b">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-56px-56px)]">
                <div className="p-5 space-y-6">
                  <FilterGroup
                    title="Assignees"
                    items={team.map(m => ({ id: m.id, label: m.name }))}
                    values={assignees}
                    onToggle={id => toggle(id, assignees, setAssignees)}
                  />
                  <FilterGroup
                    title="Priority"
                    items={['low', 'medium', 'high'].map(p => ({ id: p as Priority, label: cap(p) }))}
                    values={priorities}
                    onToggle={id => toggle(id, priorities, setPriorities)}
                  />
                  <FilterGroup
                    title="Phase"
                    items={[{ id: '__unscheduled__', label: 'Unscheduled' }, ...((phasesView || []).map(p => ({ id: p.id, label: p.name })))]}
                    values={phasesSel}
                    onToggle={id => toggle(id, phasesSel, setPhasesSel)}
                  />
                  <FilterGroup
                    title="Status"
                    items={(['todo', 'in_progress', 'in_review', 'done'] as Status[]).map(s => ({
                      id: s,
                      label: cap(s.replaceAll('_', ' ')),
                    }))}
                    values={statuses}
                    onToggle={id => toggle(id, statuses, setStatuses)}
                  />
                </div>
              </ScrollArea>
              <div className="p-5 border-t flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAssignees([]);
                    setPriorities([]);
                    setPhasesSel([]);
                    setStatuses([]);
                  }}
                >
                  Clear
                </Button>
                <Button onClick={() => setFilterOpen(false)} className="rounded-md">
                  Apply
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Scroller */}
      <div>
        <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
        <div ref={scrollerRef} className="timeline-scroller relative overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          <div className="relative" style={{ minWidth: LEFT_WIDTH + gridWidth }}>
            <div className="grid" style={{ gridTemplateColumns: `${LEFT_WIDTH}px ${gridWidth}px` }}>
              {/* Left header */}
              <div className="sticky left-0 top-0 z-30 bg-white border-b border-border flex items-center px-4" style={{ height: HEADER_H }}>
                <div className="text-sm font-medium">Phase / Tasks</div>
              </div>

              {/* Right header */}
              <div
                className="sticky top-0 z-20 bg-white border-b border-border overflow-hidden timeline-header"
                style={{ height: HEADER_H }}
              >
                {timescale === 'day' ? (
                  <>
                    {/* Months row */}
                    <div className="grid h-7" style={{ gridTemplateColumns: `repeat(${dates.length}, ${dayWidth}px)` }} aria-hidden>
                      {monthSpans.map(m => (
                        <div
                          key={`${m.label}-${m.startIndex}`}
                          className="flex items-center justify-center text-xs font-medium text-foreground/80 col-span-full"
                          style={{ gridColumn: `${m.startIndex + 1} / span ${m.length}` }}
                        >
                          {m.label}
                        </div>
                      ))}
                    </div>
                    {/* Days row */}
                    <div className="grid h-[calc(100%-28px)]" style={{ gridTemplateColumns: `repeat(${dates.length}, ${dayWidth}px)` }}>
                      {dates.map((d, i) => {
                        const dt = toDate(d);
                        const first = dt.getDate() === 1;
                        const monday = dt.getDay() === 1;
                        const isToday = i === todayIndex;
                        const borderClass = first
                          ? 'border-[color:var(--neutral-400,#9CA3AF)]'
                          : monday
                          ? 'border-[color:var(--neutral-300,#D1D5DB)]'
                          : 'border-[color:var(--neutral-200,#E5E7EB)]';
                        return (
                          <div
                            key={d}
                            className={cn('flex flex-col items-center justify-center border-r', 'text-[11px] leading-4', borderClass)}
                            aria-label={`${dt.toLocaleDateString(undefined, { weekday: 'long' })} ${dt.toLocaleDateString(undefined, {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}`}
                            title={dt.toLocaleDateString(undefined, {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          >
                            <span className={cn('uppercase tracking-wide', isToday && 'font-semibold')}>
                              {dt.toLocaleDateString(undefined, { weekday: 'short' })}
                            </span>
                            <span className={cn('tabular-nums', isToday && 'font-semibold')}>{String(dt.getDate()).padStart(2, '0')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : timescale === 'week' ? (
                  <>
                    {/* Months row */}
                    <div className="grid h-7" style={{ gridTemplateColumns: `repeat(${weeks.length}, ${WEEK_WIDTH}px)` }} aria-hidden>
                      {weekMonthSpans.map(m => (
                        <div
                          key={`${m.label}-${m.startIndex}`}
                          className="flex items-center justify-center text-xs font-medium text-foreground/80 col-span-full"
                          style={{ gridColumn: `${m.startIndex + 1} / span ${m.length}` }}
                        >
                          {m.label}
                        </div>
                      ))}
                    </div>
                    {/* Weeks row */}
                    <div className="grid h-[calc(100%-28px)]" style={{ gridTemplateColumns: `repeat(${weeks.length}, ${WEEK_WIDTH}px)` }}>
                      {weeks.map((w, i) => {
                        const weekStart = toDate(w);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        const isCurrentWeek = i === weekTodayIndex;
                        return (
                          <div
                            key={w}
                            className={cn(
                              'flex flex-col items-center justify-center border-r border-[color:var(--neutral-200,#E5E7EB)]',
                              'text-[11px] leading-4'
                            )}
                            title={`Week ${weekStart.toLocaleDateString(undefined, {
                              day: '2-digit',
                              month: 'short',
                            })} - ${weekEnd.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}`}
                          >
                            <span className={cn('uppercase tracking-wide', isCurrentWeek && 'font-semibold')}>Week</span>
                            <span className={cn('tabular-nums', isCurrentWeek && 'font-semibold')}>
                              {String(weekStart.getDate()).padStart(2, '0')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  // Month header: project months only
                  <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${months.length}, ${MONTH_WIDTH}px)` }}>
                    {months.map(m => {
                      const [y, mm] = m.split('-').map(Number);
                      return (
                        <div
                          key={m}
                          className="flex items-center justify-center text-xs font-medium text-foreground/80 border-r border-[color:var(--neutral-200,#E5E7EB)]"
                        >
                          {new Date(y, (mm || 1) - 1, 1).toLocaleDateString(undefined, {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Left rail rows */}
              <div className="sticky left-0 z-10 bg-white border-r border-border">
                <AnimatePresence>
                  {rows.map(row => {
                    if (row.type === 'phase') {
                      const p = ALL_PHASES.find(x => x.id === row.phaseId)!;
                      const count = filteredTasks.filter(t => {
                        const pid = t.phaseId ?? '__unscheduled__';
                        const uns = !t.startDate && !t.endDate && !t.dueDate;
                        return row.phaseId === '__unscheduled__' ? uns : pid === row.phaseId;
                      }).length;
                      const isCollapsed = collapsed[row.phaseId];
                      return (
                        <motion.div 
                          key={row.key} 
                          className="flex items-center h-10 px-4 border-b border-border"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            className="flex items-center gap-2 text-sm w-full text-left group text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)] focus-visible:ring-offset-0 rounded hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setCollapsed(c => ({ ...c, [row.phaseId]: !c[row.phaseId] }))}
                            aria-expanded={!isCollapsed}
                            title={p.name}
                          >
                            <motion.div
                              animate={{ rotate: isCollapsed ? 0 : 90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                            <span className="inline-block w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: phaseColorVar(row.phaseId, getPhaseColorClass(row.phaseId)) }} />
                            <span className="truncate font-medium">{p.name}</span>
                            <span
                              className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-2 rounded-full text-[11px] bg-blue-100 text-blue-700 font-medium"
                              aria-label={`${count} tasks`}
                            >
                              {count}
                            </span>
                            <motion.span 
                              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus
                                className="h-4 w-4"
                                onClick={e => {
                                  e.stopPropagation();
                                  onCreateTask(row.phaseId);
                                }}
                              />
                            </motion.span>
                          </button>
                        </motion.div>
                      );
                    } else {
                      const t = row.task!;
                      return (
                        <motion.div 
                          key={row.key} 
                          className="flex items-center h-10 px-4 border-b border-border hover:bg-gray-50 transition-colors duration-200"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-sm truncate text-gray-700" title={t.title}>
                            {t.title}
                          </div>
                        </motion.div>
                      );
                    }
                  })}
                </AnimatePresence>
              </div>

              {/* Right grid body */}
              <div className="relative overflow-hidden">
                {/* Background grid and today highlight */}
                <div className="absolute top-0 left-0" style={{ width: gridWidth, height: bodyHeight }}>
                  {timescale === 'day' ? (
                    <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${dates.length}, ${dayWidth}px)` }}>
                      {dates.map(d => {
                        const dt = toDate(d);
                        const first = dt.getDate() === 1;
                        const monday = dt.getDay() === 1;
                        const borderClass = first
                          ? 'border-[color:var(--neutral-400,#9CA3AF)]'
                          : monday
                          ? 'border-[color:var(--neutral-300,#D1D5DB)]'
                          : 'border-[color:var(--neutral-200,#E5E7EB)]';
                        return <div key={d} className={cn('border-r', borderClass)} />;
                      })}
                    </div>
                  ) : timescale === 'week' ? (
                    <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${weeks.length}, ${WEEK_WIDTH}px)` }}>
                      {weeks.map(w => (
                        <div key={w} className="border-r border-[color:var(--neutral-200,#E5E7EB)]" aria-label={`Week ${w}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${months.length}, ${MONTH_WIDTH}px)` }}>
                      {months.map(m => (
                        <div key={m} className="border-r border-[color:var(--neutral-200,#E5E7EB)]" aria-label={`Month ${m}`} />
                      ))}
                    </div>
                  )}

                  {/* Today highlight */}
                  {timescale === 'day'
                    ? todayIndex >= 0 && (
                        <>
                          <div
                            className="absolute top-0 bottom-0 bg-[var(--clay-filled)]/10 pointer-events-none"
                            style={{ left: todayIndex * dayWidth, width: dayWidth }}
                          />
                          <div
                            className="absolute top-0 bottom-0 bg-[var(--clay-filled)] pointer-events-none"
                            style={{ left: todayIndex * dayWidth + Math.floor(dayWidth / 2), width: 2 }}
                          />
                        </>
                      )
                    : timescale === 'week'
                    ? weekTodayIndex >= 0 && (
                        <>
                          <div
                            className="absolute top-0 bottom-0 bg-[var(--clay-filled)]/10 pointer-events-none"
                            style={{ left: weekTodayIndex * WEEK_WIDTH, width: WEEK_WIDTH }}
                          />
                          <div
                            className="absolute top-0 bottom-0 bg-[var(--clay-filled)] pointer-events-none"
                            style={{ left: weekTodayIndex * WEEK_WIDTH + Math.floor(WEEK_WIDTH / 2), width: 2 }}
                          />
                        </>
                      )
                    : monthTodayIndex >= 0 && (
                        <>
                          <div
                            className="absolute top-0 bottom-0 bg-[var(--clay-filled)]/10 pointer-events-none"
                            style={{ left: monthTodayIndex * MONTH_WIDTH, width: MONTH_WIDTH }}
                          />
                          <div
                            className="absolute top-0 bottom-0 bg-[var(--clay-filled)] pointer-events-none"
                            style={{ left: monthTodayIndex * MONTH_WIDTH + Math.floor(MONTH_WIDTH / 2), width: 2 }}
                          />
                        </>
                      )}
                </div>

                {/* Bars and phase bands */}
                <div style={{ width: gridWidth, height: bodyHeight, position: 'relative' }}>
                  {rows.map((row, rIdx) => {
                    const top = rIdx * ROW_HEIGHT;
                    if (row.type === 'phase') {
                      const pr = phaseRanges.get(row.phaseId);
                      if (!pr) {
                        return <div key={row.key} className="absolute left-0 right-0" style={{ top, height: ROW_HEIGHT }} />;
                      }

                      if (timescale === 'day') {
                        const sIdx = indexOfDate(dates, pr.start);
                        const eIdx = indexOfDate(dates, pr.end);
                        const left = Math.max(0, sIdx * dayWidth);
                        const width = Math.max(dayWidth, (eIdx - sIdx + 1) * dayWidth);
                        return (
                          <div key={row.key} className="absolute left-0 right-0" style={{ top, height: ROW_HEIGHT }}>
                            <div
                              className="absolute rounded-full"
                              style={{
                                left,
                                width,
                                top: (ROW_HEIGHT - 8) / 2,
                                height: 8,
                                backgroundColor: phaseColorVar(row.phaseId, getPhaseColorClass(row.phaseId)),
                                opacity: 0.18,
                              }}
                              title={`Phase period: ${pr.start} → ${pr.end}`}
                              aria-label={`Phase ${row.phaseId} window`}
                            />
                          </div>
                        );
                      } else if (timescale === 'week') {
                        const sIdx = weekIndexFromYMD(pr.start, weeks);
                        const eIdx = weekIndexFromYMD(pr.end, weeks);
                        const left = Math.max(0, sIdx * WEEK_WIDTH);
                        const width = Math.max(WEEK_WIDTH, (eIdx - sIdx + 1) * WEEK_WIDTH);
                        return (
                          <div key={row.key} className="absolute left-0 right-0" style={{ top, height: ROW_HEIGHT }}>
                            <div
                              className="absolute rounded-full"
                              style={{
                                left,
                                width,
                                top: (ROW_HEIGHT - 8) / 2,
                                height: 8,
                                backgroundColor: phaseColorVar(row.phaseId, getPhaseColorClass(row.phaseId)),
                                opacity: 0.18,
                              }}
                              title={`Phase period: ${pr.start} → ${pr.end}`}
                              aria-label={`Phase ${row.phaseId} window`}
                            />
                          </div>
                        );
                      } else {
                        const sIdx = monthIndexFromYMD(pr.start, months);
                        const eIdx = monthIndexFromYMD(pr.end, months);
                        const left = Math.max(0, sIdx * MONTH_WIDTH);
                        const width = Math.max(MONTH_WIDTH, (eIdx - sIdx + 1) * MONTH_WIDTH);
                        return (
                          <div key={row.key} className="absolute left-0 right-0" style={{ top, height: ROW_HEIGHT }}>
                            <div
                              className="absolute rounded-full"
                              style={{
                                left,
                                width,
                                top: (ROW_HEIGHT - 8) / 2,
                                height: 8,
                                backgroundColor: phaseColorVar(row.phaseId, getPhaseColorClass(row.phaseId)),
                                opacity: 0.18,
                              }}
                              title={`Phase period: ${pr.start} → ${pr.end}`}
                              aria-label={`Phase ${row.phaseId} window`}
                            />
                          </div>
                        );
                      }
                    }

                    const t = row.task!;
                    const hasSpan = t.startDate && t.endDate;
                    const hasDue = !hasSpan && !!t.dueDate;

                    return (
                      <div
                        key={row.key}
                        className="absolute left-0 right-0"
                        style={{ top, height: ROW_HEIGHT }}
                        onDoubleClick={() => onEditTask(t)}
                        title={`${t.title}${formatDatesTooltip(t)}`}
                      >
                        {hasSpan && (
                          <TaskBar
                            mode={timescale}
                            task={t}
                            lists={listsView as any}
                            dates={dates}
                            weeks={weeks}
                            months={months}
                            dayWidth={dayWidth}
                            weekWidth={WEEK_WIDTH}
                            monthWidth={monthWidth}
                            onDragStart={(mode, e) =>
                              setDragging({
                                taskId: t.id,
                                mode,
                                startX: e.clientX,
                                originalStart: t.startDate,
                                originalEnd: t.endDate,
                              })
                            }
                          />
                        )}
                        {hasDue && (
                          <DueDiamond
                            mode={timescale}
                            task={t}
                            dates={dates}
                            weeks={weeks}
                            months={months}
                            dayWidth={dayWidth}
                            weekWidth={WEEK_WIDTH}
                            monthWidth={monthWidth}
                          />
                        )}
                        {!hasSpan && !hasDue && (
                          <ScheduleHint
                            mode={timescale}
                            dates={dates}
                            weeks={weeks}
                            months={months}
                            dayWidth={dayWidth}
                            weekWidth={WEEK_WIDTH}
                            monthWidth={monthWidth}
                            onPick={d => {
                              updateWorkingTasks(prev => {
                                const idx = prev.findIndex(x => x.id === t.id);
                                if (idx === -1) return prev;
                                const next = [...prev];
                                next[idx] = { ...prev[idx], startDate: d, endDate: d };
                                return next;
                              });
                            }}
                            onDragStart={e =>
                              setDragging({
                                taskId: t.id,
                                mode: 'schedule',
                                startX: e.clientX,
                                originalStart:
                                  timescale === 'day' ? dates[0] : timescale === 'week' ? weeks[0] : `${months[0] ?? '2025-07'}-01`,
                              })
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Subcomponents */

function TaskBar({
  mode,
  task,
  lists,
  dates,
  weeks,
  months,
  dayWidth,
  weekWidth,
  monthWidth,
  onDragStart,
}: {
  mode: Timescale;
  task: UITask;
  lists: (ListColumn & { id: string; colorClass?: string })[];
  dates: string[];
  weeks: string[];
  months: string[];
  dayWidth: number;
  weekWidth: number;
  monthWidth: number;
  onDragStart: (mode: 'move' | 'resize-start' | 'resize-end', e: React.MouseEvent) => void;
}) {
  const listColor = colorFromList(lists, task.listId);

  let left = 0;
  let width = 0;

  if (mode === 'day') {
    const startIdx = indexOfDate(dates, task.startDate!);
    const endIdx = indexOfDate(dates, task.endDate!);
    left = startIdx * dayWidth;
    width = Math.max(dayWidth, (endIdx - startIdx + 1) * dayWidth);
  } else if (mode === 'week') {
    const sIdx = weekIndexFromYMD(task.startDate!, weeks);
    const eIdx = weekIndexFromYMD(task.endDate!, weeks);
    left = sIdx * weekWidth;
    width = Math.max(weekWidth, (eIdx - sIdx + 1) * weekWidth);
  } else {
    const sIdx = monthIndexFromYMD(task.startDate!, months);
    const eIdx = monthIndexFromYMD(task.endDate!, months);
    left = sIdx * monthWidth;
    width = Math.max(monthWidth, (eIdx - sIdx + 1) * monthWidth);
  }

  return (
    <motion.div
      className="absolute"
      style={{
        left,
        top: (ROW_HEIGHT - BAR_HEIGHT) / 2,
        width,
        height: BAR_HEIGHT,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative h-full rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className={cn('absolute inset-0 rounded-lg opacity-20', listColor)} />
        <div className="absolute inset-0 flex items-center px-3">
          <span className="text-[12px] font-medium text-gray-800 truncate">{task.title}</span>
        </div>
        
        {/* Modern resize handles */}
        <div
          className="absolute left-0 top-0 h-full w-1 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-400 rounded-l-lg"
          onMouseDown={e => onDragStart('resize-start', e)}
          title="Resize start"
        />
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-400 rounded-r-lg"
          onMouseDown={e => onDragStart('resize-end', e)}
          title="Resize end"
        />
        
        {/* Drag handle */}
        <div 
          className="absolute inset-0 cursor-move rounded-lg" 
          onMouseDown={e => onDragStart('move', e)} 
          title="Drag to move"
        />
        
        {/* Priority indicator */}
        <div className={cn(
          "absolute top-1 right-1 w-2 h-2 rounded-full",
          task.priority === 'high' ? 'bg-red-500' :
          task.priority === 'medium' ? 'bg-yellow-500' :
          task.priority === 'low' ? 'bg-green-500' : 'bg-gray-400'
        )} />
      </div>
    </motion.div>
  );
}

function DueDiamond({
  mode,
  task,
  dates,
  weeks,
  months,
  dayWidth,
  weekWidth,
  monthWidth,
}: {
  mode: Timescale;
  task: UITask;
  dates: string[];
  weeks: string[];
  months: string[];
  dayWidth: number;
  weekWidth: number;
  monthWidth: number;
}) {
  const size = 14;
  const top = (ROW_HEIGHT - size) / 2;

  if (mode === 'day') {
    const idx = indexOfDate(dates, task.dueDate!);
    const center = idx * dayWidth + dayWidth / 2;
    return (
      <motion.div
        className="absolute bg-gradient-to-br from-orange-400 to-orange-600 rotate-45 shadow-sm hover:shadow-md transition-shadow duration-200"
        style={{ left: center - size / 2, top, width: size, height: size, borderRadius: 3 }}
        title={task.title}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
      />
    );
  } else if (mode === 'week') {
    const idx = weekIndexFromYMD(task.dueDate!, weeks);
    const center = idx * weekWidth + weekWidth / 2;
    return (
      <motion.div
        className="absolute bg-gradient-to-br from-orange-400 to-orange-600 rotate-45 shadow-sm hover:shadow-md transition-shadow duration-200"
        style={{ left: center - size / 2, top, width: size, height: size, borderRadius: 3 }}
        title={task.title}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
      />
    );
  } else {
    const idx = monthIndexFromYMD(task.dueDate!, months);
    const center = idx * monthWidth + monthWidth / 2;
    return (
      <motion.div
        className="absolute bg-gradient-to-br from-orange-400 to-orange-600 rotate-45 shadow-sm hover:shadow-md transition-shadow duration-200"
        style={{ left: center - size / 2, top, width: size, height: size, borderRadius: 3 }}
        title={task.title}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
      />
    );
  }
}

function ScheduleHint({
  mode,
  dates,
  weeks,
  months,
  dayWidth,
  weekWidth,
  monthWidth,
  onPick,
  onDragStart,
}: {
  mode: Timescale;
  dates: string[];
  weeks: string[];
  months: string[];
  dayWidth: number;
  weekWidth: number;
  monthWidth: number;
  onPick: (d: string) => void;
  onDragStart: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onClick={e => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (mode === 'day') {
          const idx = Math.max(0, Math.min(dates.length - 1, Math.floor(x / dayWidth)));
          onPick(dates[idx]);
        } else if (mode === 'week') {
          const idx = Math.max(0, Math.min(weeks.length - 1, Math.floor(x / weekWidth)));
          onPick(weeks[idx]);
        } else {
          const idx = Math.max(0, Math.min(months.length - 1, Math.floor(x / monthWidth)));
          const ymd = `${months[idx]}-01`;
          onPick(ymd);
        }
      }}
      onMouseDown={onDragStart}
      title="Click to schedule"
    />
  );
}

/* Utilities */

function phaseColorVar(phaseId: string, colorClass?: string) {
  // If colorClass is provided, extract the color from it
  if (colorClass) {
    const colorMatch = colorClass.match(/#[0-9A-Fa-f]{6}/);
    if (colorMatch) {
      return colorMatch[0];
    }
  }
  
  const colorMap: Record<string, string> = {
    __unscheduled__: '#9CA3AF',
    'phase-discovery': '#6B7280',
    'phase-concept': '#C7654F',
    'phase-dd': '#9CA3AF',
    'phase-technical': '#3B82F6',
    'phase-procurement': '#8B5CF6',
    'phase-implementation': '#10B981',
    'e06f2b59-6fac-4b47-b0e1-3a667efe37c0': '#9CA3AF', // Test Phase
  };
  const fallback = colorMap[phaseId] || '#CF7A5A';
  return `var(--phase-${phaseId}, ${fallback})`;
}

function colorFromList(lists: (ListColumn & { id: string; colorClass?: string })[], listId?: string) {
  const l = lists.find(x => x.id === listId);
  return l?.colorClass?.replace('text-', 'bg-') || 'bg-stone-700';
}

function enumerateDays(from: Date, to: Date) {
  const out: string[] = [];
  const cur = new Date(from);
  while (+cur <= +to) {
    out.push(toYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function toDate(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function shiftDate(d: Date, delta: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + delta);
  return n;
}
function shiftMonths(d: Date, delta: number) {
  const n = new Date(d);
  n.setMonth(n.getMonth() + delta);
  return n;
}
function startOfWeekMonday(d: Date) {
  const n = new Date(d);
  const day = n.getDay();
  const diff = (day + 6) % 7;
  n.setDate(n.getDate() - diff);
  n.setHours(0, 0, 0, 0);
  return n;
}
function endOfWeekSunday(d: Date) {
  const start = startOfWeekMonday(d);
  const n = new Date(start);
  n.setDate(n.getDate() + 6);
  n.setHours(23, 59, 59, 999);
  return n;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthIndexFromYMD(ymd: string, months: string[]) {
  const key = ymd.slice(0, 7);
  const idx = months.indexOf(key);
  if (idx >= 0) return idx;
  if (key < months[0]) return 0;
  if (key > months[months.length - 1]) return months.length - 1;
  return 0;
}
function indexOfDate(dates: string[], ymd: string) {
  const idx = dates.indexOf(ymd);
  if (idx >= 0) return idx;
  if (ymd < dates[0]) return 0;
  if (ymd > dates[dates.length - 1]) return dates.length - 1;
  return 0;
}

function weekIndexFromYMD(ymd: string, weeks: string[]) {
  const targetDate = toDate(ymd);
  const targetWeekStart = startOfWeekMonday(targetDate);
  const targetKey = toYMD(targetWeekStart);

  const idx = weeks.indexOf(targetKey);
  if (idx >= 0) return idx;

  // Find closest week
  for (let i = 0; i < weeks.length; i++) {
    const weekStart = toDate(weeks[i]);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (targetDate >= weekStart && targetDate <= weekEnd) {
      return i;
    }
  }

  if (targetKey < weeks[0]) return 0;
  if (targetKey > weeks[weeks.length - 1]) return weeks.length - 1;
  return 0;
}

function formatDatesTooltip(t: UITask) {
  if (t.startDate && t.endDate) return ` — ${t.startDate} → ${t.endDate}`;
  if (t.dueDate) return ` — due ${t.dueDate}`;
  return '';
}

/* Inline FilterGroup */
function FilterGroup<T extends string>({
  title,
  items,
  values,
  onToggle,
}: {
  title: string;
  items: { id: T; label: string }[];
  values: T[];
  onToggle: (id: T) => void;
}) {
  const [query, setQuery] = React.useState('');
  const filtered = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{title}</div>
      <Input
        placeholder={`Search ${title.toLowerCase()}`}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-ring)]"
      />
      <div className="space-y-2 max-h-60 overflow-auto pr-1">
        {filtered.map(i => (
          <label key={i.id} className="flex items-center gap-3 text-sm">
            <Checkbox checked={values.includes(i.id)} onCheckedChange={() => onToggle(i.id)} />
            <span>{i.label}</span>
          </label>
        ))}
        {filtered.length === 0 && <div className="text-sm text-muted-foreground">No results</div>}
      </div>
    </div>
  );
}
