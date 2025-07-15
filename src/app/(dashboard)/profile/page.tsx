// src/app/(dashboard)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface UserProfileData {
  email: string;
  role: string;
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await api.get('/user/profile');
          setProfileData(response.data);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center text-red-500 py-8">Could not load profile information.</div>;
  }

  const fullName = `${profileData.profile.firstName || ''} ${profileData.profile.lastName || ''}`.trim();

  return (
    <div className=" min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>

        <div className="px-6 pb-8 -mt-12 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-medium border-4 border-white shadow-md">
            {fullName ? fullName.charAt(0).toUpperCase() : profileData.email.charAt(0).toUpperCase()}
          </div>

          {/* Profile Info */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800">{fullName || 'No Name Provided'}</h2>
            <p className="text-gray-600">{profileData.email}</p>
            <p className="text-sm text-gray-500 capitalize mt-1">{profileData.role} • Member since {new Date(profileData.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="mt-6 space-y-4">
            <p className='text-gray-400'><strong className="text-gray-700">First Name:</strong> {profileData.profile.firstName || <span className="text-gray-400">Not provided</span>}</p>
            <p className='text-gray-400'><strong className="text-gray-700">Last Name:</strong> {profileData.profile.lastName || <span className="text-gray-400">Not provided</span>}</p>
            <p className='text-gray-400'><strong className="text-gray-700">Email:</strong> {profileData.email}</p>
            <p className='text-gray-400'><strong className="text-gray-700">Role:</strong> <span className="capitalize">{profileData.role}</span></p>
          </div>

          <button className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}