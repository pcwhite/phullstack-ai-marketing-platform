import ProjectDetailView from "@/components/project-detail/ProjectDetailView";
import { getProject } from "@/server/queries";
import { notFound } from "next/navigation";
import React from "react";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  // TODO: Make a query to the database to get the project with the given projectId
  // TODO: Pass project to our children components
  const project = await getProject(params.projectId);
  if (!project) {
    return notFound();
  }
  // TODO: If no project is found, return 404 page

  return (
    <div className="p-4 sm:p-4 md:p-6 lg:p-8 mt-2">
      <ProjectDetailView project={project} />
    </div>
  );
}
