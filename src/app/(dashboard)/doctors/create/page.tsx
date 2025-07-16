// app/doctors/create/page.tsx
'use client';

import CreateDoctorForm from '@/components/doctor/CreateDoctorForm';
import { useRouter } from 'next/navigation';

export default function CreateDoctorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <CreateDoctorForm onSuccess={() => router.push('/doctors')} />
      </div>
    </div>
  );
}
