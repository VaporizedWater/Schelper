import { MdAdd, MdFileDownload, MdFileUpload } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import Link from "next/link";
import DropDown from "../DropDown/DropDown";
import { ButtonDropDownProps } from "@/lib/types";
import { useCallback } from "react";

const ButtonDropDown = ({ title, items, type }: ButtonDropDownProps) => {
    const renderButton = useCallback((isOpen: boolean) => {
        return (
            <div className={`flex items-center gap-1 px-2 py-2 bg-white rounded-lg
                hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700 transition-all duration-200 
                shadow-sm hover:shadow border border-gray-200 dark:border-gray-500
                ${isOpen ? 'bg-gray-100 dark:bg-dark' : ''}`}>

                {type.toLocaleLowerCase() === "create" && <MdAdd className="size-4 text-lightblack" />}
                {type.toLocaleLowerCase() === "upload" && <MdFileUpload className="size-4 text-gray-600" />}
                {type.toLocaleLowerCase() === "download" && <MdFileDownload className="size-4 text-gray-600" />}

                <span className="text-sm font-medium">{title}</span>
                {isOpen ?
                    <IoMdArrowDropup className="size-4 text-gray-600 dark:text-gray-400" /> :
                    <IoMdArrowDropdown className="size-4 text-gray-600 dark:text-gray-400" />
                }
            </div>
        );
    }, [title, type]);

    const renderDropdown = useCallback(() => {
        return (
            <ul className="w-full rounded-lg shadow-md border border-gray-200 bg-white dark:bg-dark dark:border-gray-500 overflow-hidden">
                {items.map((item, index) => (
                    <li key={index} className={`${index !== items.length - 1 ? 'border-b border-gray-100 dark:border-gray-500' : ''}`}>
                        <Link href={item.link} className="block px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-150">
                            {item.content}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    }, [items]);

    return (
        <DropDown
            renderButton={renderButton}
            renderDropdown={renderDropdown}
            buttonClassName="inline-flex items-center"
            dropdownClassName="w-40 right-0 min-w-fit"
            alwaysOpen={false}
            defaultOpen={false}
            darkClass="dark:bg-dark"
        />
    );
};

export default ButtonDropDown;
