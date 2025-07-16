"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { User, MedicalRecord } from "@/types";

interface Props {
  users: User[];
  initialData?: Partial<MedicalRecord>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MedicalRecordForm({
  users,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const isEditMode = !!initialData?._id;

  const [record, setRecord] = useState<Partial<MedicalRecord>>({
    type: "",
    title: "",
    description: "",
    tags: [],
    patient: undefined,
    doctor: undefined,
    ...initialData,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRecord({
      type: "",
      title: "",
      description: "",
      tags: [],
      patient: undefined,
      doctor: undefined,
      ...initialData,
    });
    setFiles([]);
    setError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!record.patient?._id || !record.type) {
    setError("Patient and type are required");
    return;
  }

  setIsSubmitting(true);
  setError(null);

  try {
    const formData = new FormData();

    Object.entries(record).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const valToSend =
          key === "patient" || key === "doctor"
            ? value._id
            : typeof value === "object"
            ? JSON.stringify(value)
            : value.toString();

        formData.append(key, valToSend);
      }
    });

    if (isEditMode && record.files) {
      formData.append('existingFiles', JSON.stringify(record.files));
    }

    files.forEach((file) => formData.append("files", file));

    const url = isEditMode
      ? `/admin/medical-records/${record._id}`
      : "/medical-records";

    const method = isEditMode ? "put" : "post";

    const response = await api({
      method,
      url,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.error) {
      setError(response.data.error);
    } else {
      onSuccess?.();
    }
  } catch (err: any) {
    setError(
      err.response?.data?.error ||
      err.message ||
      "Failed to process medical record"
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-lg mx-auto px-4 py-6 bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          aria-label="Go back"
          disabled={isSubmitting}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </button>
        <h2 className="ml-2 text-2xl font-bold text-gray-800">
          🩺 {isEditMode ? "Edit Medical Record" : "Add Medical Record"}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Record Type
          </label>
          <select
            id="type"
            value={record.type || ""}
            onChange={(e) => setRecord({ ...record, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select Type</option>
            <option value="consultation">Consultation</option>
            <option value="test">Test</option>
            <option value="prescription">Prescription</option>
            <option value="report">Report</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter title"
            value={record.title || ""}
            onChange={(e) => setRecord({ ...record, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter description"
            value={record.description || ""}
            onChange={(e) =>
              setRecord({ ...record, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
          />
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            placeholder="e.g., diabetes, checkup"
            value={record.tags?.join(", ") || ""}
            onChange={(e) =>
              setRecord({
                ...record,
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Patient */}
        <div>
          <label
            htmlFor="patient"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Patient
          </label>
          <select
            id="patient"
            value={record.patient?._id || ""}
            onChange={(e) =>
              setRecord({
                ...record,
                patient: { _id: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select Patient</option>
            {users
              .filter((u) => u.role === "patient")
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.profile?.firstName} {user.profile?.lastName} (
                  {user.email})
                </option>
              ))}
          </select>
        </div>

        {/* Doctor */}
        <div>
          <label
            htmlFor="doctor"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Doctor (optional)
          </label>
          <select
            id="doctor"
            value={record.doctor?._id || ""}
            onChange={(e) =>
              setRecord({
                ...record,
                doctor: e.target.value ? { _id: e.target.value } : undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Doctor</option>
            {users
              .filter((u) => u.role === "doctor")
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.profile?.firstName} {user.profile?.lastName} (
                  {user.email})
                </option>
              ))}
          </select>
        </div>

        {/* Files */}
        <div>
          <label
            htmlFor="files"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Upload Files
          </label>
          <input
            id="files"
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
