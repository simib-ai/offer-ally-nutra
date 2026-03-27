import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormCardProps {
  children: ReactNode;
  className?: string;
}

const FormCard = ({ children, className }: FormCardProps) => {
  return (
    <div
      className={cn(
        'bg-white border border-border rounded-lg p-6 sm:p-8 card-shadow',
        className
      )}
    >
      {children}
    </div>
  );
};

export default FormCard;
