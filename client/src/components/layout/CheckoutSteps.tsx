import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type CheckoutFlowStep = 1 | 2 | 3;

export interface CheckoutStepsProps {
  /** 1 = Shipping, 2 = Payment, 3 = Confirm. */
  currentStep: CheckoutFlowStep;
  className?: string;
}

const STEPS: ReadonlyArray<{
  step: CheckoutFlowStep;
  title: string;
  description: string;
}> = [
  { step: 1, title: "Shipping", description: "Delivery details" },
  { step: 2, title: "Payment", description: "Manual transfer" },
  { step: 3, title: "Confirm", description: "Place order" },
];

function StepCircle({
  item,
  currentStep,
}: {
  item: (typeof STEPS)[number];
  currentStep: CheckoutFlowStep;
}) {
  const isComplete = item.step < currentStep;
  const isCurrent = item.step === currentStep;
  const isUpcoming = item.step > currentStep;

  return (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-full border-2 text-sm font-black transition-all duration-200",
        isComplete &&
          "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20",
        isCurrent &&
          "border-[#2563EB] bg-white text-[#2563EB] shadow-[0_0_0_4px_rgba(37,99,235,0.16)]",
        isUpcoming && "border-slate-200 bg-slate-50 text-slate-400"
      )}
    >
      {isComplete ? (
        <Check className="size-5" strokeWidth={2.5} aria-hidden />
      ) : (
        <span aria-hidden>{item.step}</span>
      )}
    </div>
  );
}

function StepLabel({
  item,
  currentStep,
}: {
  item: (typeof STEPS)[number];
  currentStep: CheckoutFlowStep;
}) {
  const isComplete = item.step < currentStep;
  const isCurrent = item.step === currentStep;
  const isUpcoming = item.step > currentStep;

  return (
    <div className="flex flex-col items-center px-1 text-center">
      <div
        className={cn(
          "text-[10px] font-bold tracking-widest uppercase sm:text-[11px]",
          isComplete && "text-emerald-700",
          isCurrent && "text-[#2563EB]",
          isUpcoming && "text-slate-400"
        )}
      >
        {item.title}
      </div>
      <div className="mt-0.5 hidden max-w-[7.5rem] text-[10px] font-medium leading-snug text-slate-500 sm:block">
        {item.description}
      </div>
    </div>
  );
}

/**
 * Shared checkout progress for Shipping + Payment screens.
 * Completed: emerald · Active: royal blue (#2563EB) · Upcoming: slate.
 */
const CheckoutSteps = ({ currentStep, className }: CheckoutStepsProps) => {
  const lineAfterShipping = currentStep > 1;
  const lineAfterPayment = currentStep > 2;

  return (
    <nav
      aria-label="Checkout progress"
      className={cn("w-full", className)}
    >
      <div className="rounded-[1.25rem] border border-slate-200/80 bg-white/90 px-3 py-4 shadow-sm backdrop-blur-sm sm:px-6 sm:py-5">
        {/* Circles + connectors */}
        <div className="grid w-full grid-cols-[auto_minmax(12px,1fr)_auto_minmax(12px,1fr)_auto] items-center gap-x-1 sm:gap-x-2">
          <div className="flex justify-center" aria-current={currentStep === 1 ? "step" : undefined}>
            <StepCircle item={STEPS[0]} currentStep={currentStep} />
          </div>
          <div className="h-[3px] w-full min-w-[10px] rounded-full" aria-hidden>
            <div
              className={cn(
                "h-full w-full rounded-full transition-colors duration-200",
                lineAfterShipping ? "bg-emerald-500" : "bg-slate-200"
              )}
            />
          </div>
          <div className="flex justify-center" aria-current={currentStep === 2 ? "step" : undefined}>
            <StepCircle item={STEPS[1]} currentStep={currentStep} />
          </div>
          <div className="h-[3px] w-full min-w-[10px] rounded-full" aria-hidden>
            <div
              className={cn(
                "h-full w-full rounded-full transition-colors duration-200",
                lineAfterPayment ? "bg-emerald-500" : "bg-slate-200"
              )}
            />
          </div>
          <div className="flex justify-center" aria-current={currentStep === 3 ? "step" : undefined}>
            <StepCircle item={STEPS[2]} currentStep={currentStep} />
          </div>
        </div>

        {/* Labels */}
        <div className="mt-3 grid w-full grid-cols-[auto_minmax(12px,1fr)_auto_minmax(12px,1fr)_auto] items-start gap-x-1 sm:gap-x-2">
          <StepLabel item={STEPS[0]} currentStep={currentStep} />
          <span aria-hidden className="min-h-[1px]" />
          <StepLabel item={STEPS[1]} currentStep={currentStep} />
          <span aria-hidden className="min-h-[1px]" />
          <StepLabel item={STEPS[2]} currentStep={currentStep} />
        </div>
      </div>
    </nav>
  );
};

export default CheckoutSteps;
