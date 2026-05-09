import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, History, Settings2, Users } from 'lucide-react';
import { ToyotaLogo } from '@/components/ToyotaLogo';
import { fetchActiveLoans } from '@/lib/api';

export default function Index() {
  const navigate = useNavigate();
  const [activeCount, setActiveCount] = useState<number | null>(null);

  const loadActive = useCallback(async () => {
    try {
      const loans = await fetchActiveLoans();
      setActiveCount(loans.length);
    } catch {
      setActiveCount(null);
    }
  }, []);

  useEffect(() => {
    loadActive();
  }, [loadActive]);

  return (
    <div className="min-h-screen bg-surface text-text flex flex-col">
      {/* Header bar */}
      <header className="border-b border-border bg-surface-2">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">
          <ToyotaLogo className="w-12 h-8 flex-shrink-0" />
          <span className="text-sm font-medium tracking-wide text-muted">Reynsluakstur</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8 md:py-14 space-y-8 md:space-y-12">
        {/* Title block — typography hierarchy, not a card */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none">
            Útlán
          </h1>
          <p className="text-muted text-base md:text-lg">
            {activeCount === null
              ? 'Skrá ný útlán, fylgja eftir virku og halda lánasögu.'
              : activeCount === 0
                ? 'Engir bílar úti núna.'
                : `${activeCount} ${activeCount === 1 ? 'bíll' : 'bílar'} úti núna.`}
          </p>
        </div>

        {/* Primary action — hero block, bg-brand red, takes center stage */}
        <button
          type="button"
          onClick={() => navigate('/new-loan')}
          className="group w-full bg-brand hover:bg-brand-hover text-brand-fg text-left p-6 md:p-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80 mb-1">Skrá nýtt</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Nýtt útlán</h2>
              <p className="text-sm md:text-base mt-1 opacity-90">
                Sölumaður, bíll, viðskiptavinur.
              </p>
            </div>
            <ArrowRight className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </div>
        </button>

        {/* Secondary — Virk lán, full width but quieter */}
        <button
          type="button"
          onClick={() => navigate('/active-loans')}
          className="w-full bg-surface-2 hover:bg-surface-3 border border-border text-text text-left p-5 md:p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <div className="flex items-center gap-4">
            <ClipboardList className="w-6 h-6 text-text flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                Virk lán
                {activeCount !== null && activeCount > 0 && (
                  <span className="ml-3 inline-block bg-brand text-brand-fg text-sm font-bold px-2 py-0.5 align-middle">
                    {activeCount}
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted">Skoða útlánaða bíla og skila</p>
            </div>
            <ArrowRight className="w-5 h-5 text-text flex-shrink-0" aria-hidden="true" />
          </div>
        </button>

        {/* Tertiary — three smaller utility links in a row */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-subtle mb-3">Annað</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border">
            <UtilityLink
              icon={<History className="w-5 h-5" aria-hidden="true" />}
              label="Lánasaga"
              hint="Leita og flytja út"
              onClick={() => navigate('/loan-history')}
            />
            <UtilityLink
              icon={<Settings2 className="w-5 h-5" aria-hidden="true" />}
              label="Bílastjórnun"
              hint="Bæta við og fjarlægja"
              onClick={() => navigate('/manage-cars')}
            />
            <UtilityLink
              icon={<Users className="w-5 h-5" aria-hidden="true" />}
              label="Sölumannastjórnun"
              hint="Bæta við og fjarlægja"
              onClick={() => navigate('/manage-salesmen')}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function UtilityLink({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-surface-2 hover:bg-surface-3 text-left p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-inset"
    >
      <div className="flex items-start gap-3">
        <div className="text-text mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text">{label}</p>
          <p className="text-xs text-muted mt-0.5">{hint}</p>
        </div>
      </div>
    </button>
  );
}
