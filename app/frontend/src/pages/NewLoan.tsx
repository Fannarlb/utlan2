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
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

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
      toast.error('Failed to load data. Please try again.');
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
      toast.error('Please fill in all fields');
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
      toast.success('Loan created successfully!');
      navigate('/active-loans');
    } catch (err) {
      console.error('Failed to create loan:', err);
      toast.error('Failed to create loan. Please try again.');
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
    salesman: 'Select Salesman',
    car: 'Select Car',
    form: 'Customer Info',
    confirm: '',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-800 text-white px-4 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-700"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">New Loan</h1>
          <p className="text-blue-200 text-xs">{stepLabels[step]}</p>
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
                  ? 'bg-blue-600'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-8">
        {/* Step 1: Select Salesman */}
        {step === 'salesman' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500 mb-3">
              Choose the salesman handling this loan:
            </p>
            {salesmen.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                className="w-full justify-start text-left h-14 text-base"
                onClick={() => handleSelectSalesman(s.name)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold mr-3 flex-shrink-0">
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
            <p className="text-sm text-slate-500 mb-1">
              Salesman: <span className="font-medium text-slate-700">{selectedSalesman}</span>
            </p>
            <p className="text-sm text-slate-500 mb-3">
              Choose an available car ({availableCars.length} of {cars.length} available):
            </p>
            {availableCars.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-slate-500">
                  No cars available. All cars are currently checked out.
                </CardContent>
              </Card>
            ) : (
              availableCars.map((c) => (
                <Button
                  key={c.id}
                  variant="outline"
                  className="w-full justify-start text-left h-14 text-base font-mono"
                  onClick={() => handleSelectCar(c.license_plate)}
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3 flex-shrink-0">
                    🚗
                  </div>
                  {c.license_plate}
                </Button>
              ))
            )}
          </div>
        )}

        {/* Step 3: Customer Form */}
        {step === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
              <div className="text-sm text-slate-500 space-y-0.5">
                <p>
                  Salesman: <span className="font-medium text-slate-700">{selectedSalesman}</span>
                </p>
                <p>
                  Car: <span className="font-medium text-slate-700 font-mono">{selectedCar}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12 text-base"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-12 text-base"
                    autoComplete="off"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                >
                  Review & Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Loan Checkout</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Please confirm the following details:</p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                  <p>
                    <span className="text-slate-500">Salesman:</span>{' '}
                    <span className="font-medium text-slate-900">{selectedSalesman}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Car:</span>{' '}
                    <span className="font-medium text-slate-900 font-mono">{selectedCar}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Customer:</span>{' '}
                    <span className="font-medium text-slate-900">{customerName}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Phone:</span>{' '}
                    <span className="font-medium text-slate-900">{customerPhone}</span>
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirm Checkout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}