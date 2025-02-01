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
                className="bg-white w-[80%] h-[60%] md:w-[50%] md:h-[50%] rounded-lg p-6 relative"
                onClick={(e) => e.stopPropagation()} // Prevent click propagation
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
                >
                    &#x2715;
                </button>

                {/* Modal Content */}
                {children}
            </div>
        </div>
    );
}
