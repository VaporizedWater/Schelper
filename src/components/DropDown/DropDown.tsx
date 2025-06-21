import { DropDownProps } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const DropDown = ({
    id = `dropdown-${Math.random().toString(36).substr(2, 5)}`,
    label = "Options",
    renderButton,
    renderDropdown,
    buttonClassName,
    dropdownClassName,
    closeOnOutsideClick = true,
    defaultOpen = false,
    darkClass = "",
    divClassName = "",
}: DropDownProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (closeOnOutsideClick && isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, closeOnOutsideClick]);  // eslint-disable-line react-hooks/exhaustive-deps

    const toggleDropdown = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    // IDs for ARIA
    const buttonId = `${id}-button`;
    const listId = `${id}-list`;

    return (
        <div ref={dropdownRef} className={`relative ${divClassName}`}>
            <button
                id={buttonId}
                type="button"
                onClick={toggleDropdown}
                className={`${buttonClassName} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                data-testid="dropdown-button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listId}
                title={label}
            >
                {renderButton(isOpen)}
            </button>

            {isOpen && (
                <div
                    id={listId}
                    role="listbox"
                    aria-labelledby={buttonId}
                    className={`absolute w-full rounded-lg mt-2 bg-white shadow-md z-10 ${dropdownClassName} ${darkClass}`}
                    data-testid="dropdown-content"
                >
                    {renderDropdown()}
                </div>
            )}
        </div>
    );
};

export default DropDown;
