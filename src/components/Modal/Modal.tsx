"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
    children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
    const router = useRouter();

    const closeModal = () => {
        router.back(); // Navigate back to the previous route
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={closeModal}
        >
            {/* Modal Content */}
            <div
                className="bg-white min-w-fit w-[80%] md:w-[50%] min-h-80 rounded-lg relative flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent click propagation
            >
                <button
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
                >
                    &#x2715;
                </button>

                {/* Modal Content */}
                <div className="max-h-[75vh] overflow-y-auto scrollbar-thin">
                    {children}
                </div>
            </div>
        </div>
    );
}
