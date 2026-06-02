import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Siguiente
      </Button>
    </nav>
  );
}
