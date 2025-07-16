'use client';

import { useRouter } from 'next/navigation';
import AppointmentForm from '@/components/appointments/AppointmentForm';

export default function CreateAppointmentPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/appointments');
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-full sm:max-w-lg lg:max-w-xl mx-auto">
        {/* <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8">
          Create New Appointment
        </h1> */}
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
          <AppointmentForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}