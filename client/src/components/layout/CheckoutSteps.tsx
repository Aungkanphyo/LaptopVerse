import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProps {
    step1?: boolean; // login
    step2?: boolean; // shipping
    step3?: boolean; // payment
    step4?: boolean; // place order 
}

const CheckoutSteps = ({ step1, step2, step3, step4 }: StepProps) => {
    const steps = [
        { name: "Login", active: step1 },
        { name: "Shipping", active: step2 },
        { name: "Payment", active: step3 },
        { name: "Place Order", active: step4 },
    ]

    // steps.map((step, index) => {
    //   const boundary = steps.findIndex(x => x.active === false) || 4;
    //   const showCheck = index < boundary && index !== 3;

    //   console.log(
    //     `Step: ${step.name} (index ${index})`,
    //     `active: ${step.active}`,
    //     `boundary: ${boundary}`,
    //     `showCheck: ${showCheck}`
    //   );
    // })

  return (
    <div className="flex items-center justify-center gap-4 mb-10 overflow-x-auto py-2">
      {steps.map((step, index) => (
        <div key={step.name} className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center border-2 transition-all", 
              step.active ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-50 border-gray-200 text-gray-400"
            )}>
              {index < (steps.findIndex(x => x.active === false) || 4) && index !== 3 ? (
                <Check className="size-5" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            <span className={cn("text-xs font-medium", step.active ? "text-blue-600" : "text-gray-400")}>
              {step.name}
            </span>
          </div>
          {index !== steps.length -1 && (
            <div className={cn("w-10 h-0.5", step.active ? "bg-blue-600" : "bg-gray-200")} />
          )}
        </div>
      ))}
    </div>
  )
}

export default CheckoutSteps
