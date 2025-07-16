"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddMedicalRecordForm from "@/components/MedicalRecord/MedicalRecordForm";
import api from "@/lib/api";
import { User } from "@/types";

export default function CreateMedicalRecordPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await api.get("/admin/users");
        setUsers(usersRes.data.data);
      } catch (err: any) {
        setError("Failed to load users. Please try again.");
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Medical Record</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill out the form below to add a new medical record.
          </p>
        </div> */}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 text-indigo-600 hover:text-indigo-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Form */}
        {!loading && !error && (
          <AddMedicalRecordForm
            users={users}
            onSuccess={() => router.push("/medical-records")}
            onCancel={() => router.push("/medical-records")}
          />
        )}
      </div>
    </div>
  );
}