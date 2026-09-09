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
                "flex size-11 items-center justify-center rounded-full border-2 text-sm font-black transition-all duration-300",
                isComplete &&
                "border-emerald-500 bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
                isCurrent &&
                "border-blue-500 bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]",
                isUpcoming && "border-slate-800 bg-[#070913] text-slate-500"
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
                    "text-[10px] font-bold tracking-widest uppercase sm:text-[11px] transition-colors duration-200",
                    isComplete && "text-emerald-400",
                    isCurrent && "text-blue-400 font-extrabold",
                    isUpcoming && "text-slate-500"
                )}
            >
                {item.title}
            </div>
            <div
                className={cn(
                    "mt-0.5 hidden max-w-30 text-[10px] font-medium leading-snug sm:block transition-colors duration-200",
                    isUpcoming ? "text-slate-600" : "text-slate-400"
                )}
            >
                {item.description}
            </div>
        </div>
    );
}

const CheckoutSteps = ({ currentStep, className }: CheckoutStepsProps) => {
    const lineAfterShipping = currentStep > 1;
    const lineAfterPayment = currentStep > 2;

    return (
        <nav
            aria-label="Checkout progress"
            className={cn("w-full", className)}
        >
            <div className="rounded-3xl border border-slate-800/80 bg-[#0e1322] px-3 py-4 shadow-2xl sm:px-6 sm:py-5">
                {/* Circles + connectors */}
                <div className="grid w-full grid-cols-[auto_minmax(12px,1fr)_auto_minmax(12px,1fr)_auto] items-center gap-x-1 sm:gap-x-2">
                    <div className="flex justify-center" aria-current={currentStep === 1 ? "step" : undefined}>
                        <StepCircle item={STEPS[0]} currentStep={currentStep} />
                    </div>
                    <div className="h-0.75 w-full min-w-2.5 rounded-full" aria-hidden>
                        <div
                            className={cn(
                                "h-full w-full rounded-full transition-colors duration-300",
                                lineAfterShipping ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-800"
                            )}
                        />
                    </div>
                    <div className="flex justify-center" aria-current={currentStep === 2 ? "step" : undefined}>
                        <StepCircle item={STEPS[1]} currentStep={currentStep} />
                    </div>
                    <div className="h-0.75 w-full min-w-2.5 rounded-full" aria-hidden>
                        <div
                            className={cn(
                                "h-full w-full rounded-full transition-colors duration-300",
                                lineAfterPayment ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-800"
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
                    <span aria-hidden className="min-h-px" />
                    <StepLabel item={STEPS[1]} currentStep={currentStep} />
                    <span aria-hidden className="min-h-px" />
                    <StepLabel item={STEPS[2]} currentStep={currentStep} />
                </div>
            </div>
        </nav>
    );
};

export default CheckoutSteps;
