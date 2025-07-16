'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Doctor } from '@/types';
import UpdateDoctorForm from '@/components/doctor/UpdateDoctorForm';

export default function EditDoctorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        setError('Doctor not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoctor();
  }, [id]);

  const handleSuccess = () => {
    router.push('/doctors');
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error || !doctor) return <p className="text-red-600 text-center py-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Doctor</h1>
      <UpdateDoctorForm doctor={doctor} onSuccess={handleSuccess} onCancel={() => router.back()} />
    </div>
  );
}
