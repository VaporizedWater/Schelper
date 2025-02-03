// Use an attribute to determine the appearance and behavior of the component.
import { DropDownInfo } from "@/lib/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { MdAdd } from "react-icons/md";

const DropDown = (props: DropDownInfo) => {
    const [isDropOpen, setDropOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    let i = 0;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Button to control dropdown */}
            <button onClick={() => setDropOpen((prev) => !prev)} className="flex flex-row gap-2 p-2 items-center bg-white rounded-full hover:bg-gray-200">
                <div className=''>
                    <MdAdd className="size-4 text-lightblack"></MdAdd>
                </div>
                <div className="">{props.title}</div>
                <div className=''>
                    {!isDropOpen ?
                        <IoMdArrowDropdown className="size-4" /> :
                        <IoMdArrowDropup className="size-4" />
                    }
                </div>
            </button>

            {/* Dropdown List*/}
            {isDropOpen &&
                <div
                    className={`absolute mt-2 border border-gray-200 bg-white shadow-md z-10 transition-transform duration-200 ease-in-out ${isDropOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"} origin-top`}
                >
                    <ul className="flex flex-col rounded-full w-full">
                        {props.list.map((item) => (
                            <li key={++i} className="bg-white w-full border-y border-gray-100 flex items-center hover:bg-gray-100 duration-100">
                                <Link href={item.link} className="py-2 px-4 w-full">
                                    {item.content}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            }
        </div>
    )
}

export default DropDown;