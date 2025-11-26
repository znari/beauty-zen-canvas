import { vi } from 'vitest';

export interface MockSubscriptionStatus {
  plan: string | null;
  status: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  isBlocked: boolean;
  daysUntilExpiry: number;
  lastPaymentDate: string | null;
  subscriptionEndsAt: string | null;
  subscriptionStartedAt: string | null;
  daysUntilRenewal: number;
  isNearExpiry: boolean;
  limits: {
    maxClients: number | null;
    maxAnamneses: number | null;
    maxStorageGB: number | null;
    maxProfessionals: number | null;
  };
  currentUsage: {
    clientsCount: number;
    anamnesesCount: number;
    storageUsedMB: number;
    professionalsCount: number;
  };
  isExpiringToday: boolean;
  isExpired: boolean;
  canModify: boolean;
  canExportPDF: boolean;
  canViewOnly: boolean;
}

export const createMockSubscription = (
  overrides: Partial<MockSubscriptionStatus> = {}
): MockSubscriptionStatus => ({
  plan: 'essencial',
  status: 'trialing',
  trialEndsAt: null,
  isTrialActive: true,
  isBlocked: false,
  daysUntilExpiry: 15,
  lastPaymentDate: null,
  subscriptionEndsAt: null,
  subscriptionStartedAt: null,
  daysUntilRenewal: 0,
  isNearExpiry: false,
  limits: {
    maxClients: null,
    maxAnamneses: null,
    maxStorageGB: null,
    maxProfessionals: null,
  },
  currentUsage: {
    clientsCount: 0,
    anamnesesCount: 0,
    storageUsedMB: 0,
    professionalsCount: 1,
  },
  isExpiringToday: false,
  isExpired: false,
  canModify: true,
  canExportPDF: true,
  canViewOnly: false,
  ...overrides,
});

// Helper para criar mock do hook useSubscriptionStatus
export const createSubscriptionStatusMock = (overrides: Partial<MockSubscriptionStatus> = {}) => ({
  data: createMockSubscription(overrides),
  isLoading: false,
  error: null,
  isError: false,
  isSuccess: true,
  refetch: vi.fn(),
});

// Cenários pré-definidos
export const scenarios = {
  trialAtivo: createMockSubscription({
    isTrialActive: true,
    canModify: true,
    isBlocked: false,
    daysUntilExpiry: 10,
  }),

  trialExpiraHoje: createMockSubscription({
    isTrialActive: true,
    isExpiringToday: true,
    canModify: true,
    isBlocked: false,
    daysUntilExpiry: 0,
  }),

  trialExpirado: createMockSubscription({
    isTrialActive: false,
    isExpired: true,
    canModify: false,
    canViewOnly: true,
    isBlocked: true,
    daysUntilExpiry: -1,
  }),

  assinaturaAtiva: createMockSubscription({
    status: 'active',
    isTrialActive: false,
    canModify: true,
    canExportPDF: true,
    isBlocked: false,
  }),

  assinaturaExpirada: createMockSubscription({
    status: 'expired',
    isTrialActive: false,
    isExpired: true,
    canModify: false,
    canViewOnly: true,
    isBlocked: true,
  }),

  proximoDeExpirar: createMockSubscription({
    isTrialActive: true,
    isNearExpiry: true,
    daysUntilExpiry: 3,
    canModify: true,
    isBlocked: false,
  }),
};
