import { MdAdd } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import Link from "next/link";
import DropDown from "../DropDown/DropDown";
import { ButtonDropDownProps } from "@/lib/types";

const ButtonDropDown = ({ title, items }: ButtonDropDownProps) => {
    return (
        <DropDown
            renderButton={(isOpen) => (
                <div className="flex items-center p-2 bg-white rounded-full hover:bg-gray-200">
                    <MdAdd className="size-4 text-lightblack" />
                    <span>{title}</span>
                    {isOpen ? <IoMdArrowDropup className="size-4" /> : <IoMdArrowDropdown className="size-4" />}
                </div>
            )}
            renderDropdown={() => (
                <ul className="w-full rounded-md border border-gray-300 bg-white">
                    {items.map((item, index) => (
                        <li key={index} className="hover:bg-gray-100 border-b">
                            <Link href={item.link} className="block px-4 py-2">
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
