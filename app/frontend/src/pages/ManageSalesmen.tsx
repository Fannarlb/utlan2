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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-text" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
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
        <div>
          <h1 className="text-lg font-bold">Sölumannastjórnun</h1>
          <p className="text-muted text-xs">Bæta við og fjarlægja sölumenn</p>
        </div>
      </div>

      <div className="max-w-md md:max-w-3xl mx-auto px-4 py-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start">
        {/* Add salesman form */}
        <Card className="bg-surface-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-text">Bæta við sölumanni</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-muted">Nafn / skammstöfun</Label>
                <Input
                  id="name"
                  placeholder="t.d. JÓN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-surface border-border text-text placeholder:text-subtle"
                  autoComplete="off"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={adding || !name.trim()}
                className="w-full h-11 bg-text hover:bg-text/90 text-surface font-semibold"
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
          <p className="text-sm text-muted mb-2">{salesmen.length} sölumenn skráðir</p>
          {salesmen.length === 0 ? (
            <Card className="bg-surface-2 border-border">
              <CardContent className="p-6 text-center text-muted">
                Engir sölumenn skráðir.
              </CardContent>
            </Card>
          ) : (
            <ul className="divide-y divide-border bg-surface-2 border border-border">
              {salesmen.map((salesman) => {
                const isActive = activeNames.has(salesman.name);
                return (
                  <li
                    key={salesman.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text">{salesman.name}</p>
                      {isActive && <p className="text-xs text-brand">Með virkt lán</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isActive}
                      onClick={() => handleRemove(salesman)}
                      className="h-11 w-11 text-text hover:text-brand hover:bg-surface-3 disabled:opacity-30 flex-shrink-0"
                      aria-label={isActive ? `Ekki hægt að fjarlægja ${salesman.name} (með virkt lán)` : `Fjarlægja ${salesman.name}`}
                      title={isActive ? 'Ekki hægt að fjarlægja sölumann með virkt lán' : 'Fjarlægja sölumann'}
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
