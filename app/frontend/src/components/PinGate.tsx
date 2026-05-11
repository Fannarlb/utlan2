import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ToyotaLogo } from '@/components/ToyotaLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * PIN gate.
 *
 * Backend gates /api/v1/entities/* behind the X-Utlan2-Pin header. This
 * component stores the PIN in localStorage, exposes it to apiFetch via the
 * module-level getCurrentPin() function, and renders a lock screen until a
 * valid PIN has been entered.
 *
 * Threat model: an outside party discovers the API URL. We do not defend
 * against a stolen tablet, malicious staff, or shoulder-surfing — those have
 * other controls (PIN rotation, physical security, per-user accounts later).
 */

const STORAGE_KEY = 'utlan2Pin';

// API base mirrors lib/api.ts so the lock-screen probe doesn't need to import it.
const API_ROOT =
  import.meta.env.VITE_API_BASE_URL ?? 'https://utlan2-production.up.railway.app';

let currentPin: string | null = null;
let onAuthFailureCb: (() => void) | null = null;

/** apiFetch reads this on every request to set the X-Utlan2-Pin header. */
export function getCurrentPin(): string | null {
  return currentPin;
}

/** Called by apiFetch when a request returns 401. Wipes stored PIN and re-renders the lock screen. */
export function handleAuthFailure(): void {
  onAuthFailureCb?.();
}

export function PinGate({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    currentPin = pin;
    onAuthFailureCb = () => {
      localStorage.removeItem(STORAGE_KEY);
      currentPin = null;
      setPin(null);
      toast.error('Sessjón rann út. Sláðu inn PIN aftur.');
    };
    return () => {
      // If the gate unmounts (e.g. HMR) leave the module-level state pointing
      // at the last known value rather than dangling at undefined.
      onAuthFailureCb = null;
    };
  }, [pin]);

  if (!pin) {
    return (
      <LockScreen
        onUnlock={(p) => {
          localStorage.setItem(STORAGE_KEY, p);
          currentPin = p;
          setPin(p);
        }}
      />
    );
  }

  return <>{children}</>;
}

function LockScreen({ onUnlock }: { onUnlock: (pin: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = value.trim();
    if (!candidate) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_ROOT}/api/v1/entities/salesmen/all?limit=1`, {
        headers: { 'X-Utlan2-Pin': candidate },
      });
      if (res.status === 401) {
        setError('Rangt PIN.');
        setValue('');
      } else if (!res.ok) {
        setError('Tenging mistókst.');
      } else {
        onUnlock(candidate);
      }
    } catch {
      setError('Tenging mistókst.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-text flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs space-y-8">
        <div className="flex flex-col items-center gap-3">
          <ToyotaLogo className="w-20 h-12" />
          <span className="text-sm font-medium tracking-wide text-muted">Reynsluakstur</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            disabled={submitting}
            aria-label="PIN"
            className="h-14 text-2xl text-center bg-surface-2 border-border text-text placeholder:text-subtle"
            placeholder="••••"
          />
          {error && (
            <p className="text-sm text-brand text-center" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={submitting || !value.trim()}
            className="h-14 w-full text-base bg-brand hover:bg-brand-hover text-brand-fg font-semibold"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Opna'}
          </Button>
        </form>
      </div>
    </div>
  );
}
