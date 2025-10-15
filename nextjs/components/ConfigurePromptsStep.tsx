"use client";

import React, { useEffect, useState } from "react";
import ConfigurePromptsStepHeader from "./ConfigurePromptsStepHeader";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Prompt } from "@/server/db/schema";
import toast from "react-hot-toast";
import PromptList from "./PromptList";
import ConfirmationModal from "./ConfirmationModal";
import PromptEditorDialog from "./PromptEditorDialog";

interface ConfigurePomptsStepProps {
  projectId: string;
}

function ConfigurePomptsStep({ projectId }: ConfigurePomptsStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isImportingTemplate, setIsImportingTemplate] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  console.log("deletePromptId", deletePromptId);
  const router = useRouter();

  const searchParams = useSearchParams();
  useEffect(() => {
    const promptId = searchParams.get("promptId");
    if (promptId) {
      setSelectedPrompt(
        prompts.find((prompt) => prompt.id === promptId) || null
      );
    } else {
      setSelectedPrompt(null);
    }
  }, [searchParams, prompts]);

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Prompt[]>(
          `/api/projects/${projectId}/prompts`
        );
        setPrompts(response.data);
      } catch (error) {
        console.error("Error fetching prompts: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [projectId]);

  const handlePromptCreate = async () => {
    setIsCreatingPrompt(true);

    try {
      const response = await axios.post<Prompt>(
        `/api/projects/${projectId}/prompts`,
        {
          name: "New Prompt",
          prompt: "",
          tokenCount: 0,
          order: prompts.length,
        }
      );

      const newPrompt = response.data;
      setPrompts((prev) => [...prev, newPrompt]);

      router.push(`?tab=prompts&promptId=${newPrompt.id}`);
    } catch (error) {
      console.error("Error creating prompt: ", error);
      toast.error("Error creating prompt. Please try again.");
    } finally {
      setIsCreatingPrompt(false);
    }
  };

  const handlePromptDelete = async (promptId: string) => {
    setIsDeletingPrompt(true);
    try {
      await axios.delete(
        `/api/projects/${projectId}/prompts?promptId=${promptId}`
      );
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));
      toast.success("Prompt deleted successfully");
    } catch (error) {
      console.error("Error deleting prompt: ", error);
      toast.error("Error deleting prompt. Please try again.");
    } finally {
      setIsDeletingPrompt(false);
      setDeletePromptId(null);
    }
  };

  const handlePromptUpdate = async (prompt: Prompt) => {
    setIsSaving(true);
    try {
      const response = await axios.patch(
        `/api/projects/${projectId}/prompts`,
        prompt
      );
      setPrompts((prevPrompts) =>
        prevPrompts.map((prompt) =>
          prompt.id === prompt.id ? response.data : prompt
        )
      );
      toast.success("Prompt saved successfully");
      handleOnClose();
    } catch (error) {
      console.error("Error saving prompt: ", error);
      toast.error("Error saving prompt. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOnClose = () => {
    setSelectedPrompt(null);
    router.push(`?tab=prompts`);
  };

  return (
    <div className="space-y-4 md:space-x-6">
      <ConfigurePromptsStepHeader
        handlePromptCreate={handlePromptCreate}
        isCreatingPrompt={isCreatingPrompt}
        isImportingTemplate={isImportingTemplate}
      />
      <PromptList
        prompts={prompts}
        isLoading={isLoading}
        setDeletePromptId={setDeletePromptId}
      />
      {/* This is the modal that appears when the user wants to delete a prompt */}
      <ConfirmationModal
        isOpen={!!deletePromptId}
        title="Delete Prompt"
        message="Are you sure you want to delete this prompt? This action cannot be undone."
        isLoading={isDeletingPrompt}
        onClose={() => setDeletePromptId(null)}
        onConfirm={() => deletePromptId && handlePromptDelete(deletePromptId)}
      />
      {/* This is where the user can edit and save changes to a prompt */}
      <PromptEditorDialog
        isOpen={!!selectedPrompt}
        prompt={selectedPrompt}
        handleOnClose={handleOnClose}
        handleSave={handlePromptUpdate}
        isSaving={isSaving}
      />
      {/* <TemplateSelectionPopup /> */}
    </div>
  );
}

export default ConfigurePomptsStep;
