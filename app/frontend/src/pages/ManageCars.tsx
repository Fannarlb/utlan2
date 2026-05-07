import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  fetchAllCars,
  fetchActiveLoans,
  addCar,
  removeCar,
  type Car,
} from '@/lib/api';

const parseCar = (license_plate: string) => {
  const parts = license_plate.split(' ');
  return { plateNum: parts[0] || license_plate, model: parts.slice(1).join(' ') };
};

export default function ManageCars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [activePlates, setActivePlates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allCars, activeLoans] = await Promise.all([
        fetchAllCars(),
        fetchActiveLoans(),
      ]);
      setCars(allCars);
      setActivePlates(new Set(activeLoans.map((l) => l.license_plate)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPlate = plate.trim();
    const trimmedModel = model.trim();
    if (!trimmedPlate) return;

    const licensePlate = trimmedModel ? `${trimmedPlate} ${trimmedModel}` : trimmedPlate;
    setAdding(true);
    try {
      await addCar(licensePlate);
      toast.success(`Bíll ${trimmedPlate} bætt við`);
      setPlate('');
      setModel('');
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ekki tókst að bæta við bíl');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (car: Car) => {
    try {
      await removeCar(car.id);
      const { plateNum } = parseCar(car.license_plate);
      toast.success(`Bíll ${plateNum} fjarlægður`);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ekki tókst að fjarlægja bíl');
    }
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
          className="h-10 w-10 hover:bg-blue-800 rounded-md text-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Bílastjórnun</h1>
          <p className="text-blue-300 text-xs">Bæta við og fjarlægja bíla</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Add car form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-100">Bæta við bíl</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="plate" className="text-slate-300">Númeraplata</Label>
                <Input
                  id="plate"
                  placeholder="t.d. ATA-00"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="h-11 bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500 font-mono"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-slate-300">
                  Gerð <span className="text-slate-500 font-normal">(valfrjálst)</span>
                </Label>
                <Input
                  id="model"
                  placeholder="t.d. C-HR PHEV GR"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-11 bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                disabled={adding || !plate.trim()}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
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
          <p className="text-sm text-slate-400 mb-2">{cars.length} bílar skráðir</p>
          <div className="space-y-2">
            {cars.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center text-slate-400">
                  Engir bílar skráðir.
                </CardContent>
              </Card>
            ) : (
              cars.map((car) => {
                const { plateNum, model: carModel } = parseCar(car.license_plate);
                const isOnLoan = activePlates.has(car.license_plate);
                return (
                  <div
                    key={car.id}
                    className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-900/50 text-green-400 flex items-center justify-center flex-shrink-0">
                      🚗
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-slate-100">{plateNum}</p>
                      {carModel && <p className="text-xs text-slate-400">{carModel}</p>}
                      {isOnLoan && <p className="text-xs text-amber-400">Útlánað</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isOnLoan}
                      onClick={() => handleRemove(car)}
                      className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-slate-700 disabled:opacity-30 flex-shrink-0"
                      title={isOnLoan ? 'Ekki hægt að fjarlægja útlanaðan bíl' : 'Fjarlægja bíl'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
