'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Appointment, Doctor } from '@/types';

interface AppointmentFormProps {
  initialData?: Appointment;
  onSuccess: () => void;
}

export default function AppointmentForm({ initialData, onSuccess }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    doctorId: initialData?.doctor?._id || '',
    dateTime: initialData?.dateTime ? new Date(initialData.dateTime).toISOString().slice(0, 16) : '',
    symptoms: initialData?.symptoms || '',
    status: initialData?.status || 'scheduled',
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors');
        setDoctors(response.data);
      } catch (err) {
        setError('Failed to fetch doctors');
      }
    };
    fetchDoctors();
  }, []);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.doctorId) errors.doctorId = 'Please select a doctor';
    if (!formData.dateTime) errors.dateTime = 'Please select a date and time';
    if (new Date(formData.dateTime) < new Date()) {
      errors.dateTime = 'Date and time cannot be in the past';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (initialData?._id) {
        // Update existing appointment
        await api.put(`/appointments/${initialData._id}`, {
          doctor: formData.doctorId,
          dateTime: new Date(formData.dateTime).toISOString(),
          symptoms: formData.symptoms,
          status: formData.status,
        });
      } else {
        // Create new appointment
        await api.post('/appointments', {
          doctor: formData.doctorId,
          dateTime: new Date(formData.dateTime).toISOString(),
          symptoms: formData.symptoms,
          status: formData.status,
        });
      }
      onSuccess();
    } catch (err) {
      setError('Failed to save appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center mb-5">
        <button
          type="button"
          onClick={onSuccess}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          aria-label="Go back"
        >
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
        <h2 className="ml-2 text-2xl font-bold text-gray-800">
          {initialData ? 'Edit Appointment' : 'Create Appointment'}
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* Doctor Select */}
        <div>
          <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
            Doctor
          </label>
          <select
            id="doctorId"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
              formErrors.doctorId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.profile.firstName} {doctor.profile.lastName}
              </option>
            ))}
          </select>
          {formErrors.doctorId && (
            <p className="mt-1 text-sm text-red-500">{formErrors.doctorId}</p>
          )}
        </div>

        {/* Date Time Input */}
        <div>
          <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">
            Date and Time
          </label>
          <input
            id="dateTime"
            name="dateTime"
            type="datetime-local"
            value={formData.dateTime}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
              formErrors.dateTime ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {formErrors.dateTime && (
            <p className="mt-1 text-sm text-red-500">{formErrors.dateTime}</p>
          )}
        </div>

        {/* Symptoms Textarea */}
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
            Symptoms (Optional)
          </label>
          <textarea
            id="symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            placeholder="Describe any symptoms..."
          />
        </div>

        {/* Status Select */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          >
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}