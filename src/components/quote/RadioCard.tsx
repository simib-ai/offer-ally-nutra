import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface RadioCardProps {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
}

const RadioCard = ({ selected, onClick, icon, title, description, className }: RadioCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-start gap-4',
        selected
          ? 'border-accent bg-accent/5'
          : 'border-border bg-white hover:border-accent/50',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
            selected ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
          )}
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'font-semibold mb-1',
          selected ? 'text-primary' : 'text-foreground'
        )}>
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Radio indicator */}
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
          selected ? 'border-accent' : 'border-border'
        )}
      >
        {selected && (
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
        )}
      </div>
    </button>
  );
};

export default RadioCard;
