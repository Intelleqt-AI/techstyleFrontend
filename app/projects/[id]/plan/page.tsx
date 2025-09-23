"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { ProjectNav } from "@/components/project-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CalendarRangeIcon,
  ChevronDown,
  Ellipsis,
  Maximize2,
  MoveHorizontal,
  Pencil,
  Plus,
  Redo2,
  Save,
  Trash2,
} from "lucide-react";

import type {
  ISODate,
  PlanPhase,
  WorkPackage,
  Milestone,
  PlanSnapshot,
} from "@/lib/plan-storage";
import { loadPlan, savePlan } from "@/lib/plan-storage";
import { TaskModal } from "@/components/tasks/task-modal";
import { useTasksStore } from "@/lib/stores/tasks-store";

/* =================== Date utils =================== */
const MS_DAY = 24 * 60 * 60 * 1000;
function ymd(d: Date): ISODate {
  return d.toISOString().slice(0, 10);
}
function parseISO(d: ISODate) {
  const [y, m, day] = d.split("-").map((n) => Number.parseInt(n, 10));
  return new Date(y, m - 1, day);
}
function addDaysISO(d: ISODate, days: number): ISODate {
  const dt = parseISO(d);
  dt.setDate(dt.getDate() + days);
  return ymd(dt);
}
function diffDays(a: ISODate, b: ISODate) {
  const A = parseISO(a).setHours(0, 0, 0, 0);
  const B = parseISO(b).setHours(0, 0, 0, 0);
  return Math.round((B - A) / MS_DAY);
}
function startOfWeekMonday(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun … 6 Sat
  const diff = (day + 6) % 7; // Mon=0
  x.setDate(x.getDate() - diff);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}
function endOfYear(d: Date) {
  return new Date(d.getFullYear(), 11, 31);
}
function daysInMonthOf(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function monthIndex(d: Date) {
  return d.getFullYear() * 12 + d.getMonth();
}
function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}
function formatShort(d: ISODate) {
  const dt = parseISO(d);
  return dt.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

/* =================== Visual scale =================== */
type Zoom = "week" | "month" | "quarter";

const DAY_WIDTH = 36; // day cell width (week mode)
const MONTH_WIDTH = 112; // month cell width (month & quarter)
const ROW_HEIGHT = 56;

type Column =
  | {
      kind: "day";
      iso: ISODate;
      width: number;
      weekday: number;
      isWeekend: boolean;
    }
  | {
      kind: "month";
      iso: ISODate;
      width: number;
      year: number;
      month: number;
      label: string;
      daysInMonth: number;
    };

/* =================== Brand colors =================== */
const BRAND_PHASE_COLORS = [
  "#0F172A", // deep navy
  "#C7654F", // clay
  "#8B5CF6", // violet
  "#10B981", // emerald
  "#F59E0B", // amber
  "#475569", // slate
  "#F43F5E", // rose
  "#14B8A6", // teal
];
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const bigint = Number.parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}
function phaseTheme(idx: number, custom?: string) {
  const base = custom || BRAND_PHASE_COLORS[idx % BRAND_PHASE_COLORS.length];
  const { r, g, b } = hexToRgb(base);
  return {
    base,
    bg: `rgba(${r}, ${g}, ${b}, 0.12)`,
    border: `rgba(${r}, ${g}, ${b}, 0.32)`,
    text: "#0f172a",
  };
}

/* =================== Seeds =================== */
function seedPhases(today = new Date()): PlanPhase[] {
  const start = ymd(today);
  const names = [
    "Discovery",
    "Concept Design",
    "Design Development",
    "Technical Drawings",
    "Client Review",
    "Procurement",
    "Site / Implementation",
  ];
  let cursor = start;
  return names.map((name, i) => {
    const dur = i < 2 ? 12 : i < 4 ? 16 : 14;
    const s = cursor;
    const e = addDaysISO(s, dur - 1);
    cursor = addDaysISO(e, 3);
    return {
      id: `p${i + 1}`,
      name,
      start: s,
      end: e,
      owner:
        [
          "Alex Morgan",
          "Jane Lee",
          "Mike Chen",
          "Sara Patel",
          "Chris Wood",
          "Dana Park",
        ][i % 6] || "Alex Morgan",
      progress: Math.random() * 0.6,
      risk: "Low",
      expanded: true,
      color: BRAND_PHASE_COLORS[i % BRAND_PHASE_COLORS.length],
    };
  });
}

