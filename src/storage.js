export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'kitchenPlanner.v1.state';

const defaultMembers = () => [
  {id:'parent-1', name:'Parent 1', role:'parent', likes:[], dislikes:[], spiceTolerance:'mild', notes:''},
  {id:'parent-2', name:'Parent 2', role:'parent', likes:[], dislikes:[], spiceTolerance:'mild', notes:''},
  {id:'child-1', name:'Child 1', role:'child', likes:[], dislikes:[], spiceTolerance:'none', notes:'Configure preferences privately in the app.'},
  {id:'child-2', name:'Child 2', role:'child', likes:[], dislikes:[], spiceTolerance:'none', notes:'Configure preferences privately in the app.'},
  {id:'helper', name:'Helper', role:'helper', likes:[], dislikes:[], spiceTolerance:'mild', notes:''}
];

export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    familyMembers: defaultMembers(),
    inventory: [],
    mealRequests: [],
    weeklyPlans: [],
    ratings: [],
    shoppingItems: [],
    topUpRequests: [],
    householdNotes: [],
    ui: { mode:'parent', activeTab:'plan', chineseExposureTarget:3 }
  };
}

export function migrateState(raw) {
  const base = createDefaultState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const merged = {...base, ...raw, ui:{...base.ui, ...(raw.ui || {})}};
  for (const key of ['familyMembers','inventory','mealRequests','weeklyPlans','ratings','shoppingItems','topUpRequests','householdNotes']) {
    if (!Array.isArray(merged[key])) merged[key] = base[key];
  }
  merged.schemaVersion = SCHEMA_VERSION;
  return merged;
}

export function saveState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify({...state, schemaVersion:SCHEMA_VERSION}));
}

export function loadState(storage, now = Date.now) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultState();
  try {
    return migrateState(JSON.parse(raw));
  } catch {
    try { storage.setItem(`kitchenPlanner.v1.recovery.${now()}`, raw); } catch {}
    return createDefaultState();
  }
}