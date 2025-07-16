"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AddMedicalRecordForm from "@/components/MedicalRecord/MedicalRecordForm";
import api from "@/lib/api";
import { User, MedicalRecord } from "@/types";

export default function EditMedicalRecordPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [record, setRecord] = useState<Partial<MedicalRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, recordRes] = await Promise.all([
          api.get("/admin/users"),
          api.get(`/admin/medical-records/${id}`),
        ]);
        setUsers(usersRes.data.data);
        setRecord(recordRes.data.data);
      } catch (err: any) {
        setError("Failed to load data. Please try again.");
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}
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
        {!loading && !error && record && (
          <AddMedicalRecordForm
            users={users}
            initialData={record}
            onSuccess={() => router.push("/medical-records")}
            onCancel={() => router.push("/medical-records")}
          />
        )}
      </div>
    </div>
  );
}