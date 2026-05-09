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
    <div className="min-h-screen bg-zinc-900">
      <div className="bg-amber-800 text-white px-4 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-amber-700"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Virk lán</h1>
          <p className="text-amber-200 text-xs">
            {loans.length} {loans.length !== 1 ? 'bílar' : 'bíll'} útlánaðir
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-amber-700"
          onClick={loadLoans}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : loans.length === 0 ? (
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-8 text-center text-zinc-400">
              <p className="text-lg font-medium">Engin virk lán</p>
              <p className="text-sm mt-1">Allir bílar eru á lóðinni</p>
            </CardContent>
          </Card>
        ) : (
          loans.map((loan) => (
            <Card key={loan.id} className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-white">
                        {loan.license_plate}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400 space-y-0.5">
                      <p>
                        <span className="text-zinc-500">Sölumaður:</span>{' '}
                        <span className="text-zinc-300">{loan.salesman_name}</span>
                      </p>
                      <p>
                        <span className="text-zinc-500">Viðskiptavinur:</span>{' '}
                        <span className="text-zinc-300">{loan.customer_name}</span>
                      </p>
                      {loan.customer_kennitala && (
                        <p>
                          <span className="text-zinc-500">Kennitala:</span>{' '}
                          <span className="text-zinc-300">{loan.customer_kennitala}</span>
                        </p>
                      )}
                      <p>
                        <span className="text-zinc-500">Sími:</span>{' '}
                        <a
                          href={`tel:${loan.customer_phone}`}
                          className="text-white underline"
                        >
                          {loan.customer_phone}
                        </a>
                      </p>
                      <p>
                        <span className="text-zinc-500">Útlánað síðan:</span>{' '}
                        <span className="text-zinc-300">{formatTime(loan.checkout_time)}</span>
                      </p>
                      {loan.notes && (
                        <p>
                          <span className="text-zinc-500">Athugasemd:</span>{' '}
                          <span className="text-zinc-300">{loan.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-white hover:bg-green-900/30 ml-3 flex-shrink-0"
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
          ))
        )}
      </div>

      <AlertDialog open={showReturnConfirm} onOpenChange={setShowReturnConfirm}>
        <AlertDialogContent className="bg-zinc-800 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Staðfesta skil</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Skrá bíl{' '}
              <span className="font-mono font-bold text-white">
                {selectedLoan?.license_plate}
              </span>{' '}
              sem skilaðan? Núverandi tími verður skráður sem skilatími.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-700 border-zinc-700 text-white hover:bg-zinc-700">Hætta við</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReturn}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Staðfesta skil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}