import { useMemo, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { type Car } from '@/lib/api';
import { useAllCars, useActiveLoans, useAddCar, useRemoveCar } from '@/lib/queries';

const parseCar = (license_plate: string) => {
  const parts = license_plate.split(' ');
  return { plateNum: parts[0] || license_plate, model: parts.slice(1).join(' ') };
};

export default function ManageCars() {
  const { data: cars = [], isLoading: carsLoading } = useAllCars();
  const { data: activeLoans = [], isLoading: loansLoading } = useActiveLoans();
  const addCarMutation = useAddCar();
  const removeCarMutation = useRemoveCar();

  const loading = carsLoading || loansLoading;
  const activePlates = useMemo(
    () => new Set(activeLoans.map((l) => l.license_plate)),
    [activeLoans]
  );

  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const adding = addCarMutation.isPending;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPlate = plate.trim();
    const trimmedModel = model.trim();
    if (!trimmedPlate) return;

    const licensePlate = trimmedModel ? `${trimmedPlate} ${trimmedModel}` : trimmedPlate;
    addCarMutation.mutate(licensePlate, {
      onSuccess: () => {
        toast.success(`Bíll ${trimmedPlate} bætt við`);
        setPlate('');
        setModel('');
      },
    });
  };

  const handleRemove = (car: Car) => {
    const { plateNum } = parseCar(car.license_plate);
    removeCarMutation.mutate(car.id, {
      onSuccess: () => toast.success(`Bíll ${plateNum} fjarlægður`),
    });
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
      <PageHeader title="Bílastjórnun" subtitle="Bæta við og fjarlægja bíla" backTo="/" />

      <div className="max-w-md md:max-w-3xl mx-auto px-4 py-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start">
        {/* Add car form */}
        <Card className="bg-surface-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-text">Bæta við bíl</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="plate" className="text-muted">Númeraplata</Label>
                <Input
                  id="plate"
                  placeholder="t.d. ATA-00"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="h-11 bg-surface border-border text-text placeholder:text-subtle font-mono"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-muted">
                  Gerð <span className="text-subtle font-normal">(valfrjálst)</span>
                </Label>
                <Input
                  id="model"
                  placeholder="t.d. C-HR PHEV GR"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-11 bg-surface border-border text-text placeholder:text-subtle"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                disabled={adding || !plate.trim()}
                className="w-full h-11 bg-text hover:bg-text/90 text-surface font-semibold"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Bæta við bíl
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Car list */}
        <div>
          <p className="text-sm text-muted mb-2">{cars.length} bílar skráðir</p>
          {cars.length === 0 ? (
            <Card className="bg-surface-2 border-border">
              <CardContent className="p-6 text-center text-muted">
                Engir bílar skráðir.
              </CardContent>
            </Card>
          ) : (
            <ul className="divide-y divide-border bg-surface-2 border border-border">
              {cars.map((car) => {
                const { plateNum, model: carModel } = parseCar(car.license_plate);
                const isOnLoan = activePlates.has(car.license_plate);
                return (
                  <li
                    key={car.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-text">{plateNum}</p>
                      {carModel && <p className="text-xs text-muted">{carModel}</p>}
                      {isOnLoan && <p className="text-xs text-brand">Útlánað</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isOnLoan}
                      onClick={() => handleRemove(car)}
                      className="h-11 w-11 text-text hover:text-brand hover:bg-surface-3 disabled:opacity-30 flex-shrink-0"
                      aria-label={isOnLoan ? `Ekki hægt að fjarlægja ${plateNum} (útlánað)` : `Fjarlægja ${plateNum}`}
                      title={isOnLoan ? 'Ekki hægt að fjarlægja útlanaðan bíl' : 'Fjarlægja bíl'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
