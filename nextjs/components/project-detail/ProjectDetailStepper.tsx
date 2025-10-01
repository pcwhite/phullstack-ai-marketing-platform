import { cn } from "@/lib/utils";
import React from "react";

interface ProjectDetailStepperProps {
  currentStep: number;
  handleStepClick: (index: number) => void;
  steps: { name: string; tab: string }[];
}

function ProjectDetailStepper({
  currentStep,
  handleStepClick,
  steps,
}: ProjectDetailStepperProps) {
  return (
    <>
      {/* MOBILE STEPPER */}
      <div className="flex md:hidden items-start w-full">
        {steps.map((step, index) => (
          <div
            key={step.tab}
            className="flex-1 flex items-center justify-center"
          >
            <button
              onClick={() => handleStepClick(index)}
              className={cn(
                "flex flex-col items-center w-full",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mb-1",
                  index === currentStep
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="text-sm font-semibold break-words w-full text-center">
                {step.name}
              </span>
            </button>
          </div>
        ))}
      </div>
      {/* DESKTOP STEPPER */}
      <div className="hidden md:flex items-center w-full">
        {steps.map((step, index) => (
          <div
            key={step.tab}
            className={cn(
              "flex items-center flex-1 last:flex-grow-0",
              index === currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            <button
              onClick={() => handleStepClick(index)}
              className={cn(
                "flex flex-col items-center",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold mb-2",
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="text-sm font-semibold break-words">
                {step.name}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-grow mx-2",
                  index < currentStep ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default ProjectDetailStepper;
