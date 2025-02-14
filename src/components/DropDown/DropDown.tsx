// Use an attribute to determine the appearance and behavior of the component.
import { DropDownInfo } from "@/lib/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { MdAdd, MdExpandLess, MdExpandMore } from "react-icons/md";

const DropDown = (props: DropDownInfo) => {
    const [isDropOpen, setDropOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonStyles: string = "flex flex-row gap-2 p-2 items-center bg-white rounded-full hover:bg-gray-200";
    const listStyles: string = "w-full rounded-md items-center flex flex-row border border-gray-300 bg-gray-200 hover:bg-gray-300";

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
            <button onClick={() => setDropOpen((prev) => !prev)} className={props.dropType == "button" ? buttonStyles : listStyles}>
                {props.dropType == "button" ?
                    <div className=''>
                        <MdAdd className="size-4 text-lightblack"></MdAdd>
                    </div>
                    :
                    <div className=''>
                        {isDropOpen ?
                            <MdExpandLess /> : <MdExpandMore />
                        }
                    </div>
                }

                <div className={props.titleInfo}>{props.title}</div>
                {
                    props.dropType == "button" &&
                    <div className=''>
                        {!isDropOpen ?
                            <IoMdArrowDropdown className="size-4" /> :
                            <IoMdArrowDropup className="size-4" />
                        }
                    </div>
                }
            </button>

            {/* Dropdown List*/}
            {isDropOpen &&
                <div
                    className={`absolute w-full mt-2 border border-gray-200 bg-white shadow-md z-10 transition-transform duration-200 ease-in-out ${isDropOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"} origin-top`}
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