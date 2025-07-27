import React from 'react';

const Loading = () => {
    return (
        <div
            id="loading-overlay"
            className="fixed inset-0 flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label="Loading content"
        >
            <div className="flex flex-col items-center">
                <div
                    id="loading-spinner"
                    role="status"
                    aria-busy="true"
                    aria-describedby="loading-text"
                    title="Loading"
                    className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-300 rounded-full animate-spin"
                />
                <span
                    id="loading-text"
                    className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300"
                >
                    Loading...
                </span>
            </div>
        </div>
    );
};

export default Loading;
