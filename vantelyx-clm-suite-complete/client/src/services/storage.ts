import type { AppState } from '../types/domain';

const STORAGE_KEY = 'vantelyx-clm-state-v2';

export function loadState(seed: AppState): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as AppState;
    return { ...seed, ...parsed };
  } catch {
    return seed;
  }
}

export function saveState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetSavedState() {
  window.localStorage.removeItem(STORAGE_KEY);
}
