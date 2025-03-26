/* eslint-disable react/prop-types */
import { Button, Card, Badge, Spinner } from "flowbite-react";
import { HiEye, HiTrash } from "react-icons/hi";
import { deleteDocument } from "../redux/correspondence/correspondenceSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { unwrapResult } from "@reduxjs/toolkit";
import { useState } from "react";

const FileSection = ({ activeTab, files, removeFile, correspondenceId }) => {
  const sectionTitle = activeTab === 0 ? "Received Files" : "Sent Files";
  const type = activeTab === 0 ? "inward" : "outward";
  const dispatch = useDispatch();
  const [activePublicId, setActivePublicId] = useState("");
  const [geting, setGeting] = useState(false);
  function handlePreview(file) {
    window.open(file.url, "_blank");
  }
  async function handleDelete(file) {
    try {
      setGeting(true);
      file.direction = type;
      const result = await dispatch(deleteDocument({ file, correspondenceId }));
      const data = await unwrapResult(result);
      toast.success(data.message);
      removeFile(activeTab, file.publicId);
    } catch (error) {
      console.error(error);
    } finally {
      setGeting(false);
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {sectionTitle}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files?.map((file) => (
          <Card key={file.publicId} className="h-full">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                  {file.title}
                </h5>
                <span className="text-sm text-gray-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="xs" onClick={() => handlePreview(file)}>
                  <HiEye className="h-4 w-4" />
                </Button>
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => [
                    handleDelete(file),
                    setActivePublicId(file.publicId),
                  ]}
                >
                  {geting && activePublicId === file.publicId ? (
                    <Spinner />
                  ) : (
                    <HiTrash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Badge color={getCategoryColor(file.category)} className="w-fit">
                {file.category}
              </Badge>
              {file.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {file.description}
                </p>
              )}
              <div className="text-sm space-y-1">
                <p className="font-medium">From: {file?.sender?.name}</p>
                {file?.sender?.designation && (
                  <p className="text-gray-500">{file?.sender?.designation}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {files?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No {type} files found
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function for category colors
const getCategoryColor = (category) => {
  switch (category) {
    case "legal":
      return "purple";
    case "technical":
      return "blue";
    case "financial":
      return "green";
    default:
      return "gray";
  }
};

export default FileSection;
