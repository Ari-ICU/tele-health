'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';
import api from '@/lib/api';
import { Stats, Activity } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial data
  useEffect(() => {
    if (!user) return;

    // Fetch stats
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard stats.');
        console.error('Error fetching stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    // Fetch recent activities
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activities');
        setActivities(res.data);
      } catch (err) {
        setError('Failed to load recent activities.');
        console.error('Error fetching activities:', err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchStats();
    fetchActivities();

    // Setup WebSocket
    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.emit('join-user', user.id);

    // Listen for real-time updates
    socket.on('new-appointment', () => {
      fetchStats(); // Refresh stats on new appointment
    });
    socket.on('new-message', () => {
      fetchStats(); // Refresh stats on new message
    });
    socket.on('new-analysis', () => {
      fetchStats(); // Refresh stats on new AI analysis
    });
    socket.on('new-prescription', () => {
      fetchStats(); // Refresh stats on new prescription
    });
    socket.on('new-activity', (activity: Activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 5)); // Add new activity, keep latest 5
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8">
          Welcome back, {user.email}. Here's what's happening today.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {loadingStats ? (
            <div className="col-span-full flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            [
              {
                title: 'Upcoming Appointments',
                value: stats?.upcomingAppointments
                  ? `${stats.upcomingAppointments} Today`
                  : '0 Today',
                color: 'blue',
                href: '/appointments',
              },
              {
                title: 'AI Health Analyses',
                value: stats?.aiAnalyses ? `${stats.aiAnalyses} Recent` : '0 Recent',
                color: 'blue',
                href: '/ai-assistant',
              },
              {
                title: 'Messages',
                value: stats?.newMessages ? `${stats.newMessages} New` : '0 New',
                color: 'blue',
                href: '/chat',
              },
              {
                title: 'Prescriptions Ready',
                value: stats?.prescriptionsReady
                  ? `${stats.prescriptionsReady} Pending`
                  : '0 Pending',
                color: 'blue',
                href: '#',
              },
            ].map((stat, index) => (
              <Link
                key={index}
                href={stat.href}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <h3 className="text-sm text-gray-500 font-medium">{stat.title}</h3>
                <p className={`mt-2 text-2xl sm:text-3xl font-bold text-${stat.color}-600 animate-fade-in`}>
                  {stat.value}
                </p>
              </Link>
            ))
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
              Recent Activity
            </h2>
            {loadingActivities ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">
                No recent activity.
              </p>
            ) : (
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li
                    key={activity._id}
                    className="flex justify-between items-center border-b border-gray-100 pb-3 animate-fade-in"
                  >
                    <span className="text-gray-700 text-sm sm:text-base">
                      {activity.description}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/appointments"
                className="block w-full text-center py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                Book Appointment
              </Link>
              <Link
                href="/ai-assistant"
                className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Run AI Analysis
              </Link>
              <Link
                href="/chat"
                className="block w-full text-center py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
              >
                Message Doctor
              </Link>
            </div>
          </div>
        </div>

        {/* Suggested Section */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {stats?.upcomingAppointments === 0 ? 'Book Your First Appointment' : 'Need Help?'}
          </h2>
          <p className="mb-4 text-sm sm:text-base">
            {stats?.upcomingAppointments === 0
              ? 'Get started by booking an appointment with one of our certified doctors.'
              : 'Talk to our AI assistant or book an appointment with one of our certified doctors today.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ai-assistant"
              className="px-4 sm:px-5 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm sm:text-base"
            >
              Try AI Assistant
            </Link>
            <Link
              href="/doctors"
              className="px-4 sm:px-5 py-2 bg-transparent border border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-700 transition-colors text-sm sm:text-base"
            >
              Find a Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}