/* =================== Component =================== */
export default function ProjectPlanPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "p-demo";
  const { toast } = useToast();

  // Tasks store (stable selectors only)
  const seedProject = useTasksStore((s) => s.seedProject);
  const lists = useTasksStore((s) => s.listsByProject[projectId] || []);
  const members = useTasksStore((s) => s.members);
  const createTask = useTasksStore((s) => s.createTask);
  const updateTask = useTasksStore((s) => s.updateTask);
  const getTasksByPhase = useTasksStore((s) => s.getTasksByPhase);

  useEffect(() => {
    seedProject(projectId);
  }, [projectId, seedProject]);

  // Plan state
  const [phases, setPhases] = useState<PlanPhase[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const loaded = loadPlan(projectId);
    if (loaded) {
      setPhases(loaded.phases);
      setWorkPackages(loaded.workPackages);
      setMilestones(loaded.milestones);
    } else {
      const seed = seedPhases();
      setPhases(seed);
      setWorkPackages([]);
      setMilestones([
        {
          id: "m1",
          phaseId: seed[1].id,
          name: "Concept sign‑off",
          date: seed[1].end,
        },
        {
          id: "m2",
          phaseId: seed[4].id,
          name: "Client approval",
          date: addDaysISO(seed[4].start, 3),
        },
      ]);
    }
  }, [projectId]);

  const hasPhases = phases.length > 0;

  // Zoom + infinite window
  const [zoom, setZoom] = useState<Zoom>("month");

  // Week view window: 12 weeks (84 days) starting from the Monday of the current month
  const [weekStartISO, setWeekStartISO] = useState<ISODate>(() => {
    const today = new Date();
    const mStart = startOfMonth(today);
    return ymd(startOfWeekMonday(mStart));
  });
  const [weekCount, setWeekCount] = useState(12); // visible weeks; extends on scroll

  // Month/Quarter window: # of years
  const [yearStart, setYearStart] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [yearCount, setYearCount] = useState(1);

  // Chip toggles
  const [showPhases, setShowPhases] = useState(true);
  const [showTasks, setShowTasks] = useState(false);

  // Hover/focus row
  const [hoveredPhaseId, setHoveredPhaseId] = useState<string | null>(null);
  const [drawerPhaseId, setDrawerPhaseId] = useState<string | null>(null);
  const drawerPhase = phases.find((p) => p.id === drawerPhaseId) || null;

  // Build columns (shared by header and rows)
  const columns: Column[] = useMemo(() => {
    if (zoom === "week") {
      const cols: Column[] = [];
      const start = parseISO(weekStartISO);
      for (let w = 0; w < weekCount; w++) {
        for (let d = 0; d < 7; d++) {
          const dt = new Date(start.getTime() + (w * 7 + d) * MS_DAY);
          const wd = dt.getDay();
          cols.push({
            kind: "day",
            iso: ymd(dt),
            width: DAY_WIDTH,
            weekday: wd,
            isWeekend: wd === 0 || wd === 6,
          });
        }
      }
      return cols;
    }
    // month & quarter: months as columns
    const cols: Column[] = [];
    for (let y = 0; y < yearCount; y++) {
      const y0 = yearStart + y;
      for (let m = 0; m < 12; m++) {
        const dt = new Date(y0, m, 1);
        cols.push({
          kind: "month",
          iso: ymd(dt),
          width: MONTH_WIDTH,
          year: y0,
          month: m,
          label: dt.toLocaleDateString("en-GB", { month: "short" }),
          daysInMonth: daysInMonthOf(dt),
        });
      }
    }
    return cols;
  }, [zoom, weekStartISO, weekCount, yearStart, yearCount]);

  const totalWidth = useMemo(
    () => columns.reduce((acc, c) => acc + c.width, 0),
    [columns]
  );
  const gridTemplateColumns = useMemo(
    () => columns.map((c) => `${c.width}px`).join(" "),
    [columns]
  );

  // View date range
  const viewStartISO: ISODate = useMemo(
    () => (columns.length ? columns[0].iso : ymd(new Date())),
    [columns]
  );
  const viewEndISO: ISODate = useMemo(() => {
    if (!columns.length) return ymd(new Date());
    const last = columns[columns.length - 1];
    if (last.kind === "day") return last.iso;
    return ymd(endOfMonth(parseISO(last.iso)));
  }, [columns]);

  // Date -> x px
  function dateToPx(iso: ISODate) {
    if (!columns.length) return 0;
    if (columns[0].kind === "day") {
      const daysOffset = Math.max(0, diffDays(viewStartISO, iso));
      return daysOffset * DAY_WIDTH;
    }
    const firstMonth = parseISO(columns[0].iso);
    const target = parseISO(iso);
    let monthsBetween = monthIndex(target) - monthIndex(firstMonth);
    monthsBetween = Math.max(0, monthsBetween);
    const monthsPx = monthsBetween * MONTH_WIDTH;
    const dim = daysInMonthOf(target) || 30;
    const frac = (target.getDate() - 1) / dim;
    return monthsPx + frac * MONTH_WIDTH;
  }

  // Bounds for phases
  function boundsForPhase(start: ISODate, end: ISODate) {
    const s = start < viewStartISO ? viewStartISO : start;
    const e = end > viewEndISO ? viewEndISO : end;
    if (s > viewEndISO || e < viewStartISO) return { left: -9999, width: 0 };
    const left = dateToPx(s);
    const width = Math.max(
      10,
      dateToPx(e) -
        dateToPx(s) +
        (columns[0].kind === "day" ? DAY_WIDTH : MONTH_WIDTH * 0.02)
    );
    return { left, width };
  }

  // Bounds for tasks (single day or duration)
  function boundsForTask(dateISO: ISODate, estimateHours?: number) {
    const start = dateISO;
    const days = estimateHours ? Math.max(1, Math.ceil(estimateHours / 8)) : 1;
    const end = addDaysISO(start, days - 1);
    return boundsForPhase(start, end);
  }

  // Today line
  const todayISO = ymd(new Date());
  const todayLeft = useMemo(() => {
    if (todayISO < viewStartISO || todayISO > viewEndISO) return null;
    return dateToPx(todayISO);
  }, [todayISO, viewStartISO, viewEndISO]);

  /* =================== Drag / Resize =================== */
  type DragMode = "move" | "resize-start" | "resize-end";
  const dragRef = useRef<{
    id?: string;
    mode?: DragMode;
    startX?: number;
    origStart?: ISODate;
    origEnd?: ISODate;
  }>({});

  function pxToDaysDelta(pxDelta: number, anchorISO?: ISODate) {
    if (!columns.length) return 0;
    if (columns[0].kind === "day") {
      return Math.round(pxDelta / DAY_WIDTH);
    }
    // months -> approximate by anchor month
    const anchor = anchorISO ? parseISO(anchorISO) : parseISO(viewStartISO);
    const dim = daysInMonthOf(anchor) || 30;
    const daysPerPx = dim / MONTH_WIDTH;
    return Math.round(pxDelta * daysPerPx);
  }

  function startDrag(e: React.PointerEvent, phaseId: string, mode: DragMode) {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const p = phases.find((x) => x.id === phaseId)!;
    dragRef.current = {
      id: phaseId,
      mode,
      startX: e.clientX,
      origStart: p.start,
      origEnd: p.end,
    };
  }
  function onMove(e: React.PointerEvent) {
    const a = dragRef.current;
    if (!a?.id || !a.mode || a.startX == null) return;
    const deltaPx = e.clientX - a.startX;
    if (Math.abs(deltaPx) < 1) return;
    const deltaDays = pxToDaysDelta(deltaPx, a.origStart);
    if (deltaDays === 0) return;
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== a.id) return p;
        if (a.mode === "move") {
          return {
            ...p,
            start: addDaysISO(a.origStart!, deltaDays),
            end: addDaysISO(a.origEnd!, deltaDays),
          };
        } else if (a.mode === "resize-start") {
          const ns = addDaysISO(a.origStart!, deltaDays);
          return diffDays(ns, p.end) < 0 ? { ...p, start: ns } : p;
        } else {
          const ne = addDaysISO(a.origEnd!, deltaDays);
          return diffDays(p.start, ne) >= 0 ? { ...p, end: ne } : p;
        }
      })
    );
  }
  function endDrag() {
    dragRef.current = {};
  }

  /* =================== Infinite scroll =================== */
  const scrollRef = useRef<HTMLDivElement>(null);

  function extendIfNeeded() {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const pad = 400;
    const atLeft = scroller.scrollLeft < pad;
    const atRight =
      scroller.scrollLeft + scroller.clientWidth > scroller.scrollWidth - pad;

    if (zoom === "week") {
      if (atRight) {
        setWeekCount((c) => c + 4); // append 4 weeks
      }
      if (atLeft) {
        setWeekStartISO((s) => addDaysISO(s, -28)); // prepend 4 weeks
        setWeekCount((c) => c + 4);
        requestAnimationFrame(() => {
          if (scrollRef.current)
            scrollRef.current.scrollLeft += 4 * 7 * DAY_WIDTH;
        });
      }
    } else {
      const yearPx = 12 * MONTH_WIDTH;
      if (atRight) {
        setYearCount((c) => c + 1); // append a year
      }
      if (atLeft) {
        setYearStart((y) => y - 1); // prepend a year
        setYearCount((c) => c + 1);
        requestAnimationFrame(() => {
          if (scrollRef.current) scrollRef.current.scrollLeft += yearPx;
        });
      }
    }
  }

  // Mode switch helpers
  function setMode(next: Zoom) {
    const now = new Date();
    if (next === "week") {
      setWeekStartISO(ymd(startOfWeekMonday(startOfMonth(now))));
      setWeekCount(12);
    } else {
      setYearStart(now.getFullYear());
      setYearCount(1);
    }
    setZoom(next);
    // re-center after paint
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    });
  }

  /* =================== Actions =================== */
  function onFit() {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollLeft = Math.max(
      0,
      totalWidth / 2 - scroller.clientWidth / 2
    );
  }
  function onAutoLayout() {
    setPhases((prev) => {
      const sorted = [...prev].sort(
        (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
      );
      let cursor = sorted[0]?.start || ymd(new Date());
      return sorted.map((p, idx) => {
        const dur = diffDays(p.start, p.end) + 1;
        const s = idx === 0 ? p.start : addDaysISO(cursor, 3);
        const e = addDaysISO(s, dur - 1);
        cursor = e;
        return { ...p, start: s, end: e };
      });
    });
    toast({
      title: "Auto‑layout applied",
      description: "Phases spaced while preserving duration.",
    });
  }
  function onSavePlan() {
    const ok = savePlan(projectId, {
      phases,
      workPackages,
      milestones,
    } as PlanSnapshot);
    toast({
      title: ok ? "Plan saved" : "Save failed",
      description: ok ? "Saved locally." : "Please retry.",
    });
  }

  // Tasks in a row
  function taskBarsForPhase(phaseId: string) {
    const tasks = getTasksByPhase(projectId, phaseId);
    return tasks
      .filter((t) => t.dueDate)
      .map((t) => {
        const b = boundsForTask(t.dueDate!, t.estimateHours);
        return { ...t, left: b.left, width: b.width };
      })
      .filter((x) => x.width > 0 && x.left > -5000);
  }

  // Function to add a phase
  function addPhase() {
    const newPhase: PlanPhase = {
      id: `p${phases.length + 1}`,
      name: `Phase ${phases.length + 1}`,
      start: addDaysISO(phases[phases.length - 1]?.end || ymd(new Date()), 3),
      end: addDaysISO(
        addDaysISO(phases[phases.length - 1]?.end || ymd(new Date()), 3),
        14
      ),
      owner: "Alex Morgan",
      progress: 0,
      risk: "Low",
      expanded: true,
      color: BRAND_PHASE_COLORS[phases.length % BRAND_PHASE_COLORS.length],
    };
    setPhases((prev) => [...prev, newPhase]);
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        <ProjectNav projectId={projectId} />

        {/* Controls row – floating on grey canvas (no container) */}
        <div
          role="region"
          aria-label="Plan controls"
          className="flex flex-wrap items-center gap-2.5 py-2 md:py-3">
          {/* Chip toggles */}
          <div className="inline-flex items-center gap-2">
            <button
              className={cn(
                "h-9 px-3 rounded-md border text-sm",
                showPhases
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
              onClick={() => setShowPhases((v) => !v)}
              aria-pressed={showPhases}>
              Phases
            </button>
            <button
              className={cn(
                "h-9 px-3 rounded-md border text-sm",
                showTasks
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
              onClick={() => setShowTasks((v) => !v)}
              aria-pressed={showTasks}>
              Show tasks
            </button>
          </div>

          {/* Zoom segmented control */}
          <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {(["week", "month", "quarter"] as Zoom[]).map((z) => (
              <button
                key={z}
                className={cn(
                  "px-3 h-9 rounded-md text-sm transition-colors",
                  zoom === z
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => setMode(z)}
                aria-pressed={zoom === z}>
                {z.charAt(0).toUpperCase() + z.slice(1)}
              </button>
            ))}
          </div>

          {/* Actions right-aligned */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 bg-transparent"
              onClick={onFit}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Fit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 bg-transparent"
              onClick={onAutoLayout}>
              <Redo2 className="h-4 w-4 mr-2" />
              Auto‑layout
            </Button>
            <Button size="sm" className="h-9" onClick={onSavePlan}>
              <Save className="h-4 w-4 mr-2" />
              Save plan
            </Button>
          </div>
        </div>

        {!hasPhases ? (
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="text-gray-900 font-medium mb-2">
                No phases yet
              </div>
              <p className="text-gray-600 mb-4">
                Create the first phase to start planning.
              </p>
              <Button
                onClick={addPhase}
                className="h-9 bg-clay-500 hover:bg-clay-600 border border-terracotta-700/20 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add phase
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 overflow-hidden">
            <div className="grid" style={{ gridTemplateColumns: "360px 1fr" }}>
              {/* Left rail */}
              <div className="bg-white border-r border-gray-200">
                <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    Phases & work packages
                  </div>
                  <Button
                    size="sm"
                    className="h-8 bg-clay-500 hover:bg-clay-600 border border-terracotta-700/20 text-white"
                    onClick={addPhase}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add phase
                  </Button>
                </div>

                <div>
                  {phases.map((p, idx) => {
                    const phaseWPs = workPackages.filter(
                      (w) => w.phaseId === p.id
                    );
                    const theme = phaseTheme(idx, p.color);
                    return (
                      <div key={p.id} className="border-b border-gray-100">
                        {/* Phase row header – exact ROW_HEIGHT to align with timeline row */}
                        <div
                          className="flex items-center gap-3 px-5"
                          style={{ height: ROW_HEIGHT }}
                          title={`${p.name} • ${formatShort(
                            p.start
                          )} – ${formatShort(p.end)}`}
                          onMouseEnter={() => setHoveredPhaseId(p.id)}
                          onMouseLeave={() =>
                            setHoveredPhaseId((id) => (id === p.id ? null : id))
                          }
                          onClick={() => setDrawerPhaseId(p.id)}>
                          <button
                            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhases((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, expanded: !x.expanded }
                                    : x
                                )
                              );
                            }}
                            aria-label={
                              p.expanded ? "Collapse phase" : "Expand phase"
                            }>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                p.expanded ? "rotate-0" : "-rotate-90"
                              )}
                            />
                          </button>

                          <div
                            className="h-8 w-1.5 rounded-full"
                            style={{
                              backgroundColor: theme.base,
                              opacity: 0.9,
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatShort(p.start)} – {formatShort(p.end)}
                            </div>
                          </div>

                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[11px]">
                              {initials(p.owner) || "PM"}
                            </AvatarFallback>
                          </Avatar>

                          <span className="inline-flex items-center px-2 h-7 rounded-full text-xs bg-gray-100 border border-gray-200 text-gray-700">
                            {Math.round(p.progress * 100)}%
                          </span>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-600">
                                <Ellipsis className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => setDrawerPhaseId(p.id)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const ph = phases.find((x) => x.id === p.id)!;
                                  const wp: WorkPackage = {
                                    id: `w${Date.now()}`,
                                    phaseId: p.id,
                                    name: "New work package",
                                    start: ph.start,
                                    end: ph.end,
                                  };
                                  setWorkPackages((prev) => [wp, ...prev]);
                                }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add work package
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPhases((prev) =>
                                    prev.filter((x) => x.id !== p.id)
                                  );
                                  setWorkPackages((prev) =>
                                    prev.filter((x) => x.phaseId !== p.id)
                                  );
                                  setMilestones((prev) =>
                                    prev.filter((x) => x.phaseId !== p.id)
                                  );
                                  if (drawerPhaseId === p.id)
                                    setDrawerPhaseId(null);
                                }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete phase
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {p.expanded &&
                          phaseWPs.map((w) => (
                            <div
                              key={w.id}
                              className="pl-14 pr-5 py-3 border-t border-gray-100">
                              <div className="grid grid-cols-5 items-center gap-2">
                                <Input
                                  className="col-span-2 h-8"
                                  value={w.name}
                                  onChange={(e) =>
                                    setWorkPackages((prev) =>
                                      prev.map((x) =>
                                        x.id === w.id
                                          ? { ...x, name: e.target.value }
                                          : x
                                      )
                                    )
                                  }
                                />
                                <Input
                                  className="h-8"
                                  type="date"
                                  value={w.start}
                                  onChange={(e) =>
                                    setWorkPackages((prev) =>
                                      prev.map((x) =>
                                        x.id === w.id
                                          ? { ...x, start: e.target.value }
                                          : x
                                      )
                                    )
                                  }
                                />
                                <Input
                                  className="h-8"
                                  type="date"
                                  value={w.end}
                                  onChange={(e) =>
                                    setWorkPackages((prev) =>
                                      prev.map((x) =>
                                        x.id === w.id
                                          ? { ...x, end: e.target.value }
                                          : x
                                      )
                                    )
                                  }
                                />
                                <div className="flex items-center justify-end">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      setWorkPackages((prev) =>
                                        prev.filter((x) => x.id !== w.id)
                                      )
                                    }>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline: header + rows in one horizontal scroller; remove border-l to align with left rail */}
              <div className="relative">
                <div
                  className="overflow-x-auto"
                  ref={scrollRef}
                  onScroll={extendIfNeeded}>
                  {/* Ensures scroll width is explicit for all modes */}
                  <div style={{ width: `${totalWidth}px` }}>
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                      {/* Group row: Weeks or Quarters per year */}
                      <div
                        className="grid border-b border-gray-200"
                        style={{ gridTemplateColumns }}>
                        {columns[0]?.kind === "day"
                          ? Array.from({
                              length: Math.ceil(columns.length / 7),
                            }).map((_, i) => (
                              <div
                                key={`wk-${i}`}
                                className="py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-100"
                                style={{ gridColumn: "span 7" }}>
                                {`Week ${i + 1}`}
                              </div>
                            ))
                          : Array.from({ length: yearCount }).map((_, y) => (
                              <div key={`yr-q-${y}`} className="contents">
                                {[1, 2, 3, 4].map((q) => (
                                  <div
                                    key={`q-${y}-${q}`}
                                    className="py-2 text-xs font-medium text-gray-700 text-center border-r border-gray-100"
                                    style={{ gridColumn: "span 3" }}>
                                    {`Q${q}`}
                                  </div>
                                ))}
                              </div>
                            ))}
                      </div>

                      {/* Labels row (days or months) */}
                      <div className="grid" style={{ gridTemplateColumns }}>
                        {columns.map((c, idx) =>
                          c.kind === "day" ? (
                            <div
                              key={c.iso}
                              className={cn(
                                "text-center text-[11px] text-gray-700 border-r border-gray-100 py-1.5",
                                c.isWeekend ? "bg-white" : "bg-gray-50"
                              )}>
                              {parseISO(c.iso).getDate()}
                            </div>
                          ) : (
                            <div
                              key={c.iso + idx}
                              className="text-center text-[11px] text-gray-700 border-r border-gray-100 py-1.5 bg-gray-50">
                              {c.label}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Rows */}
                    <div>
                      {phases.map((row, idx) => {
                        const theme = phaseTheme(idx, row.color);
                        const { left, width } = boundsForPhase(
                          row.start,
                          row.end
                        );
                        const showRowTasks =
                          showTasks &&
                          (hoveredPhaseId === row.id ||
                            drawerPhaseId === row.id);
                        const rowTasks = showRowTasks
                          ? taskBarsForPhase(row.id)
                          : [];
                        return (
                          <div
                            key={row.id}
                            className="border-b border-gray-100"
                            style={{ height: ROW_HEIGHT }}
                            onMouseEnter={() => setHoveredPhaseId(row.id)}
                            onMouseLeave={() =>
                              setHoveredPhaseId((id) =>
                                id === row.id ? null : id
                              )
                            }>
                            <div className="relative h-full">
                              {/* Background vertical ticks – EXACT same grid as header */}
                              <div
                                className="grid absolute inset-0"
                                style={{ gridTemplateColumns }}>
                                {columns.map((c, i) => (
                                  <div
                                    key={
                                      c.kind === "day" ? c.iso : `${c.iso}-${i}`
                                    }
                                    className={cn(
                                      "border-r h-full",
                                      "border-gray-50",
                                      c.kind === "day" &&
                                        parseISO(c.iso).getDay() === 1 &&
                                        "bg-gray-50/40"
                                    )}
                                  />
                                ))}
                              </div>

                              {/* Today line */}
                              {todayLeft !== null && (
                                <div
                                  className="absolute top-0 bottom-0 w-px"
                                  style={{
                                    left: todayLeft,
                                    backgroundColor: "rgba(231, 76, 60, 0.7)",
                                  }}
                                  aria-hidden
                                />
                              )}

                              {/* Phase bar */}
                              {showPhases && width > 0 && left > -5000 && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="absolute top-2 h-9 rounded-full flex items-center shadow-sm"
                                  style={{
                                    left,
                                    width,
                                    backgroundColor: theme.bg,
                                    border: `1px solid ${theme.border}`,
                                  }}
                                  onPointerDown={(e) =>
                                    startDrag(e, row.id, "move")
                                  }
                                  onPointerMove={onMove}
                                  onPointerUp={endDrag}
                                  onDoubleClick={() => setDrawerPhaseId(row.id)}
                                  title={`${row.name} • ${formatShort(
                                    row.start
                                  )} – ${formatShort(row.end)}`}>
                                  {/* Resize handles */}
                                  <div
                                    className="h-full w-2 cursor-ew-resize rounded-l-full"
                                    style={{
                                      backgroundColor: "rgba(0,0,0,0.06)",
                                    }}
                                    onPointerDown={(e) => {
                                      e.stopPropagation();
                                      startDrag(e, row.id, "resize-start");
                                    }}
                                    onPointerMove={onMove}
                                    onPointerUp={endDrag}
                                  />
                                  <div
                                    className="px-3 text-xs font-medium truncate"
                                    style={{ color: theme.text }}>
                                    {row.name}
                                  </div>
                                  <div
                                    className="absolute left-0 top-0 bottom-0 rounded-l-full"
                                    style={{
                                      width: `${Math.round(
                                        row.progress * 100
                                      )}%`,
                                      backgroundColor: "rgba(0,0,0,0.08)",
                                    }}
                                  />
                                  <div
                                    className="absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r-full"
                                    style={{
                                      backgroundColor: "rgba(0,0,0,0.06)",
                                    }}
                                    onPointerDown={(e) => {
                                      e.stopPropagation();
                                      startDrag(e, row.id, "resize-end");
                                    }}
                                    onPointerMove={onMove}
                                    onPointerUp={endDrag}
                                  />
                                </div>
                              )}

                              {/* Tasks (tiny rounded bars) */}
                              {showRowTasks &&
                                rowTasks.map((t) => {
                                  const priority = t.priority;
                                  const color =
                                    priority === "high"
                                      ? "#B75A41" // terracotta-600
                                      : priority === "medium"
                                      ? "#E07A57" // clay-500
                                      : "#B6B0A4"; // greige-500
                                  return (
                                    <div
                                      key={t.id}
                                      className="absolute h-2 rounded-full"
                                      style={{
                                        left: t.left,
                                        width: Math.max(6, t.width * 0.9),
                                        top: 38, // sits within lane under phase bar
                                        backgroundColor: color,
                                        opacity: 0.9,
                                      }}
                                      title={`${t.title}${
                                        t.dueDate
                                          ? ` • ${formatShort(t.dueDate)}`
                                          : ""
                                      }`}
                                    />
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="text-xs text-gray-500 pt-1 md:pt-2">
          Week shows 12 weeks (84 days) and extends while you scroll. Month
          shows a full 12‑month year and extends across years. Quarter groups
          the 12 months into Q1–Q4 and also extends across years. The header and
          rows share the same grid to keep all lines perfectly aligned.
        </div>
      </div>

      {/* Phase Drawer */}
      <Sheet
        open={!!drawerPhase}
        onOpenChange={(o) => !o && setDrawerPhaseId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[520px]">
          {drawerPhase && (
            <>
              <SheetHeader>
                <SheetTitle>{drawerPhase.name}</SheetTitle>
                <SheetDescription>
                  Phase details, milestones and linked tasks.
                </SheetDescription>
              </SheetHeader>

              {/* Summary */}
              <div className="mt-6 space-y-3">
                <Card className="border-gray-200">
                  <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Start</div>
                      <Input
                        type="date"
                        value={drawerPhase.start}
                        onChange={(e) =>
                          setPhases((prev) =>
                            prev.map((p) =>
                              p.id === drawerPhase.id
                                ? { ...p, start: e.target.value }
                                : p
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <div className="text-gray-500">End</div>
                      <Input
                        type="date"
                        value={drawerPhase.end}
                        onChange={(e) =>
                          setPhases((prev) =>
                            prev.map((p) =>
                              p.id === drawerPhase.id
                                ? { ...p, end: e.target.value }
                                : p
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <div className="text-gray-500">Duration</div>
                      <div className="font-medium">
                        {Math.max(
                          1,
                          diffDays(drawerPhase.start, drawerPhase.end) + 1
                        )}{" "}
                        days
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Owner</div>
                      <div className="font-medium">{drawerPhase.owner}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Progress</div>
                      <div className="font-medium">
                        {Math.round(drawerPhase.progress * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Risk</div>
                      <div className="font-medium">
                        {drawerPhase.risk || "—"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card className="border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    {milestones
                      .filter((m) => m.phaseId === drawerPhase.id)
                      .map((m) => (
                        <div
                          key={m.id}
                          className="grid grid-cols-7 items-center gap-2">
                          <Input
                            className="col-span-4"
                            value={m.name}
                            onChange={(e) =>
                              setMilestones((prev) =>
                                prev.map((x) =>
                                  x.id === m.id
                                    ? { ...x, name: e.target.value }
                                    : x
                                )
                              )
                            }
                          />
                          <Input
                            className="col-span-2"
                            type="date"
                            value={m.date}
                            onChange={(e) =>
                              setMilestones((prev) =>
                                prev.map((x) =>
                                  x.id === m.id
                                    ? { ...x, date: e.target.value }
                                    : x
                                )
                              )
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setMilestones((prev) =>
                                prev.filter((x) => x.id !== m.id)
                              )
                            }>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMilestones((prev) => [
                          ...prev,
                          {
                            id: `m${Date.now()}`,
                            phaseId: drawerPhase.id,
                            name: "New milestone",
                            date: drawerPhase.end,
                          },
                        ])
                      }>
                      <Plus className="h-4 w-4 mr-2" />
                      Add milestone
                    </Button>
                  </CardContent>
                </Card>

                {/* Linked Tasks (compact) */}
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">
                      Tasks in this phase
                    </div>
                    <div className="text-xs text-gray-500">
                      Toggle "Show tasks" in the header to preview tasks inside
                      the timeline.
                    </div>
                  </CardContent>
                </Card>
              </div>

              <SheetFooter className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent">
                    <MoveHorizontal className="h-4 w-4 mr-2" />
                    Auto‑sequence tasks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() =>
                      toast({
                        title: "Calendar event created (stub)",
                        description:
                          "A spanning calendar entry would be created for this phase.",
                      })
                    }>
                    <CalendarRangeIcon className="h-4 w-4 mr-2" />
                    Block time in Calendar
                  </Button>
                </div>
                <Button onClick={() => setDrawerPhaseId(null)}>Close</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Task modal */}
      <TaskModal
        open={!!drawerPhase}
        onOpenChange={(open) => !open && setDrawerPhaseId(null)}
        projectId={projectId}
        lists={lists}
        phases={phases.map((p) => ({ id: p.id, name: p.name }))}
        team={members}
        defaultListId={lists[0]?.id}
        taskToEdit={null}
        onSave={(payload) => {
          if (payload.id) updateTask(payload.id, payload);
          else createTask(payload);
        }}
      />
    </main>
  );
}
