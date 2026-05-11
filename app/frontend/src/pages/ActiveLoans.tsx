import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { type Loan } from '@/lib/api';
import { qk, useActiveLoans, useMarkReturned } from '@/lib/queries';
import { formatDateTime, formatDwell, getOverdueLevel, type OverdueLevel } from '@/lib/format';

const LEVEL_ORDER: Record<OverdueLevel, number> = { red: 0, yellow: 1, none: 2 };

export default function ActiveLoans() {
  const qc = useQueryClient();
  const { data: loans = [], isLoading: loading, refetch } = useActiveLoans();

  // Tick the page every minute so dwell time + overdue badges keep moving
  // even when the user leaves the tab open. Invalidate rather than refetch
  // directly so we re-use the existing query plumbing.
  useEffect(() => {
    const id = setInterval(() => {
      qc.invalidateQueries({ queryKey: qk.loansActive });
    }, 60_000);
    return () => clearInterval(id);
  }, [qc]);

  // Resort by risk: red → yellow → none, then oldest first within each tier.
  // Overrides the API's newest-first sort because for an operational-risk
  // screen, "the one most at risk" beats "the one I just created".
  const sortedLoans = useMemo(() => {
    return [...loans].sort((a, b) => {
      const la = getOverdueLevel(a.checkout_time);
      const lb = getOverdueLevel(b.checkout_time);
      if (la !== lb) return LEVEL_ORDER[la] - LEVEL_ORDER[lb];
      return new Date(a.checkout_time).getTime() - new Date(b.checkout_time).getTime();
    });
  }, [loans]);
  const markReturnedMutation = useMarkReturned();
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const returningId = markReturnedMutation.isPending
    ? markReturnedMutation.variables ?? null
    : null;

  const handleReturnClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowReturnConfirm(true);
  };

  const handleConfirmReturn = () => {
    if (!selectedLoan) return;
    const loan = selectedLoan;
    markReturnedMutation.mutate(loan.id, {
      onSuccess: () => {
        toast.success(`Bíll ${loan.license_plate} skráður sem skilaður`);
      },
      onSettled: () => {
        setShowReturnConfirm(false);
        setSelectedLoan(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader
        title="Virk lán"
        subtitle={`${loans.length} ${loans.length !== 1 ? 'bílar' : 'bíll'} útlánaðir`}
        backTo="/"
        actions={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Endurnýja lista"
            className="h-11 w-11 text-text hover:bg-surface-3"
            onClick={() => refetch()}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        }
      />

      <div className="max-w-md md:max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-text" />
          </div>
        ) : loans.length === 0 ? (
          <Card className="bg-surface-2 border-border">
            <CardContent className="p-8 text-center">
              <p className="text-lg font-medium text-text">Engin virk lán</p>
              <p className="text-sm mt-1 text-muted">Allir bílar eru á lóðinni</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sortedLoans.map((loan) => {
              const level = getOverdueLevel(loan.checkout_time);
              return (
              <Card key={loan.id} className="bg-surface-2 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-lg text-text">
                          {loan.license_plate}
                        </span>
                        {level === 'red' && (
                          <span className="text-xs font-bold uppercase tracking-wide bg-brand text-brand-fg px-2 py-0.5">
                            Útí &gt;48 klst
                          </span>
                        )}
                        {level === 'yellow' && (
                          <span className="text-xs font-bold uppercase tracking-wide bg-amber-500 text-black px-2 py-0.5">
                            Útí &gt;24 klst
                          </span>
                        )}
                      </div>
                      <div className="text-sm space-y-0.5">
                        <p>
                          <span className="text-muted">Sölumaður:</span>{' '}
                          <span className="text-text">{loan.salesman_name}</span>
                        </p>
                        <p>
                          <span className="text-muted">Viðskiptavinur:</span>{' '}
                          <span className="text-text">{loan.customer_name}</span>
                        </p>
                        {loan.customer_kennitala && (
                          <p>
                            <span className="text-muted">Kennitala:</span>{' '}
                            <span className="text-text">{loan.customer_kennitala}</span>
                          </p>
                        )}
                        <p>
                          <span className="text-muted">Sími:</span>{' '}
                          <a
                            href={`tel:${loan.customer_phone}`}
                            className="text-text underline underline-offset-2"
                          >
                            {loan.customer_phone}
                          </a>
                        </p>
                        <p>
                          <span className="text-muted">Útlánað síðan:</span>{' '}
                          <span className="text-text">{formatDateTime(loan.checkout_time)}</span>{' '}
                          <span className={level === 'red' ? 'text-brand font-semibold' : level === 'yellow' ? 'text-amber-600 font-semibold' : 'text-muted'}>
                            ({formatDwell(loan.checkout_time)})
                          </span>
                        </p>
                        {loan.notes && (
                          <p>
                            <span className="text-muted">Athugasemd:</span>{' '}
                            <span className="text-text">{loan.notes}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-11 bg-brand hover:bg-brand-hover text-brand-fg font-semibold flex-shrink-0"
                      onClick={() => handleReturnClick(loan)}
                      disabled={returningId === loan.id}
                    >
                      {returningId === loan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Skila'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={showReturnConfirm} onOpenChange={setShowReturnConfirm}>
        <AlertDialogContent className="bg-surface-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text">Staðfesta skil</AlertDialogTitle>
            <AlertDialogDescription className="text-muted">
              Skrá bíl{' '}
              <span className="font-mono font-bold text-text">
                {selectedLoan?.license_plate}
              </span>{' '}
              sem skilaðan? Núverandi tími verður skráður sem skilatími.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface-3 border-border text-text hover:bg-surface-3/80">Hætta við</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReturn}
              className="bg-brand hover:bg-brand-hover text-brand-fg font-semibold"
            >
              Staðfesta skil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
