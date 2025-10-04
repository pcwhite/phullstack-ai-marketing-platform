import React from "react";
import UploadStepHeader from "./UploadStepHeader";
import UploadStepBody from "./UploadStepBody";

interface ManageUploadStepProps {
  projectId: string;
}

function ManageUploadStep({ projectId }: ManageUploadStepProps) {
  return (
    <div>
      <UploadStepHeader projectId={projectId} />
      <UploadStepBody projectId={projectId} />
    </div>
  );
}

export default ManageUploadStep;
