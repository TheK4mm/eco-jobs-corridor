import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('h-6 w-6 animate-spin text-brand-600', className)}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
