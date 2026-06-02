import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, name, ...props }, ref) => {
    const inputId = id ?? name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
