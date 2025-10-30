"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Template } from "@/server/db/schema";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TemplateSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (templateId: string) => void;
}
function TemplateSelectionPopup({
  isOpen,
  onClose,
  onTemplateSelect,
}: TemplateSelectionPopupProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Template[]>("/api/templates");
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates: ", error);
        toast.error("Failed to fetch templates. Please try again.");
        setTemplates([]);
        onClose(); // close the popup if failed to fetch templates
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, onClose]);

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] sm:max-w-[425px] bg-white p-8 md:px-12 md:py-8 rounded-3xl sm:rounded-3xl lg:border-4 border-main space-y-1">
        <DialogHeader>
          <DialogTitle>Select a Template</DialogTitle>
          <DialogDescription>
            Choose a template to load prompts into your project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center">
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-main mr-2" />
              <div className="text-main font-semibold text-sm">
                Loading templates...
              </div>
            </>
          ) : templates.length === 0 ? (
            <div className="text-center">
              <p className="mb-4">
                No templates found. Create a new template to get started.
              </p>
              <Link href="/templates">
                <Button className="rounded-3xl text-base w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
                  Create New Template
                </Button>
              </Link>
            </div>
          ) : (
            <Select onValueChange={(value) => handleTemplateSelect(value)}>
              <SelectTrigger className="w-full max-w-[280px] bg-white">
                <SelectValue placeholder="Select a Template" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {templates.map((template) => (
                  <SelectItem
                    key={template.id}
                    className="focus:bg-main focus:text-white truncate pr-2"
                    value={template.id}
                  >
                    <div className="truncate max-w-[250px]">
                      {template.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateSelectionPopup;
