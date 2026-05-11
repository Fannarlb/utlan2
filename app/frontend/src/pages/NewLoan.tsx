import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
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
import { useSalesmen, useAllCars, useAvailableCars, useCreateLoan } from '@/lib/queries';

type Step = 'salesman' | 'car' | 'form' | 'confirm';

export default function NewLoan() {
  const navigate = useNavigate();
  const { data: salesmen = [], isLoading: salesmenLoading } = useSalesmen();
  const { data: cars = [], isLoading: carsLoading } = useAllCars();
  const { data: availableCars = [], isLoading: availableLoading } = useAvailableCars();
  const createLoanMutation = useCreateLoan();

  const loading = salesmenLoading || carsLoading || availableLoading;
  const submitting = createLoanMutation.isPending;

  const [step, setStep] = useState<Step>('salesman');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerKennitala, setCustomerKennitala] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectSalesman = (name: string) => {
    setSelectedSalesman(name);
    setStep('car');
  };

  const handleSelectCar = (plate: string) => {
    setSelectedCar(plate);
    setStep('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Vinsamlegast fylltu út alla reiti');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    createLoanMutation.mutate(
      {
        salesman_name: selectedSalesman,
        license_plate: selectedCar,
        customer_name: customerName.trim(),
        customer_kennitala: customerKennitala.trim(),
        customer_phone: customerPhone.trim(),
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Lán stofnað!');
          navigate('/active-loans');
        },
        onSettled: () => setShowConfirm(false),
      }
    );
  };

  const handleBack = () => {
    if (step === 'car') setStep('salesman');
    else if (step === 'form') setStep('car');
    else navigate('/');
  };

  const stepLabels: Record<Step, string> = {
    salesman: 'Veldu sölumann',
    car: 'Veldu bíl',
    form: 'Upplýsingar viðskiptavinar',
    confirm: '',
  };

  // Parse plate and model from license_plate string
  const parseCar = (plate: string) => {
    const parts = plate.split(' ');
    const plateNum = parts[0] || plate;
    const model = parts.slice(1).join(' ') || '';
    return { plateNum, model };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-text" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader title="Nýtt lán" subtitle={stepLabels[step]} onBack={handleBack} />

      {/* Progress */}
      <div className="max-w-md md:max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-1 mb-5" role="progressbar" aria-valuenow={['salesman', 'car', 'form'].indexOf(step) + 1} aria-valuemin={1} aria-valuemax={3} aria-label="Skref">
          {(['salesman', 'car', 'form'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 transition-colors ${
                ['salesman', 'car', 'form'].indexOf(step) >= i
                  ? 'bg-text'
                  : 'bg-surface-3'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-md md:max-w-2xl mx-auto px-4 pb-8">
        {/* Step 1: Select Salesman */}
        {step === 'salesman' && (
          <div className="space-y-2">
            <p className="text-sm text-muted mb-3">
              Veldu sölumanninn sem sér um þetta lán:
            </p>
            {salesmen.length === 0 ? (
              <Card className="bg-surface-2 border-border">
                <CardContent className="p-6 text-center space-y-3">
                  <p className="text-text">Engir sölumenn skráðir.</p>
                  <p className="text-sm text-muted">Bættu við sölumanni undir Sölumannastjórnun til að halda áfram.</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/manage-salesmen')}
                    className="bg-transparent border-border text-text hover:bg-surface-3"
                  >
                    Fara í Sölumannastjórnun
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {salesmen.map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    className="w-full justify-start text-left h-14 text-base bg-surface-2 border-border text-text hover:bg-surface-3 hover:border-border-strong"
                    onClick={() => handleSelectSalesman(s.name)}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Car */}
        {step === 'car' && (
          <div className="space-y-2">
            <p className="text-sm text-muted mb-1">
              Sölumaður: <span className="font-medium text-text">{selectedSalesman}</span>
            </p>
            <p className="text-sm text-muted mb-3">
              Veldu tiltækan bíl ({availableCars.length} af {cars.length} tiltækir):
            </p>
            {availableCars.length === 0 ? (
              <Card className="bg-surface-2 border-border">
                <CardContent className="p-6 text-center space-y-3">
                  {cars.length === 0 ? (
                    <>
                      <p className="text-text">Engir bílar skráðir.</p>
                      <p className="text-sm text-muted">Bættu við bíl undir Bílastjórnun til að halda áfram.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/manage-cars')}
                        className="bg-transparent border-border text-text hover:bg-surface-3"
                      >
                        Fara í Bílastjórnun
                      </Button>
                    </>
                  ) : (
                    <p className="text-text">Engir bílar tiltækir. Allir bílar eru útlánaðir.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {availableCars.map((c) => {
                  const { plateNum, model } = parseCar(c.license_plate);
                  return (
                    <Button
                      key={c.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 text-base bg-surface-2 border-border text-text hover:bg-surface-3 hover:border-border-strong"
                      onClick={() => handleSelectCar(c.license_plate)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-mono font-bold text-lg">{plateNum}</span>
                        {model && <span className="text-xs text-muted">{model}</span>}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Customer Form */}
        {step === 'form' && (
          <Card className="bg-surface-2 border-border">
            <CardHeader>
              <CardTitle className="text-base text-text">Upplýsingar viðskiptavinar</CardTitle>
              <div className="text-sm text-muted space-y-0.5">
                <p>
                  Sölumaður: <span className="font-medium text-text">{selectedSalesman}</span>
                </p>
                <p>
                  Bíll: <span className="font-medium text-text font-mono">{selectedCar}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customerName" className="text-muted">Nafn viðskiptavinar</Label>
                    <Input
                      id="customerName"
                      placeholder="Sláðu inn nafn"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-12 text-base bg-surface border-border text-text placeholder:text-subtle"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerKennitala" className="text-muted">Kennitala</Label>
                    <Input
                      id="customerKennitala"
                      placeholder="Sláðu inn kennitölu"
                      value={customerKennitala}
                      onChange={(e) => setCustomerKennitala(e.target.value)}
                      className="h-12 text-base bg-surface border-border text-text placeholder:text-subtle"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-muted">Símanúmer viðskiptavinar</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="Sláðu inn símanúmer"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-12 text-base bg-surface border-border text-text placeholder:text-subtle"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-muted">Athugasemd</Label>
                  <textarea
                    id="notes"
                    placeholder="Athugasemd (valfrjálst)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-surface border border-border text-text placeholder:text-subtle px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-text focus:border-transparent"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-text hover:bg-text/90 text-surface font-semibold"
                >
                  Yfirfara og senda
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-surface-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text">Staðfesta útlán</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p className="text-muted">Vinsamlegast staðfestu eftirfarandi upplýsingar:</p>
                <div className="bg-surface p-3 space-y-1.5 border border-border">
                  <p>
                    <span className="text-muted">Sölumaður:</span>{' '}
                    <span className="font-medium text-text">{selectedSalesman}</span>
                  </p>
                  <p>
                    <span className="text-muted">Bíll:</span>{' '}
                    <span className="font-medium text-text font-mono">{selectedCar}</span>
                  </p>
                  <p>
                    <span className="text-muted">Viðskiptavinur:</span>{' '}
                    <span className="font-medium text-text">{customerName}</span>
                  </p>
                  {customerKennitala.trim() && (
                    <p>
                      <span className="text-muted">Kennitala:</span>{' '}
                      <span className="font-medium text-text">{customerKennitala}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-muted">Sími:</span>{' '}
                    <span className="font-medium text-text">{customerPhone}</span>
                  </p>
                  {notes.trim() && (
                    <p>
                      <span className="text-muted">Athugasemd:</span>{' '}
                      <span className="font-medium text-text">{notes}</span>
                    </p>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting} className="bg-surface-3 border-border text-text hover:bg-surface-3/80">Hætta við</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={submitting}
              className="bg-brand hover:bg-brand-hover text-brand-fg font-semibold"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Staðfesta útlán
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
