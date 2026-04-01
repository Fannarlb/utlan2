import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  fetchSalesmen,
  fetchCars,
  fetchActiveLoans,
  createLoan,
  type Salesman,
  type Car,
} from '@/lib/api';

type Step = 'salesman' | 'car' | 'form' | 'confirm';

export default function NewLoan() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('salesman');
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesmenData, carsData, activeLoans] = await Promise.all([
        fetchSalesmen(),
        fetchCars(),
        fetchActiveLoans(),
      ]);
      setSalesmen(salesmenData);
      setCars(carsData);

      const activePlates = new Set(activeLoans.map((l) => l.license_plate));
      const available = carsData.filter(
        (c) => !activePlates.has(c.license_plate)
      );
      setAvailableCars(available);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Ekki tókst að hlaða gögnum. Reyndu aftur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleConfirmSave = async () => {
    setSubmitting(true);
    try {
      await createLoan({
        salesman_name: selectedSalesman,
        license_plate: selectedCar,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
      });
      toast.success('Lán stofnað!');
      navigate('/active-loans');
    } catch (err) {
      console.error('Failed to create loan:', err);
      toast.error('Ekki tókst að stofna lán. Reyndu aftur.');
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-blue-900 text-white px-4 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-800"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Nýtt lán</h1>
          <p className="text-blue-300 text-xs">{stepLabels[step]}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex gap-1 mb-4">
          {(['salesman', 'car', 'form'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                ['salesman', 'car', 'form'].indexOf(step) >= i
                  ? 'bg-blue-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-8">
        {/* Step 1: Select Salesman */}
        {step === 'salesman' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400 mb-3">
              Veldu sölumanninn sem sér um þetta lán:
            </p>
            {salesmen.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                className="w-full justify-start text-left h-14 text-base bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white"
                onClick={() => handleSelectSalesman(s.name)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-semibold mr-3 flex-shrink-0">
                  {s.name.charAt(0)}
                </div>
                {s.name}
              </Button>
            ))}
          </div>
        )}

        {/* Step 2: Select Car */}
        {step === 'car' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400 mb-1">
              Sölumaður: <span className="font-medium text-slate-200">{selectedSalesman}</span>
            </p>
            <p className="text-sm text-slate-400 mb-3">
              Veldu tiltækan bíl ({availableCars.length} af {cars.length} tiltækir):
            </p>
            {availableCars.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center text-slate-400">
                  Engir bílar tiltækir. Allir bílar eru útlánaðir.
                </CardContent>
              </Card>
            ) : (
              availableCars.map((c) => {
                const { plateNum, model } = parseCar(c.license_plate);
                return (
                  <Button
                    key={c.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 text-base bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white"
                    onClick={() => handleSelectCar(c.license_plate)}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-900/50 text-green-400 flex items-center justify-center mr-3 flex-shrink-0">
                      🚗
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-mono font-bold">{plateNum}</span>
                      {model && <span className="text-xs text-slate-400">{model}</span>}
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        )}

        {/* Step 3: Customer Form */}
        {step === 'form' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Upplýsingar viðskiptavinar</CardTitle>
              <div className="text-sm text-slate-400 space-y-0.5">
                <p>
                  Sölumaður: <span className="font-medium text-slate-200">{selectedSalesman}</span>
                </p>
                <p>
                  Bíll: <span className="font-medium text-slate-200 font-mono">{selectedCar}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-slate-300">Nafn viðskiptavinar</Label>
                  <Input
                    id="customerName"
                    placeholder="Sláðu inn nafn"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12 text-base bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-slate-300">Símanúmer viðskiptavinar</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="Sláðu inn símanúmer"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-12 text-base bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                    autoComplete="off"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
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
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Staðfesta útlán</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">Vinsamlegast staðfestu eftirfarandi upplýsingar:</p>
                <div className="bg-slate-900 rounded-lg p-3 space-y-1.5">
                  <p>
                    <span className="text-slate-500">Sölumaður:</span>{' '}
                    <span className="font-medium text-slate-200">{selectedSalesman}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Bíll:</span>{' '}
                    <span className="font-medium text-slate-200 font-mono">{selectedCar}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Viðskiptavinur:</span>{' '}
                    <span className="font-medium text-slate-200">{customerName}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Sími:</span>{' '}
                    <span className="font-medium text-slate-200">{customerPhone}</span>
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting} className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600">Hætta við</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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