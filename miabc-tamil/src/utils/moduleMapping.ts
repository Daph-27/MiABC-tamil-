/**
 * Module ID Mapping Utilities
 * 
 * This file provides utilities to convert between display names and Firestore module IDs
 * according to the CTO's schema.
 */

export interface ModuleInfo {
  id: string;
  displayName: string;
  title: string;
  order: number;
}

/**
 * Complete module information
 * ID format matches Firestore: "01_alphabet", "02_sounds", etc.
 */
export const MODULES: ModuleInfo[] = [
  {
    id: '01_alphabet',
    displayName: 'Alphabet',
    title: 'Alphabet',
    order: 1,
  },
  {
    id: '02_sounds',
    displayName: 'Sounds',
    title: 'Sounds',
    order: 2,
  },
  {
    id: '03_mathematics',
    displayName: 'Mathematics',
    title: 'Mathematics',
    order: 3,
  },
  {
    id: '04_family',
    displayName: 'Family',
    title: 'Family',
    order: 4,
  },
  {
    id: '05_write',
    displayName: 'Write',
    title: 'Write',
    order: 5,
  },
  {
    id: '06_i_know_how_to_read',
    displayName: 'Read',
    title: 'I Know How to Read',
    order: 6,
  },
  {
    id: '07_complete',
    displayName: 'Complete',
    title: 'Complete',
    order: 7,
  },
  {
    id: '08_words',
    displayName: 'Words',
    title: 'Words',
    order: 8,
  },
  {
    id: '09_festivals',
    displayName: 'Festivals',
    title: 'Festivals',
    order: 9,
  },
  {
    id: '10_colors',
    displayName: 'Colors',
    title: 'Colors',
    order: 10,
  },
];

/**
 * Get module ID from display name
 * @param displayName - e.g., "Alphabet", "Sounds"
 * @returns Firestore module ID - e.g., "01_alphabet", "02_sounds"
 */
export const getModuleId = (displayName: string): string | null => {
  const module = MODULES.find(
    m => m.displayName.toLowerCase() === displayName.toLowerCase()
  );
  return module?.id || null;
};

/**
 * Get display name from module ID
 * @param moduleId - e.g., "01_alphabet", "02_sounds"
 * @returns Display name - e.g., "Alphabet", "Sounds"
 */
export const getDisplayName = (moduleId: string): string | null => {
  const module = MODULES.find(m => m.id === moduleId);
  return module?.displayName || null;
};

/**
 * Get full module title from module ID
 * @param moduleId - e.g., "01_alphabet"
 * @returns Full title - e.g., "Alphabet", "I Know How to Read"
 */
export const getModuleTitle = (moduleId: string): string | null => {
  const module = MODULES.find(m => m.id === moduleId);
  return module?.title || null;
};

/**
 * Get next module ID in sequence
 * @param currentModuleId - e.g., "01_alphabet"
 * @returns Next module ID - e.g., "02_sounds", or null if last
 */
export const getNextModuleId = (currentModuleId: string): string | null => {
  const currentModule = MODULES.find(m => m.id === currentModuleId);
  if (!currentModule) return null;

  const nextModule = MODULES.find(m => m.order === currentModule.order + 1);
  return nextModule?.id || null;
};

/**
 * Get previous module ID in sequence
 * @param currentModuleId - e.g., "02_sounds"
 * @returns Previous module ID - e.g., "01_alphabet", or null if first
 */
export const getPreviousModuleId = (currentModuleId: string): string | null => {
  const currentModule = MODULES.find(m => m.id === currentModuleId);
  if (!currentModule) return null;

  const prevModule = MODULES.find(m => m.order === currentModule.order - 1);
  return prevModule?.id || null;
};

/**
 * Get all module IDs in order
 * @returns Array of module IDs
 */
export const getAllModuleIds = (): string[] => {
  return MODULES.map(m => m.id);
};

/**
 * Get module info by ID
 * @param moduleId - e.g., "01_alphabet"
 * @returns Module info object or null
 */
export const getModuleInfo = (moduleId: string): ModuleInfo | null => {
  return MODULES.find(m => m.id === moduleId) || null;
};

/**
 * Check if module ID is valid
 * @param moduleId - Module ID to validate
 * @returns true if valid
 */
export const isValidModuleId = (moduleId: string): boolean => {
  return MODULES.some(m => m.id === moduleId);
};

/**
 * Get module order/position
 * @param moduleId - e.g., "01_alphabet"
 * @returns Order number (1-based) or null if not found
 */
export const getModuleOrder = (moduleId: string): number | null => {
  const module = MODULES.find(m => m.id === moduleId);
  return module?.order || null;
};
