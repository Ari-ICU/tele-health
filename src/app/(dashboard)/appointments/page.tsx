"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Appointment } from "@/types";
import { format } from "date-fns";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ id: string; doctorName: string } | null>(
    null
  );
  const router = useRouter();

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/appointments/${deleteModal.id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== deleteModal.id));
      setDeleteModal(null);
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      alert("Failed to delete appointment.");
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-50">
      <div className="max-w-full sm:max-w-4xl lg:max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8">
          📅 Upcoming Appointments
        </h1>

        {/* Create Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => router.push("/appointments/create")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold  px-4 py-2 rounded-lg shadow transition-transform duration-200 transform hover:scale-105"
            aria-label="Create new appointment"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Appointment
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">You have no upcoming appointments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Symptoms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {appointments.map((appt) => (
                  <tr
                    key={appt._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base font-medium text-gray-900">
                      Dr. {appt.doctor?.profile?.firstName}{" "}
                      {appt.doctor?.profile?.lastName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(appt.dateTime), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                      {appt.symptoms || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs sm:text-sm rounded-full capitalize font-medium ${
                          appt.status === "scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                        onClick={() =>
                          router.push(`/appointments/${appt._id}/edit`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            id: appt._id,
                            doctorName: `${appt.doctor?.profile?.firstName} ${appt.doctor?.profile?.lastName}`,
                          })
                        }
                        className="text-red-600 hover:text-red-800 font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the appointment with{' '}
                <span className="font-semibold">Dr. {deleteModal.doctorName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}