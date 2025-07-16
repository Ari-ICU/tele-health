"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { HealthMetrics, User } from "@/types/index";

interface UserWithMetrics extends User {
  healthMetrics: HealthMetrics;
}

export default function AdminHealthMetricsDashboard() {
  const [users, setUsers] = useState<UserWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMetric, setEditingMetric] = useState<HealthMetrics | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const fetchUsersWithMetrics = async () => {
    try {
      const res = await api.get("/admin/health-metrics");
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load user health metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithMetrics();
  }, []);

  const handleEdit = (userId: string, metrics: HealthMetrics) => {
    setEditingMetric({ ...metrics });
    setEditUserId(userId);
  };

  const handleSave = async () => {
    if (!editingMetric || !editUserId) return;
    try {
      await api.put(`/admin/health-metrics/${editUserId}`, editingMetric);
      setUsers(
        users.map((user) =>
          user._id === editUserId ? { ...user, healthMetrics: editingMetric } : user
        )
      );
      setEditingMetric(null);
      setEditUserId(null);
    } catch (err) {
      setError("Failed to update metrics");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete these health metrics?")) return;
    try {
      await api.delete(`/admin/health-metrics/${userId}`);
      setUsers(users.map((user) => 
        user._id === userId ? { ...user, healthMetrics: {} } : user
      ));
    } catch (err) {
      setError("Failed to delete metrics");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen p-4 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Admin Health Metrics Dashboard
        </h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
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

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Height (cm)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Weight (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Blood Pressure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Heart Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.profile?.firstName} {user.profile?.lastName} ({user.email})</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{user.healthMetrics?.height ?? "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{user.healthMetrics?.weight ?? "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{user.healthMetrics?.bloodPressure ?? "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{user.healthMetrics?.heartRate ?? "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.healthMetrics?.lastUpdated ? format(new Date(user.healthMetrics.lastUpdated), "PPp") : "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 text-right">
                      <button
                        onClick={() => handleEdit(user._id, user.healthMetrics)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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
                  disabled={currentPage * itemsPerPage >= filteredUsers.length}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">
                  {Math.ceil(filteredUsers.length / itemsPerPage)}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Modal for Editing */}
        {editingMetric && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Edit Health Metrics</h2>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={editingMetric.height ?? ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      height: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={editingMetric.weight ?? ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      weight: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Blood Pressure"
                  value={editingMetric.bloodPressure ?? ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      bloodPressure: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  placeholder="Heart Rate (bpm)"
                  value={editingMetric.heartRate ?? ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      heartRate: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setEditingMetric(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}