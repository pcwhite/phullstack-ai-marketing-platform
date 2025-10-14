"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import { formatTokens } from "@/utils/token-helper";
import { MAX_TOKENS_PROMPT } from "@/lib/constants";
import { Prompt } from "@/server/db/schema";
import toast from "react-hot-toast";
import axios from "axios";

interface PromptEditorDialogProps {
  isOpen: boolean;
  prompt: Prompt | null;
  handleOnClose: () => void;
}

function PromptEditorDialog({
  isOpen,
  prompt,
  handleOnClose,
}: PromptEditorDialogProps) {
  const [name, setName] = useState(prompt?.name || "");
  const [content, setContent] = useState(prompt?.prompt || "");
  const [currentTokenCount, setCurrentTokenCount] = useState(
    prompt?.tokenCount || 0
  );
  const [isExceeded, setIsExceeded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "name") setName(value);
    else setContent(value);
  };

  //   const handleOnClose = () => {
  //     setName("");
  //     setContent("");
  //     setCurrentTokenCount(0);
  //     setIsExceeded(false);
  //     setIsSaving(false);
  //   };

  const handleSave = async (updatedPrompt: Prompt) => {
    setIsSaving(true);
    try {
      await axios.put(
        `/api/projects/${prompt?.projectId}/prompts`,
        updatedPrompt
      );
      toast.success("Prompt saved successfully");
    } catch (error) {
      console.error("Error saving prompt: ", error);
      toast.error("Error saving prompt. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogTitle />
      <DialogContent className="max-w-[90%] sm:max-w-[80%] lg:max-w-[40%] bg-white p-8 md:px-12 md:py-8 rounded-3xl sm:rounded-3xl lg:border-4 border-main space-y-1">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MessageSquare
              className="h-7 w-7 sm:h-8 sm:w-8 text-main flex-shrink-0"
              strokeWidth={3}
            />
            <Input
              name="name"
              value={name}
              onChange={handleChange}
              className="flex-grow font-semibold text-xl sm:text-2xl text-main bg-transparent border-none p-0 placeholder:text-main/75 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Enter prompt name..."
            />
          </div>
          <Textarea
            name="content"
            value={content}
            onChange={handleChange}
            rows={4}
            className="w-full border-none bg-transparent resize-none min-h-[50vh] sm:min-h-[60vh] text-base sm:text-lg focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 "
            placeholder="Enter prompt content..."
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <span
            className={cn(
              "flex justify-center text-sm sm:text-base font-medium rounded-lg py-2 px-3 w-full sm:w-auto",
              isExceeded
                ? "bg-red-100 text-red-500"
                : "bg-gray-100 text-gray-500"
            )}
          >
            Tokens: {formatTokens(currentTokenCount)}/
            {formatTokens(MAX_TOKENS_PROMPT)}
          </span>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              onClick={handleOnClose}
              variant="outline"
              className="w-full text-sm sm:text-base sm:w-auto bg-gray-100 text-gray-500 hover:bg-gray-200/80 hover:text-gray-500 border-2 border-gray-200 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSave({ ...prompt!, name, prompt: content })}
              disabled={isSaving}
              className="w-full text-sm sm:text-base sm:w-auto rounded-lg"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 mr-1 animate-spin" />
              ) : (
                <Save className="h-5 w-5 mr-1" />
              )}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PromptEditorDialog;
