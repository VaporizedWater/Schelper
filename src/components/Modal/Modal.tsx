"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
    children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);
    const [mouseDownInside, setMouseDownInside] = useState(false);

    // Add global ESC key listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                router.back();
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const closeModal = useCallback(() => {
        router.back(); // Navigate back to the previous route
    }, [router]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (modalRef.current && modalRef.current.contains(e.target as Node)) {
            setMouseDownInside(true);
        } else {
            setMouseDownInside(false);
        }
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!mouseDownInside && !modalRef.current?.contains(e.target as Node)) {
            closeModal(); // Close modal if mouse was not down inside
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            aria-hidden="true"
        >
            {/* Modal Content */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Modal window"
                className="bg-white dark:bg-zinc-800 min-w-fit w-[85%] md:w-[60%] rounded-lg relative max-h-[85vh] min-h-[50vh] flex flex-col pb-8 pt-4 z-50"
                ref={modalRef}
            >
                <button
                    type="button"
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 z-10 cursor-pointer"
                    onClick={closeModal}
                    aria-label="Close modal"
                >
                    &#x2715;
                </button>

                {/* Modal Content */}
                <div
                    className="px-2 overflow-y-auto flex-1 mt-8"
                    tabIndex={0}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
