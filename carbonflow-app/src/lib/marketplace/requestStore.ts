import type { MarketplaceRequest } from "./types";

const requests: MarketplaceRequest[] = [];

export function addRequest(request: MarketplaceRequest) {
  requests.unshift(request);
  return request;
}

export function listRequests() {
  return [...requests];
}

export function updateRequest(id: string, patch: Partial<MarketplaceRequest>) {
  const index = requests.findIndex((r) => r.id === id);
  if (index < 0) return null;
  requests[index] = { ...requests[index], ...patch };
  return requests[index];
}
