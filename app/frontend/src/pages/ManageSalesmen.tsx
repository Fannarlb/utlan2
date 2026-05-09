import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  fetchSalesmen,
  fetchActiveLoans,
  addSalesman,
  removeSalesman,
  type Salesman,
} from '@/lib/api';

export default function ManageSalesmen() {
  const navigate = useNavigate();
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [activeNames, setActiveNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allSalesmen, activeLoans] = await Promise.all([
        fetchSalesmen(),
        fetchActiveLoans(),
      ]);
      setSalesmen(allSalesmen);
      setActiveNames(new Set(activeLoans.map((l) => l.salesman_name)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      await addSalesman(name.trim());
      toast.success(`${name.trim()} bætt við`);
      setName('');
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ekki tókst að bæta við sölumanni');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (salesman: Salesman) => {
    try {
      await removeSalesman(salesman.id);
      toast.success(`${salesman.name} fjarlægður`);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ekki tókst að fjarlægja sölumann');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="bg-zinc-800 text-white px-4 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-zinc-700 rounded-none text-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Sölumannastjórnun</h1>
          <p className="text-zinc-400 text-xs">Bæta við og fjarlægja sölumenn</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Add salesman form */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Bæta við sölumanni</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-zinc-300">Nafn / skammstöfun</Label>
                <Input
                  id="name"
                  placeholder="t.d. JÓN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                  autoComplete="off"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={adding || !name.trim()}
                className="w-full h-11 bg-white hover:bg-zinc-200 text-white"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Bæta við sölumanni
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Salesmen list */}
        <div>
          <p className="text-sm text-zinc-400 mb-2">{salesmen.length} sölumenn skráðir</p>
          <div className="space-y-2">
            {salesmen.length === 0 ? (
              <Card className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-6 text-center text-zinc-400">
                  Engir sölumenn skráðir.
                </CardContent>
              </Card>
            ) : (
              salesmen.map((salesman) => {
                const isActive = activeNames.has(salesman.name);
                return (
                  <div
                    key={salesman.id}
                    className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-none px-4 py-3"
                  >
                    <div className="w-8 h-8 rounded-none bg-zinc-700 text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                      {salesman.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{salesman.name}</p>
                      {isActive && <p className="text-xs text-white">Með virkt lán</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isActive}
                      onClick={() => handleRemove(salesman)}
                      className="h-9 w-9 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 disabled:opacity-30 flex-shrink-0"
                      title={isActive ? 'Ekki hægt að fjarlægja sölumann með virkt lán' : 'Fjarlægja sölumann'}
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
