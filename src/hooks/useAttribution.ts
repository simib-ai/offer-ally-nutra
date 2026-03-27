import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ally_attribution';
const COOKIE_EXPIRY_DAYS = 90;

/**
 * All attribution parameters we track.
 * Keys are the canonical field names we use in payloads.
 */
export interface AttributionParams {
  // Google Ads
  gclid: string;
  wbraid: string;
  gbraid: string;
  // Meta/Facebook
  fbclid: string;
  // UTM parameters
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  // Optional extended tracking
  campaign_id: string;
  ad_group_id: string;
  ad_id: string;
  utm_keyword: string;
  utm_matchtype: string;
  // Page context
  page_url: string;
}

/**
 * Map of URL param names (lowercase) to their canonical field names.
 * We check both lowercase and uppercase variants.
 */
const PARAM_ALIASES: Record<string, keyof AttributionParams> = {
  gclid: 'gclid',
  wbraid: 'wbraid',
  gbraid: 'gbraid',
  fbclid: 'fbclid',
  utm_source: 'utm_source',
  utm_medium: 'utm_medium',
  utm_campaign: 'utm_campaign',
  utm_content: 'utm_content',
  utm_term: 'utm_term',
  campaign_id: 'campaign_id',
  ad_group_id: 'ad_group_id',
  ad_id: 'ad_id',
  utm_keyword: 'utm_keyword',
  utm_matchtype: 'utm_matchtype',
};

const getEmptyParams = (): AttributionParams => ({
  gclid: '',
  wbraid: '',
  gbraid: '',
  fbclid: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  utm_term: '',
  campaign_id: '',
  ad_group_id: '',
  ad_id: '',
  utm_keyword: '',
  utm_matchtype: '',
  page_url: typeof window !== 'undefined' ? window.location.href : '',
});

/**
 * Parse URL query string case-insensitively.
 * Handles both lowercase (gclid) and uppercase (GCLID) variants.
 */
function parseURLParams(): Partial<AttributionParams> {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(window.location.search);
  const result: Partial<AttributionParams> = {};

  // Create a case-insensitive lookup map of all URL params
  const urlParamsLower: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    urlParamsLower[key.toLowerCase()] = value;
  });

  // Match against our tracked params
  Object.entries(PARAM_ALIASES).forEach(([paramKey, fieldName]) => {
    const value = urlParamsLower[paramKey.toLowerCase()];
    if (value) {
      result[fieldName] = value;
    }
  });

  return result;
}

/**
 * Set a cookie with 90-day expiry.
 */
function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  
  // Set cookie with path=/, SameSite=Lax for cross-page availability
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name.
 */
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return '';
}

/**
 * Load attribution params from localStorage.
 */
function loadFromLocalStorage(): Partial<AttributionParams> {
  if (typeof localStorage === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

/**
 * Load attribution params from cookies.
 */
function loadFromCookies(): Partial<AttributionParams> {
  const result: Partial<AttributionParams> = {};
  
  Object.values(PARAM_ALIASES).forEach((fieldName) => {
    const value = getCookie(`ally_${fieldName}`);
    if (value) {
      result[fieldName] = value;
    }
  });
  
  return result;
}

/**
 * Persist attribution params to localStorage.
 */
function saveToLocalStorage(params: Partial<AttributionParams>): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    // Only save non-empty, non-page_url values
    const toStore: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'page_url') {
        toStore[key] = value;
      }
    });
    
    if (Object.keys(toStore).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }
  } catch {
    // localStorage not available
  }
}

/**
 * Persist attribution params to cookies.
 */
function saveToCookies(params: Partial<AttributionParams>): void {
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== 'page_url') {
      setCookie(`ally_${key}`, value);
    }
  });
}

/**
 * Merge params with precedence: URL > localStorage > cookies > empty string.
 */
function mergeParams(
  urlParams: Partial<AttributionParams>,
  localStorageParams: Partial<AttributionParams>,
  cookieParams: Partial<AttributionParams>
): AttributionParams {
  const result = getEmptyParams();
  
  // Apply each field with precedence
  (Object.keys(result) as (keyof AttributionParams)[]).forEach((key) => {
    if (key === 'page_url') {
      result[key] = typeof window !== 'undefined' ? window.location.href : '';
    } else {
      result[key] = urlParams[key] || localStorageParams[key] || cookieParams[key] || '';
    }
  });
  
  return result;
}

/**
 * Master function to capture, persist, and return attribution params.
 * Can be called from anywhere (component or utility).
 */
export function captureAndPersistAttribution(): AttributionParams {
  if (typeof window === 'undefined') {
    return getEmptyParams();
  }

  // 1. Parse URL (case-insensitive)
  const urlParams = parseURLParams();
  
  // 2. Load from localStorage
  const localStorageParams = loadFromLocalStorage();
  
  // 3. Load from cookies
  const cookieParams = loadFromCookies();
  
  // 4. Merge with precedence: URL > localStorage > cookies
  const merged = mergeParams(urlParams, localStorageParams, cookieParams);
  
  // 5. Persist merged params to both localStorage AND cookies
  saveToLocalStorage(merged);
  saveToCookies(merged);
  
  return merged;
}

/**
 * Get current attribution params synchronously.
 * Uses precedence: URL > localStorage > cookies > empty string.
 * Always returns empty strings for missing params, never null/undefined.
 */
export function getAttributionSync(): AttributionParams {
  return captureAndPersistAttribution();
}

/**
 * React hook for attribution tracking.
 * Captures and persists on mount and on SPA route changes.
 */
export function useAttribution(): AttributionParams {
  const [params, setParams] = useState<AttributionParams>(getEmptyParams);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Capture on mount
    const captured = captureAndPersistAttribution();
    setParams(captured);

    // Listen for SPA navigation (popstate for back/forward, custom event for pushState)
    const handleNavigation = () => {
      const newParams = captureAndPersistAttribution();
      setParams(newParams);
    };

    window.addEventListener('popstate', handleNavigation);
    
    // Also listen for custom navigation events (if router emits them)
    window.addEventListener('locationchange', handleNavigation);

    // Patch history.pushState and replaceState to detect SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleNavigation();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleNavigation();
    };

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('locationchange', handleNavigation);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return params;
}

/**
 * Force refresh attribution from URL/storage.
 * Call this before form submission to ensure latest values.
 */
export function forceRefreshAttribution(): AttributionParams {
  return captureAndPersistAttribution();
}
