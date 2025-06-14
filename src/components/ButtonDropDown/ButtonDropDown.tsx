import { MdAdd, MdFileDownload, MdFileUpload } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import Link from "next/link";
import DropDown from "../DropDown/DropDown";
import { ButtonDropDownProps } from "@/lib/types";
import { useCallback, useMemo } from "react";

const ButtonDropDown = ({ title, items, type }: ButtonDropDownProps) => {
    // generate a stable ID based on the title
    const dropdownId = useMemo(
        () =>
            `button-dropdown-${title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-_]/g, "")}`,
        [title]
    );

    const renderButton = useCallback(
        (isOpen: boolean) => (
            <div
                className={`flex items-center gap-1 px-2 py-2 bg-white rounded-lg
          hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700 transition-all duration-200 
          shadow-sm hover:shadow border border-gray-200 dark:border-gray-500
          ${isOpen ? "bg-gray-100 dark:bg-dark" : ""}`}
                role="button"
                id={`${dropdownId}-button`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={`${dropdownId}-menu`}
                tabIndex={0}
                title={title}
            >
                {type.toLocaleLowerCase() === "create" && (
                    <MdAdd className="size-4 text-lightblack" aria-hidden="true" />
                )}
                {type.toLocaleLowerCase() === "upload" && (
                    <MdFileUpload className="size-4 text-gray-600" aria-hidden="true" />
                )}
                {type.toLocaleLowerCase() === "download" && (
                    <MdFileDownload className="size-4 text-gray-600" aria-hidden="true" />
                )}

                <span className="text-sm font-medium">{title}</span>
                {isOpen ? (
                    <IoMdArrowDropup
                        className="size-4 text-gray-600 dark:text-gray-400"
                        aria-hidden="true"
                    />
                ) : (
                    <IoMdArrowDropdown
                        className="size-4 text-gray-600 dark:text-gray-400"
                        aria-hidden="true"
                    />
                )}
            </div>
        ),
        [dropdownId, title, type]
    );

    const renderDropdown = useCallback(
        () => (
            <ul
                id={`${dropdownId}-menu`}
                role="menu"
                aria-labelledby={`${dropdownId}-button`}
                className="w-40 rounded-lg shadow-md border border-gray-200 bg-white dark:bg-dark dark:border-gray-500 overflow-hidden"
            >
                {items.map((item, idx) => (
                    <li
                        key={idx}
                        role="none"
                        className={`${idx < items.length - 1
                            ? "border-b border-gray-100 dark:border-gray-500"
                            : ""
                            }`}
                    >
                        <Link
                            href={item.link}
                            role="menuitem"
                            className="block px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-150"
                            title={item.content}
                        >
                            {item.content}
                        </Link>
                    </li>
                ))}
            </ul>
        ),
        [dropdownId, items]
    );

    return (
        <DropDown
            id={dropdownId}
            label={title}
            renderButton={renderButton}
            renderDropdown={renderDropdown}
            buttonClassName="inline-flex items-center focus:outline-none"
            dropdownClassName="right-0 mt-2"
            alwaysOpen={false}
            defaultOpen={false}
            darkClass="dark:bg-dark"
            divClassName="relative inline-block"
        />
    );
};

export default ButtonDropDown;
