"use client";

import React from "react";
import { Button } from "./ui/button";
import { LayoutTemplate, Loader2, Plus } from "lucide-react";

interface ConfigurePromptsStepHeaderProps {
  handlePromptCreate: () => void;
  isCreatingPrompt: boolean;
  isImportingTemplate: boolean;
  setIsTemplatePopupOpen: (isOpen: boolean) => void;
}

function ConfigurePromptsStepHeader({
  handlePromptCreate,
  isCreatingPrompt,
  isImportingTemplate,
  setIsTemplatePopupOpen,
}: ConfigurePromptsStepHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start">
      <h2 className="text-xl md:text-2xl lg:text-2xl mb-4 sm:mb-0 font-bold">
        Step 3: Prompts
      </h2>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <Button
          onClick={() => setIsTemplatePopupOpen(true)}
          className="bg-main/10 text-main font-semibold hover:bg-main/15 text-sm sm:text-base rounded-lg w-full sm:w-auto h-8 sm:h-10"
        >
          <LayoutTemplate className="w-4 h-4 mr-2" strokeWidth={3} />
          {isImportingTemplate ? "Importing..." : "Load Template"}
        </Button>
        <Button
          onClick={handlePromptCreate}
          disabled={isCreatingPrompt}
          className="bg-main/10 text-main font-semibold hover:bg-main/15 text-sm sm:text-base rounded-lg w-full sm:w-auto h-8 sm:h-10"
        >
          {isCreatingPrompt ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" strokeWidth={3} />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
              Add Prompt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default ConfigurePromptsStepHeader;
