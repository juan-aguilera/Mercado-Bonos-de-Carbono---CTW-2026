import type { MarketplaceListing, MarketplaceNeed, MarketplaceRequest } from "./types";

const LISTINGS_KEY = "cf_marketplace_user_listings";
const REQUESTS_KEY = "cf_marketplace_requests";
const NEEDS_KEY = "cf_marketplace_user_needs";

export function loadUserListings(): MarketplaceListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    return raw ? (JSON.parse(raw) as MarketplaceListing[]) : [];
  } catch {
    return [];
  }
}

export function saveUserListings(listings: MarketplaceListing[]) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

export function loadLocalRequests(): MarketplaceRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as MarketplaceRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalRequests(requests: MarketplaceRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function loadUserNeeds(): MarketplaceNeed[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NEEDS_KEY);
    return raw ? (JSON.parse(raw) as MarketplaceNeed[]) : [];
  } catch {
    return [];
  }
}

export function saveUserNeeds(needs: MarketplaceNeed[]) {
  localStorage.setItem(NEEDS_KEY, JSON.stringify(needs));
}
