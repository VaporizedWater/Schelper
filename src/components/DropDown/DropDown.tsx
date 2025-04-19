import { DropDownProps } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const DropDown = ({ renderButton, renderDropdown, buttonClassName, dropdownClassName, alwaysOpen = false, defaultOpen = false }: DropDownProps) => {
    // Initialize isOpen based on alwaysOpen prop
    const [isOpen, setIsOpen] = useState(alwaysOpen);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Set initial state to be defaultOpen
    useEffect(() => {
        setIsOpen(defaultOpen);
    }, [defaultOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Only close the dropdown if alwaysOpen is false
                if (!alwaysOpen) {
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [alwaysOpen]);

    const toggleDropdown = () => {
        // Allow toggling regardless of alwaysOpen setting
        setIsOpen((prev) => !prev);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={toggleDropdown}
                className={buttonClassName}
                data-testid="dropdown-button"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {renderButton(isOpen)}
            </button>

            {isOpen && (
                <div
                    className={`absolute w-full rounded-md mt-2 bg-white shadow-md z-10 ${dropdownClassName}`}
                    data-testid="dropdown-content"
                    role="listbox"
                >
                    {renderDropdown()}
                </div>
            )}
        </div>
    );
};

export default DropDown;
