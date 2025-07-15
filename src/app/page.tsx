'use client';

import Link from 'next/link';
import { motion } from 'framer-motion'; // Optional: for animations
import { useEffect, useRef } from 'react';

export default function HomePage() {
  const mainRef = useRef<HTMLElement>(null);

  // Focus main content for accessibility on page load
  useEffect(() => {
    mainRef.current?.focus();
  }, []);

  // Animation variants for buttons
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-gray-800"
      aria-label="Tele-Health Homepage"
    >
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-4 py-12 md:py-16 max-w-4xl mx-auto">
        {/* Logo or Icon (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <svg
            className="w-16 h-16 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
        >
          Welcome to Tele-Health
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg"
        >
          Connect with healthcare professionals anytime, anywhere. Your health, our priority.
        </motion.p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Log in to your Tele-Health account"
            >
              Log In
            </Link>
          </motion.div>
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              aria-label="Register for a new Tele-Health account"
            >
              Register
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Optional Feature Section */}
      <section className="w-full py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
            Why Choose Tele-Health?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-6 bg-gray-50 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Instant Consultations
              </h3>
              <p className="text-gray-600">
                Connect with doctors in real-time via video or chat.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="p-6 bg-gray-50 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data is protected with top-tier encryption.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="p-6 bg-gray-50 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                24/7 Access
              </h3>
              <p className="text-gray-600">
                Get care whenever you need it, day or night.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}