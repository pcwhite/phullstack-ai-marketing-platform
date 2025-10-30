"use client";

import { Template } from "@/server/db/schema";
import React, { useEffect, useState } from "react";
import TemplateDetailHeader from "./TemplateDetailHeader";
import ConfirmationModal from "./ConfirmationModal";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import TemplateDetailBody from "./TemplateDetailBody";
import { CommonPrompt } from "@/interfaces/CommonPrompt";
import PromptEditorDialog from "./PromptEditorDialog";

interface TemplateDetailViewProps {
  template: Template;
}
function TemplateDetailView({ template }: TemplateDetailViewProps) {
  const [showTemplateDeleteConfirmation, setShowTemplateDeleteConfirmation] =
    useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<CommonPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<CommonPrompt | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `/api/templates/${template.id}/prompts`
        );
        setPrompts(response.data);
        console.log("prompts: ", response.data);
      } catch (error) {
        console.error("Error fetching prompts: ", error);
        toast.error("Failed to fetch prompts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrompts();
  }, [template.id]);

  useEffect(() => {
    const promptId = searchParams.get("promptId");
    if (promptId) {
      const prompt = prompts.find((p) => p.id === promptId);
      if (prompt) setSelectedPrompt(prompt);
    } else {
      setSelectedPrompt(null);
    }
  }, [searchParams, prompts]);

  const handleDeleteTemplate = async () => {
    setIsDeletingTemplate(true);
    try {
      await axios.delete(`/api/templates/${template.id}`);
      toast.success("Template deleted successfully");
      router.push("/templates?deleted=true");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting template. Please try again.");
    } finally {
      setIsDeletingTemplate(false);
      setShowTemplateDeleteConfirmation(false);
    }
  };

  const handleCreatePrompt = async () => {
    setIsCreatingPrompt(true);
    try {
      const response = await axios.post(
        `/api/templates/${template.id}/prompts`,
        {
          name: "New Prompt",
          prompt: "",
          order: prompts.length,
          tokenCount: 0,
        }
      );

      const newPrompt = response.data;
      setPrompts((prev) => [...prev, newPrompt]);
      router.push(`?promptId=${newPrompt.id}`);
    } catch (error) {
      console.error("Error creating prompt", error);
      toast.error("Error creating prompt. Please try again later.");
    } finally {
      setIsCreatingPrompt(false);
    }
  };

  const handleOnSave = async (updatedPrompt: CommonPrompt) => {
    setIsSaving(true);
    try {
      const response = await axios.patch<CommonPrompt>(
        `/api/templates/${template.id}/prompts`,
        [updatedPrompt]
      );
      const savedPrompt = response.data;
      setPrompts(
        prompts.map((p) =>
          p.id === updatedPrompt.id ? { ...p, ...savedPrompt } : p
        )
      );
      toast.success("Prompt saved successfully");
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save prompt:", error);
      toast.error("Error saving prompt. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedPrompt(null);
    router.push(`/template/${template.id}`, { scroll: false });
  };

  const handlePromptDelete = async (id: string) => {
    setIsDeletingPrompt(true);
    try {
      await axios.delete(`/api/templates/${template.id}/prompts?id=${id}`);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prompt deleted successfully");
      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting prompt", error);
      toast.error("Error deleting prompt. Please try again later.");
    } finally {
      setIsDeletingPrompt(false);
      setDeletePromptId(null);
    }
  };

  return (
    <div className="space-y-4 md:space-x-6">
      <TemplateDetailHeader
        template={template}
        setShowTemplateDeleteConfirmation={setShowTemplateDeleteConfirmation}
      />
      <ConfirmationModal
        isOpen={showTemplateDeleteConfirmation}
        title="Delete Template"
        message="Are you sure you want to delete this template?"
        isLoading={isDeletingTemplate}
        onClose={() => setShowTemplateDeleteConfirmation(false)}
        onConfirm={handleDeleteTemplate}
      />
      <TemplateDetailBody
        handleCreatePrompt={handleCreatePrompt}
        isCreatingPrompt={isCreatingPrompt}
        prompts={prompts}
        isLoading={isLoading}
        setDeletePromptId={setDeletePromptId}
      />
      <ConfirmationModal
        isOpen={!!deletePromptId}
        title="Delete Prompt"
        message="Are you sure you want to delete this prompt? This action cannot be undone."
        isLoading={isDeletingPrompt}
        onClose={() => setDeletePromptId(null)}
        onConfirm={() => deletePromptId && handlePromptDelete(deletePromptId)}
      />
      <PromptEditorDialog
        isOpen={!!selectedPrompt}
        prompt={selectedPrompt}
        handleOnClose={handleCloseDialog}
        handleSave={handleOnSave}
        isSaving={isSaving}
      />
    </div>
  );
}

export default TemplateDetailView;
