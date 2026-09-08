import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bel_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('bel_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export const apiClient = {
  auth: {
    login: (email: string, pass: string) => api.post('/api/auth/login', { email, password: pass }).then(res => res.data),
    logout: () => api.post('/api/auth/logout').then(res => res.data),
    getMe: () => api.get('/api/auth/me').then(res => res.data),
  },
  users: {
    getUsers: () => api.get('/api/users').then(res => res.data),
    getUser: (id: string) => api.get(`/api/users/${id}`).then(res => res.data),
    createUser: (data: any) => api.post('/api/users', data).then(res => res.data),
    suspendUser: (id: string) => api.post(`/api/users/${id}/suspend`).then(res => res.data),
    activateUser: (id: string) => api.post(`/api/users/${id}/activate`).then(res => res.data),
  },
  dids: {
    getDIDs: () => api.get('/api/dids').then(res => res.data),
    getDID: (did: string) => api.get(`/api/dids/${did}`).then(res => res.data),
    createDID: (data: any) => api.post('/api/dids', data).then(res => res.data),
    rotateDIDKey: (did: string) => api.post(`/api/dids/${did}/rotate`).then(res => res.data),
    revokeDID: (did: string) => api.post(`/api/dids/${did}/revoke`).then(res => res.data),
  },
  organizations: {
    getOrganizations: () => api.get('/api/organizations').then(res => res.data),
    getUnits: (orgId: string) => api.get(`/api/organizations/${orgId}/units`).then(res => res.data),
    getSBUs: (unitId: string) => api.get(`/api/units/${unitId}/sbus`).then(res => res.data),
  },
  credentials: {
    getCredentials: () => api.get('/api/credentials').then(res => res.data),
    getCredential: (id: string) => api.get(`/api/credentials/${id}`).then(res => res.data),
    issueCredential: (data: any) => api.post('/api/credentials/issue', data).then(res => res.data),
    revokeCredential: (id: string) => api.post(`/api/credentials/${id}/revoke`).then(res => res.data),
    verifyCredential: (id: string) => api.get(`/api/credentials/${id}/verify`).then(res => res.data),
    getCredentialQR: (id: string) => api.get(`/api/credentials/${id}/qr`).then(res => res.data),
  },
  assets: {
    getAssets: (filters?: any) => api.get('/api/assets', { params: filters }).then(res => res.data),
    getAsset: (id: string) => api.get(`/api/assets/${id}`).then(res => res.data),
    mintAsset: (data: any) => api.post('/api/assets/mint', data).then(res => res.data),
    transferAsset: (id: string, data: any) => api.post(`/api/assets/${id}/transfer`, data).then(res => res.data),
    burnAsset: (id: string) => api.post(`/api/assets/${id}/burn`).then(res => res.data),
    getCustodyHistory: (id: string) => api.get(`/api/assets/${id}/custody-history`).then(res => res.data),
  },
  vendors: {
    getVendors: () => api.get('/api/vendors').then(res => res.data),
    getVendor: (id: string) => api.get(`/api/vendors/${id}`).then(res => res.data),
    createVendor: (data: any) => api.post('/api/vendors', data).then(res => res.data),
    verifyVendor: (id: string) => api.post(`/api/vendors/${id}/verify`).then(res => res.data),
  },
  governance: {
    getProposals: () => api.get('/api/governance').then(res => res.data),
    getProposal: (id: string) => api.get(`/api/governance/${id}`).then(res => res.data),
    createProposal: (data: any) => api.post('/api/governance/proposals', data).then(res => res.data),
    approveProposal: (id: string) => api.post(`/api/governance/proposals/${id}/approve`).then(res => res.data),
    cancelProposal: (id: string) => api.post(`/api/governance/proposals/${id}/cancel`).then(res => res.data),
  },
  audit: {
    getAuditEvents: (filters?: any) => api.get('/api/audit', { params: filters }).then(res => res.data),
    getAuditStats: () => api.get('/api/audit/stats').then(res => res.data),
    exportAudit: () => api.get('/api/audit/export').then(res => res.data),
  },
  blockchain: {
    getTransactions: () => api.get('/api/blockchain/transactions').then(res => res.data),
    getTransaction: (txHash: string) => api.get(`/api/blockchain/transactions/${txHash}`).then(res => res.data),
    getBlockchainStatus: () => api.get('/api/blockchain/status').then(res => res.data),
    getContractAddresses: () => api.get('/api/blockchain/contracts').then(res => res.data),
  },
  verify: {
    verifyCredential: (id: string) => publicApi.get(`/api/verify/credential/${id}`).then(res => res.data),
    verifyAsset: (id: string) => publicApi.get(`/api/verify/asset/${id}`).then(res => res.data),
  },
  approvals: {
    getApprovals: () => api.get('/api/approvals').then(res => res.data),
    getApproval: (id: string) => api.get(`/api/approvals/${id}`).then(res => res.data),
    vote: (id: string, decision: 'APPROVE' | 'REJECT') => api.post(`/api/approvals/${id}/vote`, { decision }).then(res => res.data),
  },
  roles: {
    getRoles: () => api.get('/api/roles').then(res => res.data),
    getRoleAssignments: () => api.get('/api/roles/assignments').then(res => res.data),
    assignRole: (data: any) => api.post('/api/roles/assign', data).then(res => res.data),
    revokeAssignment: (id: string) => api.post(`/api/roles/assignments/${id}/revoke`).then(res => res.data),
  }
};
