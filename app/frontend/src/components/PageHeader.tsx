import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Path to navigate to when the back arrow is pressed. */
  backTo?: string;
  /** Custom back handler — wins over backTo. Use for wizards that step backward. */
  onBack?: () => void;
  /** Right-aligned slot for buttons (exports, etc.). */
  actions?: React.ReactNode;
}

/**
 * Shared header for inner pages.
 *
 * Visual contract pinned to the look used across Active / History / Manage pages:
 * bg-surface-2, bottom border, 44px hit-target back button, bold title, muted subtitle.
 */
export function PageHeader({ title, subtitle, backTo, onBack, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  const showBack = onBack !== undefined || backTo !== undefined;
  const handleBack = onBack ?? (backTo !== undefined ? () => navigate(backTo) : undefined);

  return (
    <div className="bg-surface-2 border-b border-border text-text px-4 py-4 flex items-center gap-3">
      {showBack && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Til baka"
          className="h-11 w-11 text-text hover:bg-surface-3"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold">{title}</h1>
        {subtitle && <p className="text-muted text-xs">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
