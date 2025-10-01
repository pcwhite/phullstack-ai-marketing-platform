"use client";

import { Project } from "@/server/db/schema";
import React, { useState } from "react";
import ProjectDetailHeader from "./ProjectDetailHeader";
import ProjectDetailStepper from "./ProjectDetailStepper";
import ProjectDetailBody from "./ProjectDetailBody";
import ConfirmationModal from "../ConfirmationModal";

interface ProjectDetailViewProps {
  project: Project;
}
function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {};
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-12 sm:space-y-16 lg:space-y-12">
      <ProjectDetailHeader project={project} setIsDeleting={setIsDeleting} />
      <ProjectDetailStepper />
      <ProjectDetailBody />

      <ConfirmationModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default ProjectDetailView;
