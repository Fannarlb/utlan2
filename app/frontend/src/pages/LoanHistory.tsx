import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchAllLoans, exportLoansToCSV, exportLoansForBusinessCentral, type Loan } from '@/lib/api';
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
    <div className="min-h-screen bg-surface">
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
        <div className="flex-1">
          <h1 className="text-lg font-bold">Lánasaga</h1>
          <p className="text-muted text-xs">
            {filteredLoans.length} {filteredLoans.length !== 1 ? 'skrár' : 'skrá'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Flytja út lánasögu sem CSV"
          className="h-11 text-text hover:bg-surface-3 gap-1.5"
          onClick={() => exportLoansToCSV(filteredLoans)}
          disabled={filteredLoans.length === 0}
        >
          <FileDown className="w-4 h-4" />
          CSV
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Flytja út fyrir Business Central"
          className="h-11 text-text hover:bg-surface-3 gap-1.5"
          onClick={() => exportLoansForBusinessCentral(filteredLoans)}
          disabled={filteredLoans.length === 0}
        >
          <FileDown className="w-4 h-4" />
          BC
        </Button>
      </div>

      <div className="max-w-md md:max-w-4xl mx-auto p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text" aria-hidden="true" />
          <Input
            placeholder="Leita eftir nafni, númeraplötu eða síma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-surface-2 border-border text-text placeholder:text-subtle"
            aria-label="Leita í lánasögu"
          />
        </div>

        {/* Loans List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-text" />
          </div>
        ) : filteredLoans.length === 0 ? (
          <Card className="bg-surface-2 border-border">
            <CardContent className="p-8 text-center">
              <p className="text-lg font-medium text-text">Engar skrár fundust</p>
              <p className="text-sm mt-1 text-muted">
                {search ? 'Reyndu annað leitarorð' : 'Engin lánasaga ennþá'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredLoans.map((loan) => (
              <Card key={loan.id} className="bg-surface-2 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <span className="font-mono font-bold text-base text-text">
                      {loan.license_plate}
                    </span>
                    <Badge
                      variant={loan.returned === 'yes' ? 'default' : 'destructive'}
                      className={
                        loan.returned === 'yes'
                          ? 'bg-surface-3 text-text border border-border hover:bg-surface-3'
                          : 'bg-brand text-brand-fg hover:bg-brand-hover border-0'
                      }
                    >
                      {loan.returned === 'yes' ? 'Skilað' : 'Virkt'}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-0.5">
                    <p>
                      <span className="text-muted">Sölumaður:</span>{' '}
                      <span className="text-text">{loan.salesman_name}</span>
                    </p>
                    <p>
                      <span className="text-muted">Viðskiptavinur:</span>{' '}
                      <span className="text-text">{loan.customer_name}</span>
                    </p>
                    {loan.customer_kennitala && (
                      <p>
                        <span className="text-muted">Kennitala:</span>{' '}
                        <span className="text-text">{loan.customer_kennitala}</span>
                      </p>
                    )}
                    <p>
                      <span className="text-muted">Sími:</span>{' '}
                      <span className="text-text">{loan.customer_phone}</span>
                    </p>
                    <p>
                      <span className="text-muted">Útlánað:</span>{' '}
                      <span className="text-text">{formatTime(loan.checkout_time)}</span>
                    </p>
                    {loan.notes && (
                      <p>
                        <span className="text-muted">Athugasemd:</span>{' '}
                        <span className="text-text">{loan.notes}</span>
                      </p>
                    )}
                    {loan.returned === 'yes' && (
                      <p>
                        <span className="text-muted">Skilað:</span>{' '}
                        <span className="text-text">{formatTime(loan.return_time)}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
