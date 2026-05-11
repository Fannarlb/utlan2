import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  addCar,
  addSalesman,
  createLoan,
  fetchActiveLoans,
  fetchAllCars,
  fetchAllLoans,
  fetchCars,
  fetchSalesmen,
  markReturned,
  removeCar,
  removeSalesman,
  type Loan,
} from './api';

/**
 * Query keys — single source of truth so we don't typo-drift across files.
 * Mutations invalidate by top-level prefix (e.g. `['loans']`) so any consumer
 * of either `loansActive` or `loansAll` is refreshed automatically.
 */
export const qk = {
  salesmen: ['salesmen'] as const,
  carsAll: ['cars', 'all'] as const,
  carsAvailable: ['cars', 'available'] as const,
  loansActive: ['loans', 'active'] as const,
  loansAll: ['loans', 'all'] as const,
};

// ---------- Queries ----------

export const useSalesmen = () =>
  useQuery({ queryKey: qk.salesmen, queryFn: fetchSalesmen });

export const useAllCars = () =>
  useQuery({ queryKey: qk.carsAll, queryFn: fetchAllCars });

export const useAvailableCars = () =>
  useQuery({ queryKey: qk.carsAvailable, queryFn: fetchCars });

export const useActiveLoans = () =>
  useQuery({ queryKey: qk.loansActive, queryFn: fetchActiveLoans });

export const useAllLoans = () =>
  useQuery({ queryKey: qk.loansAll, queryFn: fetchAllLoans });

// ---------- Mutations ----------

const toastError = (e: unknown) =>
  toast.error(e instanceof Error ? e.message : 'Eitthvað fór úrskeiðis');

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['cars'] });
    },
    onError: toastError,
  });
}

export function useMarkReturned() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markReturned,
    // Optimistic update — remove the loan from the active list instantly so
    // the row disappears before the network round-trip completes. On error,
    // the invalidate in onSettled restores the canonical server state.
    onMutate: async (loanId: number) => {
      await qc.cancelQueries({ queryKey: qk.loansActive });
      const previous = qc.getQueryData<Loan[]>(qk.loansActive);
      qc.setQueryData<Loan[]>(qk.loansActive, (prev) =>
        prev ? prev.filter((l) => l.id !== loanId) : prev
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(qk.loansActive, ctx.previous);
      toastError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}

export function useAddSalesman() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addSalesman,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salesmen'] }),
    onError: toastError,
  });
}

export function useRemoveSalesman() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeSalesman,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salesmen'] }),
    onError: toastError,
  });
}

export function useAddCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addCar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cars'] }),
    onError: toastError,
  });
}

export function useRemoveCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeCar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cars'] }),
    onError: toastError,
  });
}
