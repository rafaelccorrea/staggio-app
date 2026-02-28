import { useState, useCallback } from 'react';
import { financialApi } from '../services/financialApi';
import { useAutoReloadOnCompanyChange } from './useCompanyMonitor';
import type {
  FinancialTransaction,
  CreateFinancialTransactionData,
  UpdateFinancialTransactionData,
  FinancialTransactionFilters,
  FinancialTransactionResponse,
  FinancialSummary,
  CategorySummary,
  MonthlySummary,
  PaginationOptions,
} from '../types/financial';

interface UseFinancialReturn {
  // Estados
  transactions: FinancialTransaction[];
  currentTransaction: FinancialTransaction | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  summary: FinancialSummary | null;
  categorySummary: CategorySummary[];
  monthlySummary: MonthlySummary[];

  // Ações
  createTransaction: (
    data: CreateFinancialTransactionData
  ) => Promise<FinancialTransaction>;
  getTransactionById: (id: string) => Promise<FinancialTransaction>;
  getTransactions: (
    filters?: FinancialTransactionFilters,
    pagination?: PaginationOptions
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    data: UpdateFinancialTransactionData
  ) => Promise<FinancialTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getFinancialSummary: (startDate?: string, endDate?: string) => Promise<void>;
  getCategorySummary: (startDate?: string, endDate?: string) => Promise<void>;
  getMonthlySummary: (year?: number) => Promise<void>;

  // Utilitários
  clearError: () => void;
  setCurrentTransaction: (transaction: FinancialTransaction | null) => void;
  refreshTransactions: () => Promise<void>;
}

export const useFinancial = (): UseFinancialReturn => {
  // Estados principais
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [currentTransaction, setCurrentTransaction] =
    useState<FinancialTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);

  // Filtros e paginação atuais (para refresh)
  const [currentFilters, setCurrentFilters] =
    useState<FinancialTransactionFilters>({});
  const [currentPagination, setCurrentPagination] = useState<PaginationOptions>(
    {
      page: 1,
      limit: 20,
    }
  );

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Criar transação
  const createTransaction = useCallback(
    async (
      data: CreateFinancialTransactionData
    ): Promise<FinancialTransaction> => {
      setIsLoading(true);
      setError(null);

      try {
        const newTransaction = await financialApi.createTransaction(data);

        // Adicionar à lista local se estivermos na primeira página
        setTransactions(prev => [newTransaction, ...prev]);

        return newTransaction;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao criar transação';
        console.error('❌ Erro ao criar transação via hook:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Buscar transação por ID
  const getTransactionById = useCallback(
    async (id: string): Promise<FinancialTransaction> => {
      setIsLoading(true);
      setError(null);

      try {
        const transaction = await financialApi.getTransactionById(id);
        setCurrentTransaction(transaction);

        return transaction;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao buscar transação';
        console.error('❌ Erro ao buscar transação via hook:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Listar transações
  const getTransactions = useCallback(
    async (
      filters: FinancialTransactionFilters = {},
      pagination: PaginationOptions = { page: 1, limit: 20 }
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Salvar filtros e paginação atuais
        setCurrentFilters(filters);
        setCurrentPagination(pagination);

        const response = await financialApi.getTransactions(
          filters,
          pagination
        );

        setTransactions(response.data);
        setTotal(response.total);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages);

      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao listar transações';
        console.error('❌ Erro ao listar transações via hook:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Atualizar transação
  const updateTransaction = useCallback(
    async (
      id: string,
      data: UpdateFinancialTransactionData
    ): Promise<FinancialTransaction> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedTransaction = await financialApi.updateTransaction(
          id,
          data
        );

        // Atualizar na lista local
        setTransactions(prev =>
          prev.map(transaction =>
            transaction.id === id ? updatedTransaction : transaction
          )
        );

        // Atualizar transação atual se for a mesma
        if (currentTransaction?.id === id) {
          setCurrentTransaction(updatedTransaction);
        }

        return updatedTransaction;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao atualizar transação';
        console.error('❌ Erro ao atualizar transação via hook:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTransaction?.id]
  );

  // Excluir transação
  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await financialApi.deleteTransaction(id);

        // Remover da lista local
        setTransactions(prev =>
          prev.filter(transaction => transaction.id !== id)
        );

        // Limpar transação atual se for a mesma
        if (currentTransaction?.id === id) {
          setCurrentTransaction(null);
        }

      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao excluir transação';
        console.error('❌ Erro ao excluir transação via hook:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTransaction?.id]
  );

  // Obter resumo financeiro
  const getFinancialSummary = useCallback(
    async (startDate?: string, endDate?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const summaryData = await financialApi.getFinancialSummary(
          startDate,
          endDate
        );
        setSummary(summaryData);

      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao buscar resumo financeiro';
        console.error(
          '❌ Erro ao buscar resumo financeiro via hook:',
          errorMessage
        );
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Obter resumo por categorias
  const getCategorySummary = useCallback(
    async (startDate?: string, endDate?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const categoryData = await financialApi.getCategorySummary(
          startDate,
          endDate
        );
        setCategorySummary(categoryData);

      } catch (err: any) {
        const errorMessage =
          err.message || 'Erro ao buscar resumo por categorias';
        console.error(
          '❌ Erro ao buscar resumo por categorias via hook:',
          errorMessage
        );
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Obter resumo mensal
  const getMonthlySummary = useCallback(
    async (year?: number): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const monthlyData = await financialApi.getMonthlySummary(year);
        setMonthlySummary(monthlyData);

      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao buscar resumo mensal';
        console.error(
          '❌ Erro ao buscar resumo mensal via hook:',
          errorMessage
        );
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Atualizar transação atual
  const setCurrentTransactionCallback = useCallback(
    (transaction: FinancialTransaction | null) => {
      setCurrentTransaction(transaction);
    },
    []
  );

  // Atualizar lista com filtros e paginação atuais
  const refreshTransactions = useCallback(async (): Promise<void> => {
    await getTransactions(currentFilters, currentPagination);
  }, [getTransactions, currentFilters, currentPagination]);

  // Função estável para recarregar dados financeiros (sem dependências para evitar loop)
  const reloadFinancialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Recarregar transações
      const response = await financialApi.getTransactions(
        {},
        { page: 1, limit: 20 }
      );
      setTransactions(response.data || []);
      setTotal(response.total || 0);
      setCurrentPage(response.page || 1);
      setTotalPages(response.totalPages || 1);

      // Recarregar resumos
      const summaryData = await financialApi.getFinancialSummary();
      setSummary(summaryData);

      const categoryData = await financialApi.getCategorySummary();
      setCategorySummary(categoryData);

      const monthlyData = await financialApi.getMonthlySummary();
      setMonthlySummary(monthlyData);

    } catch (error: any) {
      console.error(
        '❌ Erro ao recarregar dados financeiros após mudança de empresa:',
        error
      );
      setError(
        error.response?.data?.message || 'Erro ao recarregar dados financeiros'
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // Sem dependências para evitar loop

  // Monitorar mudanças de empresa e recarregar dados financeiros automaticamente
  useAutoReloadOnCompanyChange(reloadFinancialData);

  return {
    // Estados
    transactions,
    currentTransaction,
    isLoading,
    error,
    total,
    currentPage,
    totalPages,
    summary,
    categorySummary,
    monthlySummary,

    // Ações
    createTransaction,
    getTransactionById,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary,
    getCategorySummary,
    getMonthlySummary,

    // Utilitários
    clearError,
    setCurrentTransaction: setCurrentTransactionCallback,
    refreshTransactions,
  };
};
