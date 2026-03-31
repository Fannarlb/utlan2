import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchAllLoans, type Loan } from '@/lib/api';
import { toast } from 'sonner';

export default function LoanHistory() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllLoans();
      setLoans(data);
    } catch (err) {
      console.error('Failed to load loan history:', err);
      toast.error('Ekki tókst að hlaða lánasögu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const filteredLoans = useMemo(() => {
    if (!search.trim()) return loans;
    const q = search.toLowerCase().trim();
    return loans.filter(
      (l) =>
        l.salesman_name.toLowerCase().includes(q) ||
        l.license_plate.toLowerCase().includes(q) ||
        l.customer_name.toLowerCase().includes(q) ||
        l.customer_phone.includes(q)
    );
  }, [loans, search]);

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
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
      <div className="bg-slate-700 text-white px-4 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-slate-600"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Lánasaga</h1>
          <p className="text-slate-300 text-xs">
            {filteredLoans.length} {filteredLoans.length !== 1 ? 'skrár' : 'skrá'}
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Leita eftir nafni, númeraplötu eða síma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Loans List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
            </div>
          ) : filteredLoans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                <p className="text-lg font-medium">Engar skrár fundust</p>
                <p className="text-sm mt-1">
                  {search ? 'Reyndu annað leitarorð' : 'Engin lánasaga ennþá'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLoans.map((loan) => (
              <Card key={loan.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono font-bold text-base text-slate-900">
                      {loan.license_plate}
                    </span>
                    <Badge
                      variant={loan.returned === 'yes' ? 'default' : 'destructive'}
                      className={
                        loan.returned === 'yes'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : ''
                      }
                    >
                      {loan.returned === 'yes' ? 'Skilað' : 'Virkt'}
                    </Badge>
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
                      {loan.customer_phone}
                    </p>
                    <p>
                      <span className="text-slate-400">Útlánað:</span>{' '}
                      {formatTime(loan.checkout_time)}
                    </p>
                    {loan.returned === 'yes' && (
                      <p>
                        <span className="text-slate-400">Skilað:</span>{' '}
                        {formatTime(loan.return_time)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}