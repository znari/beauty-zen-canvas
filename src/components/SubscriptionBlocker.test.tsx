import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SubscriptionBlocker } from './SubscriptionBlocker';
import { scenarios, createSubscriptionStatusMock } from '@/test/mocks/subscription';
import { BrowserRouter } from 'react-router-dom';

// Mock do useSubscriptionStatus
vi.mock('@/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: vi.fn(),
}));

import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('SubscriptionBlocker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('deve mostrar spinner de loading', () => {
      const { getByText, queryByText } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByText(/Verificando assinatura/i)).toBeInTheDocument();
      expect(queryByText('Conteúdo')).not.toBeInTheDocument();
    });
  });

  describe('quando trial expira hoje', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.trialExpiraHoje) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve mostrar banner laranja urgente', () => {
      const { getByText } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByText(/expira HOJE/i)).toBeInTheDocument();
      expect(getByText('Conteúdo')).toBeInTheDocument();
    });

    it('deve mostrar botão de assinar', () => {
      const { getByRole } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByRole('button', { name: /Assinar agora/i })).toBeInTheDocument();
    });
  });

  describe('quando trial ativo com poucos dias', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock({
          ...scenarios.proximoDeExpirar,
          isTrialActive: true,
          daysUntilExpiry: 5,
        }) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve mostrar banner amarelo de aviso', () => {
      const { getByText } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByText(/teste grátis expira em 5 dia/i)).toBeInTheDocument();
      expect(getByText('Conteúdo')).toBeInTheDocument();
    });

    it('deve mostrar botão de ver planos', () => {
      const { getByRole } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByRole('button', { name: /Ver planos/i })).toBeInTheDocument();
    });
  });

  describe('quando período expirou (bloqueado)', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.trialExpirado) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve mostrar banner vermelho de bloqueio', () => {
      const { getByText } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByText(/modo somente leitura/i)).toBeInTheDocument();
      expect(getByText('Conteúdo')).toBeInTheDocument();
    });

    it('deve mostrar botões de desbloquear e sair', () => {
      const { getByRole } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByRole('button', { name: /Desbloquear agora/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /Sair/i })).toBeInTheDocument();
    });

    it('deve informar sobre funcionalidades bloqueadas', () => {
      const { getByText } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByText(/Seu período expirou/i)).toBeInTheDocument();
    });
  });

  describe('quando assinatura está ativa', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.assinaturaAtiva) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve renderizar apenas o conteúdo sem banners', () => {
      const { getByText, queryByText } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByText('Conteúdo')).toBeInTheDocument();
      expect(queryByText(/expira/i)).not.toBeInTheDocument();
      expect(queryByText(/somente leitura/i)).not.toBeInTheDocument();
    });

    it('não deve mostrar nenhum banner de aviso', () => {
      const { queryByRole } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(queryByRole('button', { name: /Assinar/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /Ver planos/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /Desbloquear/i })).not.toBeInTheDocument();
    });
  });

  describe('quando assinatura expirou', () => {
    beforeEach(() => {
      vi.mocked(useSubscriptionStatus).mockReturnValue(
        createSubscriptionStatusMock(scenarios.assinaturaExpirada) as unknown as ReturnType<typeof useSubscriptionStatus>
      );
    });

    it('deve mostrar banner vermelho de bloqueio', () => {
      const { getByText } = render(
        <TestWrapper>
          <SubscriptionBlocker>
            <div>Conteúdo</div>
          </SubscriptionBlocker>
        </TestWrapper>
      );

      expect(getByText(/modo somente leitura/i)).toBeInTheDocument();
    });
  });
});
