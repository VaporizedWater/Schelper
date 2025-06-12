import { DropDownProps } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const DropDown = ({ renderButton, renderDropdown, buttonClassName, dropdownClassName, alwaysOpen = false, defaultOpen = false, darkClass = "", divClassName = "" }: DropDownProps) => {
    // Initialize isOpen based on alwaysOpen (which takes priority) or defaultOpen
    const [isOpen, setIsOpen] = useState(alwaysOpen || defaultOpen);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Only update isOpen based on defaultOpen if not alwaysOpen
    useEffect(() => {
        if (!alwaysOpen) {
            setIsOpen(defaultOpen);
        }
    }, [defaultOpen, alwaysOpen]);

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

    const toggleDropdown = useCallback(() => {
        // Allow toggling regardless of alwaysOpen setting
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <div ref={dropdownRef} className={"relative " + divClassName}>
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
                    className={`absolute w-full rounded-lg mt-2 bg-white shadow-md z-10 ${dropdownClassName} ${darkClass}`}
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
