import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  const progress = (currentStep / totalSteps) * 100;
  
  const getTimeRemaining = () => {
    if (currentStep === 1) return '~2 mins remaining';
    if (currentStep === 2) return '~1 min remaining';
    return 'Ready to submit!';
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      {/* Step circles with connecting lines */}
      <div className="flex items-center justify-center mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                step < currentStep
                  ? 'bg-accent text-accent-foreground'
                  : step === currentStep
                  ? 'bg-accent text-accent-foreground ring-4 ring-accent/20'
                  : 'bg-white border-2 border-border text-muted-foreground'
              )}
            >
              {step < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step
              )}
            </div>
            
            {/* Connecting line */}
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'w-16 sm:w-24 h-0.5 mx-2 transition-all duration-300',
                  step < currentStep ? 'bg-accent' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress info */}
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{getTimeRemaining()}</span>
        </div>
        <span className="text-accent font-medium">{Math.round(progress)}% complete</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default StepIndicator;
