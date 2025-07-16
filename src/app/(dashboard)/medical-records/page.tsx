"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { format } from "date-fns";
import { MedicalRecord, User } from "@/types/index";

interface MedicalRecordWithUsers extends MedicalRecord {
  patient: User;
  doctor?: User;
}

export default function AdminMedicalRecordsDashboard() {
  const [records, setRecords] = useState<MedicalRecordWithUsers[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const fetchRecords = async () => {
    try {
      const [recordsRes, usersRes] = await Promise.all([
        api.get("/admin/medical-records"),
        api.get("/admin/users"),
      ]);
      setRecords(recordsRes.data.data || recordsRes.data);
      setUsers(usersRes.data.data || usersRes.data);
    } catch (err) {
      setError("Failed to load medical records or users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this medical record?")) return;
    try {
      await api.delete(`/admin/medical-records/${recordId}`);
      setRecords(records.filter((r) => r._id !== recordId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete record");
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen p-4 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800"> Medical Records </h1>
          <Link href="/medical-records/create">
            <button className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md">
              Add Record
            </button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by title or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded animate-bounce">
            <p>{error}</p>
          </div>
        )}

        {/* Skeleton Loader */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(record.createdAt), "PP")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-700">{record.type || "N/A"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.title || "Untitled"}</td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-700">{record.description || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{record.patient?.profile?.firstName} {record.patient?.profile?.lastName}</td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-blue-600">{record.doctor?.profile?.firstName || "-"} {record.doctor?.profile?.lastName || ""}</td>
                    <td className="px-6 py-4 text-sm text-indigo-600">
                      {record.files?.length ? (
                        <ul className="space-y-1">
                          {record.files.map((file) => (
                            <li key={file.filename}>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {file.originalName}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                      <Link href={`/medical-records/${record._id}/edit`}>
                        <button className="text-blue-600 hover:text-blue-800 font-medium transition">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-800 font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3 sm:mb-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage * itemsPerPage >= filteredRecords.length}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">
                  {Math.ceil(filteredRecords.length / itemsPerPage)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}