'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';



export default function DashboardChart() {
  const [chartData, setChartData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stats/weekly');
        const transformedData = response.data.map((item: { day: string; appointments: number; messages: number }) => ({
          name: item.day,
          Appointments: item.appointments,
          Messages: item.messages,
        }));
        setChartData(transformedData);
        setError(null);
      } catch (err) {
        setError('Failed to load weekly stats.');
        console.error('Error fetching weekly stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStats();
  }, []);


  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg h-[360px]">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Overview</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="Appointments" stroke="#6366F1" strokeWidth={2} />
            <Line type="monotone" dataKey="Messages" stroke="#14B8A6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}