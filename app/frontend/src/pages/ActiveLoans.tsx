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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-amber-600 text-white px-4 py-4 flex items-center gap-3">
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
          <p className="text-amber-100 text-xs">
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
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : loans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              <p className="text-lg font-medium">Engin virk lán</p>
              <p className="text-sm mt-1">Allir bílar eru á lóðinni</p>
            </CardContent>
          </Card>
        ) : (
          loans.map((loan) => (
            <Card key={loan.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-slate-900">
                        {loan.license_plate}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-0.5">
                      <p>
                        <span className="text-slate-400">Sölumaður:</span>{' '}
                        {loan.salesman_name}
                      </p>
                      <p>
                        <span className="text-slate-400">Viðskiptavinur:</span>{' '}
                        {loan.customer_name}
                      </p>
                      <p>
                        <span className="text-slate-400">Sími:</span>{' '}
                        <a
                          href={`tel:${loan.customer_phone}`}
                          className="text-blue-600 underline"
                        >
                          {loan.customer_phone}
                        </a>
                      </p>
                      <p>
                        <span className="text-slate-400">Útlánað síðan:</span>{' '}
                        {formatTime(loan.checkout_time)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50 ml-3 flex-shrink-0"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Staðfesta skil</AlertDialogTitle>
            <AlertDialogDescription>
              Skrá bíl{' '}
              <span className="font-mono font-bold">
                {selectedLoan?.license_plate}
              </span>{' '}
              sem skilaðan? Núverandi tími verður skráður sem skilatími.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hætta við</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReturn}
              className="bg-green-600 hover:bg-green-700"
            >
              Staðfesta skil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}