import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBlockedActions } from './useBlockedActions';
import { scenarios, createSubscriptionStatusMock } from '@/test/mocks/subscription';

// Mock do toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: (args: unknown) => mockToast(args),
}));

// Mock do useSubscriptionStatus
vi.mock('@/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: vi.fn(),
}));

import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

describe('useBlockedActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('quando trial está ativo', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.trialAtivo) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve permitir criar recursos', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('create')).toBe(true);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve permitir editar recursos', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('edit')).toBe(true);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve permitir excluir recursos', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('delete')).toBe(true);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve permitir exportar PDF', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('export')).toBe(true);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve retornar isBlocked como false', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.isBlocked).toBe(false);
      expect(result.current.canModify).toBe(true);
    });
  });

  describe('quando trial expira hoje', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.trialExpiraHoje) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('ainda deve permitir modificações', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('create')).toBe(true);
      expect(result.current.checkPermission('edit')).toBe(true);
      expect(result.current.canModify).toBe(true);
    });

    it('deve sinalizar que está expirando hoje', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.isExpiringToday).toBe(true);
    });
  });

  describe('quando trial expirou', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.trialExpirado) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve bloquear criação e mostrar toast', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('create')).toBe(false);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '🔒 Acesso bloqueado',
          variant: 'destructive',
        })
      );
    });

    it('deve bloquear edição e mostrar toast', () => {
      const { result } = renderHook(() => useBlockedActions());
      mockToast.mockClear();
      expect(result.current.checkPermission('edit')).toBe(false);
      expect(mockToast).toHaveBeenCalled();
    });

    it('deve bloquear exclusão e mostrar toast', () => {
      const { result } = renderHook(() => useBlockedActions());
      mockToast.mockClear();
      expect(result.current.checkPermission('delete')).toBe(false);
      expect(mockToast).toHaveBeenCalled();
    });

    it('deve bloquear exportação e mostrar toast', () => {
      const { result } = renderHook(() => useBlockedActions());
      mockToast.mockClear();
      expect(result.current.checkPermission('export')).toBe(false);
      expect(mockToast).toHaveBeenCalled();
    });

    it('deve retornar isBlocked como true', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.isBlocked).toBe(true);
      expect(result.current.canModify).toBe(false);
    });
  });

  describe('quando assinatura está ativa', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.assinaturaAtiva) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve permitir todas as ações', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('create')).toBe(true);
      expect(result.current.checkPermission('edit')).toBe(true);
      expect(result.current.checkPermission('delete')).toBe(true);
      expect(result.current.checkPermission('export')).toBe(true);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve retornar flags corretas', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.isBlocked).toBe(false);
      expect(result.current.canModify).toBe(true);
      expect(result.current.canExportPDF).toBe(true);
    });
  });

  describe('quando assinatura expirou', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.assinaturaExpirada) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve bloquear todas as ações de modificação', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('create')).toBe(false);
      expect(result.current.checkPermission('edit')).toBe(false);
      expect(result.current.checkPermission('delete')).toBe(false);
      expect(result.current.checkPermission('export')).toBe(false);
    });

    it('deve retornar canModify false', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.canModify).toBe(false);
      expect(result.current.isBlocked).toBe(true);
    });
  });

  describe('durante carregamento', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useSubscriptionStatus>);
    });

    it('deve permitir ações durante loading', () => {
      const { result } = renderHook(() => useBlockedActions());
      expect(result.current.checkPermission('create')).toBe(true);
      expect(result.current.checkPermission('edit')).toBe(true);
      expect(result.current.isLoading).toBe(true);
    });
  });
});
