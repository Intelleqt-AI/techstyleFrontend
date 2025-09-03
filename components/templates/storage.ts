import { DEFAULT_PHASES, DEFAULT_TASKS_PER_PHASE, DEFAULT_WORK_PACKAGES } from './defaults';
import type { Phase, WorkPackage } from './types';

const LS_KEYS = {
  PHASES: 'ts_templates_phases_v1',
  WORK: 'ts_templates_work_packages_v1',
  TASKS: 'ts_templates_tasks_v1',
  STUDIO_DEFAULT: 'ts_templates_studio_default_v1',
} as const;

export type TemplatesBundle = {
  phases: Phase[];
  workPackages: WorkPackage[];
  tasksPerPhase: Record<string, string>;
};

export function loadTemplates(): TemplatesBundle {
  if (typeof window === 'undefined') {
    return { phases: DEFAULT_PHASES, workPackages: DEFAULT_WORK_PACKAGES, tasksPerPhase: DEFAULT_TASKS_PER_PHASE };
  }
  try {
    const phases = JSON.parse(localStorage.getItem(LS_KEYS.PHASES) || 'null') ?? DEFAULT_PHASES;
    const workPackages = JSON.parse(localStorage.getItem(LS_KEYS.WORK) || 'null') ?? DEFAULT_WORK_PACKAGES;
    const tasksPerPhase = JSON.parse(localStorage.getItem(LS_KEYS.TASKS) || 'null') ?? DEFAULT_TASKS_PER_PHASE;
    return { phases, workPackages, tasksPerPhase };
  } catch {
    return { phases: DEFAULT_PHASES, workPackages: DEFAULT_WORK_PACKAGES, tasksPerPhase: DEFAULT_TASKS_PER_PHASE };
  }
}

export function saveTemplates(bundle: TemplatesBundle) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEYS.PHASES, JSON.stringify(bundle.phases));
  localStorage.setItem(LS_KEYS.WORK, JSON.stringify(bundle.workPackages));
  localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(bundle.tasksPerPhase));
}

export function resetToTechstylesDefaults(): TemplatesBundle {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_KEYS.PHASES);
    localStorage.removeItem(LS_KEYS.WORK);
    localStorage.removeItem(LS_KEYS.TASKS);
  }
  return { phases: DEFAULT_PHASES, workPackages: DEFAULT_WORK_PACKAGES, tasksPerPhase: DEFAULT_TASKS_PER_PHASE };
}

export function saveAsStudioDefault(bundle: TemplatesBundle) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEYS.STUDIO_DEFAULT, JSON.stringify(bundle));
}

// Load previously saved studio default (if any), else fall back to current saved templates or Techstyles defaults
export function loadStudioDefault(): TemplatesBundle {
  if (typeof window === 'undefined') {
    return { phases: DEFAULT_PHASES, workPackages: DEFAULT_WORK_PACKAGES, tasksPerPhase: DEFAULT_TASKS_PER_PHASE };
  }
  const raw = localStorage.getItem(LS_KEYS.STUDIO_DEFAULT);
  if (!raw) return loadTemplates();
  try {
    return JSON.parse(raw) as TemplatesBundle;
  } catch {
    return loadTemplates();
  }
}
