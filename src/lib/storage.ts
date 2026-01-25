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
};

export type AnalysisResult = {
  fileName: string;
  data: any;
  timestamp: string;
};

const STORAGE_KEY = 'lps_uploads';
const SIM_KEY = 'lps_simulations';
const ANALYSIS_KEY = 'lps_analysis';

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

export const saveSimulationResult = (result: SimulationResult) => {
  if (typeof window === 'undefined') return;
  const current = getStoredSimulations();
  const existingIndex = current.findIndex(s => s.id === result.id);
  
  if (existingIndex > -1) {
    current[existingIndex] = { ...current[existingIndex], ...result };
    localStorage.setItem(SIM_KEY, JSON.stringify(current));
  } else {
    localStorage.setItem(SIM_KEY, JSON.stringify([result, ...current]));
  }
};

export const deleteSimulation = (id: string) => {
  if (typeof window === 'undefined') return;
  const current = getStoredSimulations();
  localStorage.setItem(SIM_KEY, JSON.stringify(current.filter(s => s.id !== id)));
};

export const getStoredSimulations = (): SimulationResult[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SIM_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveAnalysisResult = (result: AnalysisResult) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${ANALYSIS_KEY}_${result.fileName}`, JSON.stringify(result));
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
