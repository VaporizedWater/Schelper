import { DropDownProps } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const DropDown = ({ renderButton, renderDropdown, buttonClassName, dropdownClassName }: DropDownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button onClick={() => setIsOpen((prev) => !prev)} className={buttonClassName}>
                {renderButton(isOpen)}
            </button>

            {isOpen && (
                <div className={`absolute w-full rounded-md mt-2 bg-white shadow-md z-10 ${dropdownClassName}`}>
                    {renderDropdown()}
                </div>
            )}
        </div>
    );
};

export default DropDown;
