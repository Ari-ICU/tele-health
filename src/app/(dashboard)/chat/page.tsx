export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 bg-gray-100">
      <div className="max-w-md w-full text-center">
        <div className="p-6 sm:p-8 bg-white rounded-xl shadow-md border border-gray-200 transition-transform hover:shadow-lg">
          {/* Illustration / Icon */}
          <div className="text-indigo-500 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            Select a Conversation
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Choose a conversation from the list to start chatting or create a new one.
          </p>

          <button
            disabled // Placeholder for future functionality
            className="mt-4 px-4 sm:px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Start a new conversation (coming soon)"
          >
            New Message
          </button>
        </div>
      </div>
    </div>
  );
}