// src/app/(dashboard)/appointments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Appointment } from '@/types';
import { format } from 'date-fns';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments?upcoming=true');
        setAppointments(response.data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Upcoming Appointments</h1>

        <div className="bg-white shadow-lg rounded-xl p-6">
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You have no upcoming appointments.</p>
          ) : (
            <ul className="space-y-6">
              {appointments.map((appt) => (
                <li
                  key={appt._id}
                  className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Consultation with Dr. {appt.doctor.profile.firstName} {appt.doctor.profile.lastName}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {format(new Date(appt.dateTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <span
                        className={`px-3 py-1 text-sm rounded-full capitalize font-medium text-white ${
                          appt.status === 'scheduled' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      >
                        {appt.status}
                      </span>
                      <button className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors">
                        Join Call
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}