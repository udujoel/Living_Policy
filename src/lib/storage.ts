import { supabase, isSupabaseConfigured } from './supabase';

export type UploadedFile = {
  id: number;
  name: string;
  source: string;
  size: string;
  status: 'Parsed' | 'Processing';
};

export type SimulationResult = {
  id: string;
  policyId: number;
  scenarioName: string;
  timestamp: string;
  status: 'Draft' | 'Completed' | 'Deployed';
  data: any;
  user_id?: string; // Add user_id for Supabase
};

export type AnalysisResult = {
  fileName: string;
  data: any;
  timestamp: string;
};

const STORAGE_KEY = 'lps_uploads';
const SIM_KEY = 'lps_simulations';
const ANALYSIS_KEY = 'lps_analysis';

// --- Local Storage Helpers (Legacy/Guest) ---

export const getStoredUploads = (): UploadedFile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load uploads', e);
    return [];
  }
};

export const saveUpload = (file: UploadedFile) => {
  const current = getStoredUploads();
  // Avoid duplicates
  if (current.find(f => f.name === file.name)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([file, ...current]));
};

export const deleteUpload = (id: number) => {
  const current = getStoredUploads();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter(f => f.id !== id)));
};

export const getStoredSimulationsLocal = (): SimulationResult[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SIM_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

// --- Hybrid Storage (Supabase + Local) ---

export const fetchSimulations = async (): Promise<SimulationResult[]> => {
  // Skip Supabase if not configured
  if (!isSupabaseConfigured()) {
    return getStoredSimulationsLocal();
  }

  // Check for authenticated user
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        return getStoredSimulationsLocal(); // Fallback? Or just return empty/error?
      }

      // Map DB fields to app type if necessary (snake_case to camelCase)
      return data.map((row: any) => ({
        id: row.id,
        policyId: row.policy_id,
        scenarioName: row.scenario_name,
        timestamp: row.created_at,
        status: row.status,
        data: row.data,
        user_id: row.user_id
      }));
    } else {
      // Guest mode: use Local Storage
      return getStoredSimulationsLocal();
    }
  } catch (e) {
    console.error('Supabase connection error:', e);
    return getStoredSimulationsLocal();
  }
};

export const saveSimulationResult = async (result: SimulationResult) => {
  if (typeof window === 'undefined') return;

  // Skip Supabase if not configured
  if (!isSupabaseConfigured()) {
    // Guest mode: Save Local
    const current = getStoredSimulationsLocal();
    const existingIndex = current.findIndex(s => s.id === result.id);

    if (existingIndex > -1) {
      current[existingIndex] = { ...current[existingIndex], ...result };
      localStorage.setItem(SIM_KEY, JSON.stringify(current));
    } else {
      localStorage.setItem(SIM_KEY, JSON.stringify([result, ...current]));
    }
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Save to Supabase
      const payload = {
        id: result.id, // Ensure ID is UUID if possible, or let DB generate it if new?
                       // App generates IDs currently. If it's a new UUID, we can use it.
                       // If it's a random string from Math.random(), we might need to be careful with UUID type in DB.
                       // The DB schema expects UUID. The app currently generates random strings or UUID-like.
                       // Let's ensure we generate valid UUIDs in the app or adjust the DB/App logic.
                       // For now, let's try to upsert.
        user_id: session.user.id,
        policy_id: result.policyId,
        scenario_name: result.scenarioName,
        status: result.status,
        data: result.data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('simulations')
        .upsert(payload, { onConflict: 'id' });

      if (error) console.error('Supabase save error:', error);

      // Also save local for cache/optimistic UI? Maybe not to avoid confusion.
    } else {
      // Guest mode: Save Local
      const current = getStoredSimulationsLocal();
      const existingIndex = current.findIndex(s => s.id === result.id);

      if (existingIndex > -1) {
        current[existingIndex] = { ...current[existingIndex], ...result };
        localStorage.setItem(SIM_KEY, JSON.stringify(current));
      } else {
        localStorage.setItem(SIM_KEY, JSON.stringify([result, ...current]));
      }
    }
  } catch (e) {
    console.error('Supabase save error:', e);
    // Fallback to local storage
    const current = getStoredSimulationsLocal();
    const existingIndex = current.findIndex(s => s.id === result.id);

    if (existingIndex > -1) {
      current[existingIndex] = { ...current[existingIndex], ...result };
      localStorage.setItem(SIM_KEY, JSON.stringify(current));
    } else {
      localStorage.setItem(SIM_KEY, JSON.stringify([result, ...current]));
    }
  }
};

export const deleteSimulation = async (id: string) => {
  if (typeof window === 'undefined') return;

  // Skip Supabase if not configured
  if (!isSupabaseConfigured()) {
    const current = getStoredSimulationsLocal();
    localStorage.setItem(SIM_KEY, JSON.stringify(current.filter(s => s.id !== id)));
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { error } = await supabase.from('simulations').delete().eq('id', id);
      if (error) console.error('Supabase delete error:', error);
    } else {
      const current = getStoredSimulationsLocal();
      localStorage.setItem(SIM_KEY, JSON.stringify(current.filter(s => s.id !== id)));
    }
  } catch (e) {
    console.error('Supabase delete error:', e);
    const current = getStoredSimulationsLocal();
    localStorage.setItem(SIM_KEY, JSON.stringify(current.filter(s => s.id !== id)));
  }
};

// Deprecated/Alias for backward compatibility (will default to local sync for now, but warns)
// We should update callsites to use fetchSimulations() which is async.
export const getStoredSimulations = (): SimulationResult[] => {
  return getStoredSimulationsLocal();
};

export const fetchAnalyses = async (): Promise<AnalysisResult[]> => {
  // Skip Supabase if not configured
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch analyses error:', error);
        return [];
      }

      return data.map((row: any) => ({
        fileName: row.file_name,
        data: row.data,
        timestamp: row.created_at
      }));
    }
    return [];
  } catch (e) {
    console.error('Supabase fetch analyses error:', e);
    return [];
  }
};

export const saveAnalysisResult = async (result: AnalysisResult) => {
  if (typeof window === 'undefined') return;

  // Always save local for quick access during session
  localStorage.setItem(`${ANALYSIS_KEY}_${result.fileName}`, JSON.stringify(result));

  // Skip Supabase if not configured
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const payload = {
        user_id: session.user.id,
        file_name: result.fileName,
        data: result.data, // Only saving the extraction data, not the full doc
        created_at: result.timestamp || new Date().toISOString()
      };

      const { error } = await supabase.from('analyses').insert(payload);
      if (error) console.error('Supabase save analysis error:', error);
    }
  } catch (e) {
    console.error('Supabase save analysis error:', e);
  }
};

export const getAnalysisResult = (fileName: string): AnalysisResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`${ANALYSIS_KEY}_${fileName}`);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};
