import React, { useCallback, useEffect, useState } from "react";
import UploadStepHeader from "./UploadStepHeader";
import UploadStepBody from "./UploadStepBody";
import ConfirmationModal from "../ConfirmationModal";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Asset } from "@/server/db/schema";

interface ManageUploadStepProps {
  projectId: string;
  isLoading: boolean;
}

function ManageUploadStep({ projectId }: ManageUploadStepProps) {
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Asset[]>(
        `/api/projects/${projectId}/assets`
      );
      setUploadedAssets(response.data);
      console.log("Uploaded assets", response.data);
    } catch (error) {
      console.error("Error fetching assets", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/projects/${projectId}/assets?assetId=${deleteAssetId}`
      );
      toast.success("Asset deleted successfully");
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset", error);
    } finally {
      setIsDeleting(false);
      setDeleteAssetId(null);
    }
  };
  return (
    <div>
      <UploadStepHeader projectId={projectId} />
      <UploadStepBody
        setDeleteAssetId={setDeleteAssetId}
        isLoading={isLoading}
        uploadedAssets={uploadedAssets}
      />
      <ConfirmationModal
        isOpen={!!deleteAssetId}
        title="Delete Asset"
        message="Are you sure you want to delete this project?"
        isLoading={isDeleting}
        onClose={() => setDeleteAssetId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default ManageUploadStep;
