"use client";

import { ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
    children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
    const router = useRouter();

    const closeModal = useCallback(() => {
        router.back(); // Navigate back to the previous route
    }, [router]);

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
        >
            {/* Modal Content */}
            <div
                className="bg-white min-w-fit w-[85%] md:w-[60%] rounded-lg relative max-h-[85vh] min-h-[50vh] flex flex-col pb-8 pt-4"
                onClick={(e) => e.stopPropagation()} // Prevent click propagation
            >
                <button
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
                    onClick={closeModal}
                >
                    &#x2715;
                </button>

                {/* Modal Content */}
                <div className="px-2 overflow-y-auto flex-1 mt-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
