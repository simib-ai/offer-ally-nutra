interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

const STEP_LABELS: Record<number, string> = {
  1: "Let's Get Started",
  2: 'Delivery Format',
  3: 'Review & Submit',
  4: 'Packaging & Services',
  5: 'Review & Submit',
};

const StepIndicator = ({ currentStep, totalSteps, label: labelOverride }: StepIndicatorProps) => {
  const progress = (currentStep / totalSteps) * 100;
  const label = labelOverride ?? STEP_LABELS[currentStep] ?? `Step ${currentStep}`;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
      </div>
      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default StepIndicator;
