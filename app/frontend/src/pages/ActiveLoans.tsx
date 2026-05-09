import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
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
import { fetchActiveLoans, markReturned, type Loan } from '@/lib/api';

export default function ActiveLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<number | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchActiveLoans();
      setLoans(data);
    } catch (err) {
      console.error('Failed to load active loans:', err);
      toast.error('Ekki tókst að hlaða virk lán');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const handleReturnClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowReturnConfirm(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedLoan) return;
    setReturningId(selectedLoan.id);
    try {
      await markReturned(selectedLoan.id);
      toast.success(`Bíll ${selectedLoan.license_plate} skráður sem skilaður`);
      setLoans((prev) => prev.filter((l) => l.id !== selectedLoan.id));
    } catch (err) {
      console.error('Failed to mark returned:', err);
      toast.error('Ekki tókst að skrá skil');
    } finally {
      setReturningId(null);
      setShowReturnConfirm(false);
      setSelectedLoan(null);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('is-IS', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-surface-2 border-b border-border text-text px-4 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Til baka"
          className="h-11 w-11 text-text hover:bg-surface-3"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Virk lán</h1>
          <p className="text-muted text-xs">
            {loans.length} {loans.length !== 1 ? 'bílar' : 'bíll'} útlánaðir
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Endurnýja lista"
          className="h-11 w-11 text-text hover:bg-surface-3"
          onClick={loadLoans}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

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
            {loans.map((loan) => (
              <Card key={loan.id} className="bg-surface-2 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="font-mono font-bold text-lg text-text block">
                        {loan.license_plate}
                      </span>
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
                          <span className="text-text">{formatTime(loan.checkout_time)}</span>
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
            ))}
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
