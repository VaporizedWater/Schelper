import { MdAdd, MdFileDownload, MdFileUpload } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import Link from "next/link";
import DropDown from "../DropDown/DropDown";
import { ButtonDropDownProps } from "@/lib/types";

const ButtonDropDown = ({ title, items, type }: ButtonDropDownProps) => {
    return (
        <DropDown
            renderButton={(isOpen) => (
                <div className={`flex items-center gap-2 px-3 py-2 bg-white rounded-full 
                    hover:bg-gray-100 transition-all duration-200 
                    shadow-sm hover:shadow border border-gray-200 
                    ${isOpen ? 'bg-gray-100' : ''}`}>

                    {type.toLocaleLowerCase() === "create" && <MdAdd className="size-4 text-lightblack" />}
                    {type.toLocaleLowerCase() === "upload" && <MdFileUpload className="size-4 text-gray-600" />}
                    {type.toLocaleLowerCase() === "download" && <MdFileDownload className="size-4 text-gray-600" />}

                    <span className="text-sm font-medium">{title}</span>
                    {isOpen ?
                        <IoMdArrowDropup className="size-4 ml-0.5 text-gray-600" /> :
                        <IoMdArrowDropdown className="size-4 ml-0.5 text-gray-600" />
                    }
                </div>
            )}
            renderDropdown={() => (
                <ul className="w-full mt-1 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden">
                    {items.map((item, index) => (
                        <li key={index} className={`${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <Link href={item.link} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150">
                                {item.content}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        />
    );
};

export default ButtonDropDown;
