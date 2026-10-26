export const PROPOSAL_API_PATHS = {
  list: '/api/proposals',
  detail: (id: string) => `/api/proposals/${encodeURIComponent(id)}`,
  withdraw: (id: string) => `/api/proposals/${encodeURIComponent(id)}/withdraw`,
} as const;
