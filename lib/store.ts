import { create } from 'zustand';
import { apifyActors, type ApifyActor, type ActorCategory, type ActorParamField } from './apify-catalog';

export type OutputFormat = 'json' | 'csv' | 'excel' | 'pdf';
export type AppView = 'catalog' | 'discover' | 'configure' | 'results' | 'history' | 'settings' | 'admin' | 'ai-search' | 'auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface RunState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  runId: string | null;
  progress: number;
  elapsed: number;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  actorId: string;
  actorName: string;
  inputParams: string;
  status: string;
  resultsCount: number;
  runId: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface ApifyStore {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authView: 'login' | 'register';
  selectedActor: ApifyActor | null;
  currentView: AppView;
  customActors: ApifyActor[];
  formValues: Record<string, any>;
  outputFormat: OutputFormat;
  selectedFields: string[];
  maxResults: number;
  currentRun: RunState;
  results: any[];
  searchHistory: HistoryItem[];
  searchQuery: string;
  sidebarOpen: boolean;
  activeCategory: ActorCategory | 'all';
  apiKeyConfigured: boolean;

  allActors: () => ApifyActor[];
  getApiKeyHeaders: () => Record<string, string>;

  setActor: (actor: ApifyActor | null) => void;
  setView: (view: AppView) => void;
  setCustomActors: (actors: any[]) => void;
  removeCustomActor: (customId: string) => void;
  updateFormField: (key: string, value: any) => void;
  resetForm: () => void;
  setOutputFormat: (format: OutputFormat) => void;
  setSelectedFields: (fields: string[]) => void;
  toggleField: (field: string) => void;
  setMaxResults: (max: number) => void;
  setRun: (run: Partial<RunState>) => void;
  setResults: (results: any[]) => void;
  setSearchHistory: (history: HistoryItem[]) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveCategory: (category: ActorCategory | 'all') => void;
  setApiKeyConfigured: (configured: boolean) => void;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthView: (view: 'login' | 'register') => void;
  logout: () => void;
  resetAll: () => void;
}

const initialState = {
  currentRun: {
    status: 'idle' as const,
    runId: null as string | null,
    progress: 0,
    elapsed: 0,
    error: null as string | null,
  },
};

function dbActorToApifyActor(dbActor: any): ApifyActor {
  try {
    return {
      id: dbActor.actorId,
      name: dbActor.name,
      description: dbActor.description || '',
      category: (dbActor.category || 'custom') as ActorCategory,
      icon: dbActor.icon || 'Globe',
      color: dbActor.color || '#6366f1',
      inputSchema: typeof dbActor.inputSchema === 'string'
        ? JSON.parse(dbActor.inputSchema || '[]')
        : (dbActor.inputSchema || []),
      outputFields: typeof dbActor.outputFields === 'string'
        ? JSON.parse(dbActor.outputFields || '[]')
        : (dbActor.outputFields || []),
      pricingInfo: dbActor.pricingInfo || '',
      isCustom: true,
      customId: dbActor.id,
    };
  } catch {
    return {
      id: dbActor.actorId,
      name: dbActor.name,
      description: dbActor.description || '',
      category: 'custom' as ActorCategory,
      icon: 'Globe',
      color: '#6366f1',
      inputSchema: [],
      outputFields: [],
      pricingInfo: '',
      isCustom: true,
      customId: dbActor.id,
    };
  }
}

export const useApifyStore = create<ApifyStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  authLoading: true,
  authView: 'login',
  selectedActor: null,
  currentView: 'catalog',
  customActors: [],
  formValues: {},
  outputFormat: 'json',
  selectedFields: [],
  maxResults: 20,
  currentRun: { ...initialState.currentRun },
  results: [],
  searchHistory: [],
  searchQuery: '',
  sidebarOpen: true,
  apiKeyConfigured: false,
  activeCategory: 'all',

  allActors: () => {
    const { customActors } = get();
    const convertedCustom = customActors.map((a) => {
      if (a.isCustom) return a;
      return dbActorToApifyActor(a);
    });
    return [...apifyActors, ...convertedCustom];
  },

  // Get API key from localStorage and return as headers
  getApiKeyHeaders: () => {
    if (typeof window === 'undefined') return {};
    const key = localStorage.getItem('apify_api_key');
    if (!key) return {};
    return { 'x-apify-key': key };
  },

  setActor: (actor) => {
    const state = get();
    set({
      selectedActor: actor,
      formValues: actor
        ? actor.inputSchema.reduce(
            (acc, field) => {
              acc[field.key] = field.default ?? (field.type === 'number' ? 0 : field.type === 'boolean' ? false : '');
              return acc;
            },
            {} as Record<string, any>
          )
        : {},
      selectedFields: actor ? [...actor.outputFields] : [],
      currentView: actor ? 'configure' : 'catalog',
      results: [],
      currentRun: { ...initialState.currentRun },
    });
  },

  setView: (view) => set({ currentView: view }),

  setCustomActors: (actors) => {
    set({ customActors: actors });
  },

  removeCustomActor: (customId) => {
    set((state) => ({
      customActors: state.customActors.filter((a) => a.customId !== customId),
    }));
  },

  updateFormField: (key, value) =>
    set((state) => ({ formValues: { ...state.formValues, [key]: value } })),

  resetForm: () => {
    const { selectedActor } = get();
    if (selectedActor) {
      set({
        formValues: selectedActor.inputSchema.reduce(
          (acc, field) => {
            acc[field.key] = field.default ?? (field.type === 'number' ? 0 : field.type === 'boolean' ? false : '');
            return acc;
          },
          {} as Record<string, any>
        ),
      });
    }
  },

  setOutputFormat: (format) => set({ outputFormat: format }),
  setSelectedFields: (fields) => set({ selectedFields: fields }),
  toggleField: (field) =>
    set((state) => ({
      selectedFields: state.selectedFields.includes(field)
        ? state.selectedFields.filter((f) => f !== field)
        : [...state.selectedFields, field],
    })),
  setMaxResults: (max) => set({ maxResults: max }),
  setRun: (run) => set((state) => ({ currentRun: { ...state.currentRun, ...run } })),
  setResults: (results) => set({ results }),
  setSearchHistory: (history) => set({ searchHistory: history }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setApiKeyConfigured: (configured) => set({ apiKeyConfigured: configured }),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  setAuthView: (view) => set({ authView: view }),

  logout: () => {
    localStorage.removeItem('session_token');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    set({ user: null, isAuthenticated: false, currentView: 'catalog' });
  },

  resetAll: () =>
    set({
      selectedActor: null,
      currentView: 'catalog',
      formValues: {},
      outputFormat: 'json',
      selectedFields: [],
      maxResults: 20,
      currentRun: { ...initialState.currentRun },
      results: [],
    }),
}));
