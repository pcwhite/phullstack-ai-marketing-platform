"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import UploadStepHeader from "./UploadStepHeader";
import UploadStepBody from "./UploadStepBody";
import ConfirmationModal from "../ConfirmationModal";
import axios from "axios";
import toast from "react-hot-toast";
import { Asset, AssetProcessingJob } from "@/server/db/schema";
import { upload } from "@vercel/blob/client";

interface ManageUploadStepProps {
  projectId: string;
}

function ManageUploadStep({ projectId }: ManageUploadStepProps) {
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [browserFiles, setBrowserFiles] = useState<File[]>([]);
  const [assetJobStatus, setAssetJobStatus] = useState<Record<string, string>>(
    {}
  );

  const prevAssetJobStatusRef = useRef<Record<string, string>>({});
  const inputFileRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    if (uploadedAssets.length === 0) {
      setIsLoading(true);
    }
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
  }, [projectId, uploadedAssets.length]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const fetchAssetProcessingJobs = useCallback(async () => {
    try {
      const response = await axios.get<AssetProcessingJob[]>(
        `/api/projects/${projectId}/asset-processing-jobs`
      );

      const newAssetJobStatus: Record<string, string> = {};
      response.data.forEach((job) => {
        newAssetJobStatus[job.assetId] = job.status;
      });

      setAssetJobStatus(newAssetJobStatus);

      const prevAssetJobStatus = prevAssetJobStatusRef.current;
      const isAnyStatusChangedToCompleted = response.data.some((job) => {
        const prevStatus = prevAssetJobStatus[job.assetId];
        const newStatus = job.status;
        return prevStatus !== "completed" && newStatus === "completed";
      });

      // Update the previous statuses reference
      prevAssetJobStatusRef.current = newAssetJobStatus;

      if (isAnyStatusChangedToCompleted) {
        console.log("Fetching files after status change to completed");
        toast.success("Asset processing completed");
        await fetchAssets();
      }
    } catch (error) {
      console.error("Error fetching asset processing jobs", error);
    }
  }, [fetchAssets, projectId]);

  useEffect(() => {
    fetchAssetProcessingJobs();
    const fetchAssetProcessingJobsInterval = setInterval(
      fetchAssetProcessingJobs,
      1000
    );

    return () => clearInterval(fetchAssetProcessingJobsInterval);
  }, [fetchAssetProcessingJobs]);

  const getFileType = (file: File) => {
    if (file.type.startsWith("video/")) {
      return "video";
    }
    if (file.type.startsWith("audio/")) {
      return "audio";
    }
    if (file.type === "text/plain") {
      return "text";
    }
    if (file.type === "text/markdown") {
      return "markdown";
    }
    return "other";
  };

  const handleUpload = async () => {
    setUploading(true);

    try {
      // upload files to the server
      const uploadPromises = browserFiles.map(async (file) => {
        const fileData = {
          projectId,
          title: file.name,
          fileType: getFileType(file),
          mimeType: file.type,
          size: file.size,
        };

        const fileName = `${projectId}/${file.name}`;
        const result = await upload(fileName, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          multipart: true,
          clientPayload: JSON.stringify(fileData),
        });

        return result;
      });

      const uploadedResults = await Promise.all(uploadPromises);

      // fetch assets
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchAssets();

      toast.success(`Successfully uploaded ${uploadedResults.length} files`);
      setBrowserFiles([]);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading files due to: ", error);
      toast.error("Error uploading files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
      <UploadStepHeader
        setBrowserFiles={setBrowserFiles}
        inputFileRef={inputFileRef}
        browserFiles={browserFiles}
        handleUpload={handleUpload}
        uploading={uploading}
      />
      <UploadStepBody
        setDeleteAssetId={setDeleteAssetId}
        isLoading={isLoading}
        uploadedAssets={uploadedAssets}
        assetJobStatus={assetJobStatus}
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
