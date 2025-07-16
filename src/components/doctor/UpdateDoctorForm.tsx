'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function UpdateDoctorForm({
  doctor,
  onSuccess,
  onCancel,
}: {
  doctor: any;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [firstName, setFirstName] = useState(doctor.profile.firstName);
  const [lastName, setLastName] = useState(doctor.profile.lastName);
  const [specialty, setSpecialty] = useState(doctor.doctorProfile.specialty);
  const [consultationFee, setConsultationFee] = useState(
    doctor.doctorProfile.consultationFee
  );
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.put(`/doctors/${doctor._id}`, {
        profile: { firstName, lastName },
        doctorProfile: { specialty, consultationFee },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update doctor');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          aria-label="Go back"
        >
          {/* You can use an icon like Heroicons ChevronLeftIcon here */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </button>
        <h2 className="ml-2 text-2xl font-bold text-gray-800">Update Doctor</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
            Specialty
          </label>
          <input
            id="specialty"
            type="text"
            placeholder="Specialty"
            required
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
            Consultation Fee
          </label>
          <input
            id="fee"
            type="number"
            placeholder="Fee"
            required
            min="0"
            step="0.01"
            value={consultationFee}
            onChange={(e) => setConsultationFee(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}