"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import io, { Socket } from "socket.io-client";
import api from "@/lib/api";
import DashboardChart from "@/components/chart/DashboardChart";
import { Stats, Activity, Appointment } from "@/types/index";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    []
  );
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0); // Trigger for chart refresh
  const socketRef = useRef<Socket | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");
      setStats(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard stats.");
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get("/activities");
      console.log("Activities:", res.data);
      const data = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setActivities(data);
      setError(null);
    } catch (err) {
      setError("Failed to load recent activities.");
      console.error(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchRecentAppointments = async () => {
    try {
      const res = await api.get("/activities/recent");
      setRecentAppointments(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load recent appointments.");
      console.error(err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchStats();
    fetchActivities();
    fetchRecentAppointments();

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") }, // Assuming token is stored in localStorage
    });
    socketRef.current = socket;

    socket.emit("join-user", user.id);

    socket.on("new-appointment", () => {
      fetchStats();
      setFetchTrigger((prev) => prev + 1); // Trigger chart refresh
    });
    socket.on("new-message", () => {
      fetchStats();
      setFetchTrigger((prev) => prev + 1); // Trigger chart refresh
    });
    socket.on("new-analysis", fetchStats);
    socket.on("new-prescription", fetchStats);
    socket.on("new-activity", (activity: Activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-indigo-300 opacity-50"></div>
          </div>
          <span className="text-gray-600 text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Dashboard
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 mb-10">
          Welcome back, {user.email}. Stay on top of your health today.
        </p>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-800 rounded-xl text-sm font-medium animate-slide-in">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {loadingStats ? (
            <div className="col-span-full flex justify-center items-center h-32">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-indigo-300 opacity-50"></div>
              </div>
            </div>
          ) : (
            [
              {
                title: "Upcoming Appointments",
                value: stats?.upcomingAppointments
                  ? `${stats.upcomingAppointments} Today`
                  : "0 Today",
                color: "indigo",
                href: "/appointments",
              },
              {
                title: "AI Health Analyses",
                value: stats?.aiAnalyses
                  ? `${stats.aiAnalyses} Recent`
                  : "0 Recent",
                color: "blue",
                href: "/ai-assistant",
              },
              {
                title: "Messages",
                value: stats?.newMessages
                  ? `${stats.newMessages} New`
                  : "0 New",
                color: "teal",
                href: "/chat",
              },
              {
                title: "Prescriptions Ready",
                value: stats?.prescriptionsReady
                  ? `${stats.prescriptionsReady} Pending`
                  : "0 Pending",
                color: "purple",
                href: "#",
              },
            ].map((stat, idx) => (
              <Link
                key={idx}
                href={stat.href}
                className="relative bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden"
                aria-label={`View ${stat.title}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <p
                  className={`mt-3 text-2xl lg:text-3xl font-bold text-${stat.color}-600 animate-slide-in`}
                >
                  {stat.value}
                </p>
              </Link>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5">
              Recent Activity
            </h2>
            {loadingActivities ? (
              <div className="flex justify-center items-center h-24">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-indigo-300 opacity-50"></div>
                </div>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-gray-500 text-base">No recent activity.</p>
            ) : (
              <ul className="space-y-5">
                {activities.map((activity) => (
                  <li
                    key={activity._id}
                    className="flex justify-between items-center border-b border-gray-200 pb-4 animate-slide-in"
                  >
                    <span className="text-gray-700 text-base">
                      {activity.description}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(activity.timestamp).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link
                href="/appointments"
                className="block w-full text-center py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-base font-medium"
                aria-label="Book Appointment"
              >
                Book Appointment
              </Link>
              <Link
                href="/ai-assistant"
                className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-base font-medium"
                aria-label="Run AI Analysis"
              >
                Run AI Analysis
              </Link>
              <Link
                href="/chat"
                className="block w-full text-center py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-base font-medium"
                aria-label="Message Doctor"
              >
                Message Doctor
              </Link>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="lg:col-span-3">
            <DashboardChart />
          </div>

          {/* Recent Appointments */}
          <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5">
              Recent Appointments
            </h2>
            {loadingAppointments ? (
              <div className="flex justify-center items-center h-24">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-indigo-300 opacity-50"></div>
                </div>
              </div>
            ) : recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-base">No recent appointments.</p>
            ) : (
              <ul className="space-y-5">
                {recentAppointments.map((appointment) => {
                  const date = new Date(appointment.dateTime); // Use dateTime
                  const formattedDate =
                    appointment.dateTime && !isNaN(date.getTime())
                      ? new Intl.DateTimeFormat("km-KH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Phnom_Penh",
                        }).format(date)
                      : "មិនមានកាលបរិច្ឆេទ";

                  return (
                    <li
                      key={appointment._id}
                      className="flex justify-between items-center border-b border-gray-200 pb-4 animate-slide-in"
                    >
                      <span className="text-gray-700 text-base">
                        {appointment.doctor?.profile?.firstName ||
                        appointment.doctor?.profile?.lastName
                          ? `Dr. ${
                              appointment.doctor?.profile?.firstName || ""
                            } ${
                              appointment.doctor?.profile?.lastName || ""
                            }`.trim()
                          : "គ្មានឈ្មោះវេជ្ជបណ្ឌិត"}
                      </span>

                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formattedDate}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-xl p-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
            {stats?.upcomingAppointments === 0
              ? "Book Your First Appointment"
              : "Need Assistance?"}
          </h2>
          <p className="mb-5 text-base sm:text-lg">
            {stats?.upcomingAppointments === 0
              ? "Start your journey by booking an appointment with our certified doctors."
              : "Connect with our AI assistant or schedule a consultation today."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/ai-assistant"
              className="px-5 py-2.5 bg-white text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors duration-200 text-base"
              aria-label="Try AI Assistant"
            >
              Try AI Assistant
            </Link>
            <Link
              href="/doctors"
              className="px-5 py-2.5 bg-transparent border border-white text-white rounded-lg font-medium hover:bg-white hover:text-indigo-700 transition-colors duration-200 text-base"
              aria-label="Find a Doctor"
            >
              Find a Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
