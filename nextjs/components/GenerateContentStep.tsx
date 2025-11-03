import React, { useEffect, useState } from "react";
import GenerateStepHeader from "./GenerateStepHeader";
import axios from "axios";
import { Asset, GeneratedContent, Prompt } from "@/server/db/schema";
import { MAX_TOKENS_ASSETS, MAX_TOKENS_PROMPT } from "@/lib/constants";
import { getPromptTokenCount } from "@/utils/token-helper";
import { toast } from "react-hot-toast";
import GenerateStepBody from "./GenerateStepBody";

interface GenerateContentStepProps {
  projectId: string;
}

function GenerateContentStep({ projectId }: GenerateContentStepProps) {
  const [canGenerate, setCanGenerate] = useState(false);
  const [projectHasContent, setProjectHasContent] = useState(false);
  const [projectHasPrompts, setProjectHasPrompts] = useState(false);
  const [isAssetTokensExceeded, setIsAssetTokensExceeded] = useState(false);
  const [isPromptsTokenExceeded, setIsPromptsTokenExceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    const canGenerateContent =
      projectHasContent &&
      projectHasPrompts &&
      !isAssetTokensExceeded &&
      !isPromptsTokenExceeded &&
      !isLoading &&
      !isGenerating;
    setCanGenerate(canGenerateContent);
  }, [
    projectHasContent,
    projectHasPrompts,
    isAssetTokensExceeded,
    isPromptsTokenExceeded,
    isLoading,
    isGenerating,
  ]);

  useEffect(() => {
    const fetchAllProjectData = async () => {
      setIsLoading(true);
      try {
        const [generatedContentResponse, assetsResponse, promptsResponse] =
          await Promise.all([
            axios.get<GeneratedContent[]>(
              `/api/projects/${projectId}/generated-content`
            ),
            axios.get<Asset[]>(`/api/projects/${projectId}/assets`),
            axios.get<Prompt[]>(`/api/projects/${projectId}/prompts`),
          ]);
        setGeneratedContent(generatedContentResponse.data);
        setGeneratedCount(generatedContentResponse.data.length);

        setProjectHasContent(
          assetsResponse.data.some(
            (asset) => asset.content && asset.content.trim().length > 0
          )
        );

        setProjectHasPrompts(promptsResponse.data.length > 0);
        setTotalPrompts(promptsResponse.data.length);

        // Check if the assets tokens exceed the maximum allowed tokens
        setIsAssetTokensExceeded(
          assetsResponse.data.reduce(
            (acc, asset) => acc + (asset.tokenCount || 0),
            0
          ) > MAX_TOKENS_ASSETS
        );

        // Check if the prompts tokens exceed the maximum allowed tokens
        setIsPromptsTokenExceeded(
          promptsResponse.data.reduce(
            (acc, prompt) =>
              acc + (getPromptTokenCount(prompt.prompt || "") || 0),
            0
          ) > MAX_TOKENS_PROMPT
        );
      } catch (error) {
        toast.error("Error fetching project data. Please try again.");
        setProjectHasContent(false);
        setProjectHasPrompts(false);
        console.error("Error fetching project data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProjectData();
  }, [projectId]);

  useEffect(() => {
    let newErrorMessage = null;
    if (!projectHasContent && !projectHasPrompts) {
      const missingItems = [];
      if (!projectHasPrompts) {
        missingItems.push("add prompts");
      }
      if (!projectHasContent) {
        missingItems.push("valid assets");
      }
      newErrorMessage = `Please ${missingItems.join(
        " and "
      )} before generating content.`;
    } else if (isAssetTokensExceeded || isPromptsTokenExceeded) {
      const exceededItems = [];
      if (isAssetTokensExceeded) {
        exceededItems.push("assets");
      }
      if (isPromptsTokenExceeded) {
        exceededItems.push("prompts");
      }
      newErrorMessage = `Your ${exceededItems.join(
        " and "
      )} exceed the maximum token limit. Please remove some ${exceededItems.join(
        " or "
      )} before generating content.`;
    }

    setErrorMessage(newErrorMessage);
  }, [
    projectHasContent,
    projectHasPrompts,
    isAssetTokensExceeded,
    isPromptsTokenExceeded,
  ]);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const fetchGeneratedContent = async () => {
      try {
        const response = await axios.get<GeneratedContent[]>(
          `/api/projects/${projectId}/generated-content`
        );
        setGeneratedContent(response.data);
        setGeneratedCount(response.data.length);

        if (response.data.length === totalPrompts) {
          setIsGenerating(false);
          clearInterval(pollingInterval);
          toast.success(
            `Generation completed successfully. ${response.data.length} content generated.`
          );
        }
      } catch (error) {
        console.error("Error fetching generated content", error);
        toast.error("Error fetching generated content. Please try again.");
      }
    };

    if (isGenerating) {
      pollingInterval = setInterval(async () => {
        fetchGeneratedContent();
      }, 1000);
    }
    return () => {
      clearInterval(pollingInterval);
    };
  }, [isGenerating, totalPrompts, projectId]);

  const startGeneration = async () => {
    setGeneratedContent([]);
    setGeneratedCount(0);
    try {
      await axios.delete(`/api/projects/${projectId}/generated-content`);
      setIsGenerating(true);

      const response = await axios.post<GeneratedContent[]>(
        `/api/projects/${projectId}/generated-content`
      );
      toast.success(
        `Generation started successfully. ${response.data.length} content generated.`
      );
    } catch (error) {
      console.error("Error starting generation", error);
      toast.error("Error starting generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div>
      <GenerateStepHeader
        canGenerateContent={canGenerate}
        startGeneration={startGeneration}
      />
      <GenerateStepBody
        isLoading={isLoading}
        isGenerating={isGenerating}
        generatedCount={generatedCount}
        totalPrompts={totalPrompts}
        errorMessage={errorMessage}
        generatedContent={generatedContent}
      />
    </div>
  );
}

export default GenerateContentStep;
