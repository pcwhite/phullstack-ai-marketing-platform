import React from "react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

interface GenerateStepHeaderProps {
  canGenerateContent: boolean;
  startGeneration: () => void;
}
function GenerateStepHeader({
  canGenerateContent,
  startGeneration,
}: GenerateStepHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 lg:mb-6">
      <h2 className="text-xl md:text-2xl lg:text-2xl font-bold text-gray-700 mb-3 lg:mb-0">
        Step 3: Generate Content
      </h2>
      <Button
        onClick={startGeneration}
        disabled={!canGenerateContent}
        className="bg-main/10 text-main font-semibold hover:bg-main/15 text-sm lg:text-md rounded-lg w-full lg:w-auto"
      >
        <Sparkles className="w-4 h-4 mr-2" strokeWidth={3} />
        Generate Content
      </Button>
    </div>
  );
}

export default GenerateStepHeader;
