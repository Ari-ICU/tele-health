'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Appointment } from '@/types';
import AppointmentForm from '@/components/appointments/AppointmentForm';

export default function EditAppointmentPage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${id}`);
        setAppointment(response.data);
      } catch (err) {
        setError('Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const handleSuccess = () => {
    router.push('/appointments');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="max-w-full sm:max-w-lg lg:max-w-xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p>{error || 'Appointment not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-full sm:max-w-lg lg:max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8">
          Edit Appointment
        </h1>
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
          <AppointmentForm initialData={appointment} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}