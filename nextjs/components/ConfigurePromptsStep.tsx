"use client";

import React, { useEffect, useState } from "react";
import ConfigurePromptsStepHeader from "./ConfigurePromptsStepHeader";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import PromptList from "./PromptList";
import ConfirmationModal from "./ConfirmationModal";
import PromptEditorDialog from "./PromptEditorDialog";
import { CommonPrompt } from "@/interfaces/CommonPrompt";
import TemplateSelectionPopup from "./TemplateSelectionPopup";

interface ConfigurePomptsStepProps {
  projectId: string;
}

function ConfigurePomptsStep({ projectId }: ConfigurePomptsStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isImportingTemplate, setIsImportingTemplate] = useState(false);
  const [prompts, setPrompts] = useState<CommonPrompt[]>([]);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<CommonPrompt | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTemplatePopupOpen, setIsTemplatePopupOpen] = useState(false);

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
        const response = await axios.get<CommonPrompt[]>(
          `/api/projects/${projectId}/prompts`
        );
        setPrompts(response.data);
      } catch (error) {
        console.error("Error fetching prompts: ", error);
        toast.error("Failed to fetch prompts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [projectId]);

  const handlePromptCreate = async () => {
    setIsCreatingPrompt(true);

    try {
      const response = await axios.post<CommonPrompt>(
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

  const handlePromptUpdate = async (prompt: CommonPrompt) => {
    setIsSaving(true);
    try {
      const response = await axios.patch(
        `/api/projects/${projectId}/prompts`,
        prompt
      );
      setPrompts((prevPrompts) =>
        prevPrompts.map((p) => (p.id === prompt.id ? response.data : p))
      );
      toast.success("Prompt updated successfully");
      handleOnClose();
    } catch (error) {
      console.error("Error updating prompt: ", error);
      toast.error("Error updating prompt. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOnClose = () => {
    setSelectedPrompt(null);
    router.push(`?tab=prompts`);
  };

  const handleTemplateSelect = async (templateId: string) => {
    setIsImportingTemplate(true);
    try {
      const response = await axios.post<CommonPrompt[]>(
        `/api/projects/${projectId}/import-template`,
        {
          templateId,
        }
      );
      setPrompts((prev) => [...prev, ...response.data]);
      toast.success("Template imported successfully");
    } catch (error) {
      console.error("Error importing template: ", error);
      toast.error("Error importing template. Please try again.");
    } finally {
      setIsImportingTemplate(false);
      setIsTemplatePopupOpen(false);
    }
  };

  return (
    <div className="space-y-4 md:space-x-6">
      <ConfigurePromptsStepHeader
        handlePromptCreate={handlePromptCreate}
        isCreatingPrompt={isCreatingPrompt}
        isImportingTemplate={isImportingTemplate}
        setIsTemplatePopupOpen={setIsTemplatePopupOpen}
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
        isSaving={isSaving as boolean}
      />
      {/** TODO:  This is where the user can edit and save changes to a prompt */}
      <TemplateSelectionPopup
        isOpen={isTemplatePopupOpen}
        onClose={() => setIsTemplatePopupOpen(false)}
        onTemplateSelect={handleTemplateSelect}
      />
    </div>
  );
}

export default ConfigurePomptsStep;
