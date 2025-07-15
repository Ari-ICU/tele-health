'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Doctor } from '@/types';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        setError('Could not load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return Array(fullStars)
      .fill(0)
      .map((_, i) => <span key={i}>⭐</span>);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow max-w-md w-full text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">🏥 Find a Doctor</h1>

        {doctors.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No doctors available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Header - Avatar + Name */}
                <div className="p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-2xl">
                      {doctor.profile.firstName.charAt(0)}
                      {doctor.profile.lastName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Dr. {doctor.profile.firstName} {doctor.profile.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">{doctor.doctorProfile.specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Body - Info */}
                <div className="p-6 space-y-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    {renderStars(doctor.doctorProfile.rating)}
                    <span className="text-gray-600 ml-1 text-sm">
                      ({doctor.doctorProfile.rating.toFixed(1)} / 5)
                    </span>
                  </div>

                  {/* Fee */}
                  <p className="text-lg font-semibold text-gray-700">
                    💵 ${doctor.doctorProfile.consultationFee} per consultation
                  </p>

                  {/* Location (Optional) */}
                  {doctor.doctorProfile.hospital && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                      🏥 {doctor.doctorProfile.hospital}
                    </p>
                  )}
                </div>

                {/* Footer - Action Button */}
                <div className="p-6 border-t bg-gray-50">
                  <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium py-2 px-4 rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors shadow-sm hover:shadow focus:outline-none">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}