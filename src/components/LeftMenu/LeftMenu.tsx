// Parent of Filters, and ClassProperties
'use client'

import { useEffect, useState } from "react";
import Filters from "../Filters/Filters";
import { DropDownItemProps, TagProps } from "@/lib/types";
import { MdAdd } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DropDown from "../DropDown/DropDown";
import { classIcon, tagIcon } from "@/lib/icons";
import ClassProperties from "../ClassProperties/ClassProperties";

const LeftMenu = () => {
    const [tagList, setTags] = useState<TagProps[]>([]);
    const [isDropOpen, setDropOpen] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            const res = await fetch('/api/tags');
            const data = await res.json();
            setTags(data);
        }

        fetchTags();
    }, []);

    const dropDownList: DropDownItemProps[] = [
        { content: "New Class", iconUrl: classIcon, iconAlt: "test", link: "/classes" },
        { content: "New Tag", iconUrl: tagIcon, iconAlt: "test", link: "/addTag" }
    ];

    return (
        <div className="flex flex-col max-w-fit">
            <div className="relative">
                <button onClick={() => setDropOpen((prev) => !prev)} className="flex flex-row gap-2 p-4 items-center bg-white shadow-lg border border-gray rounded-lg hover:bg-grayblue duration-100 w-fit">
                    <div className=''>
                        <MdAdd className="size-7 text-lightblack"></MdAdd>
                    </div>
                    <div className="">Create</div>
                    <div className=''>
                        {!isDropOpen ?
                            <IoMdArrowDropdown className="size-4" /> :
                            <IoMdArrowDropup className="size-4" />
                        }
                    </div>
                </button>

                {isDropOpen &&
                    <div className="absolute left-0 right-0 mt-2 shadow-xl rounded-full w-full">
                        <DropDown list={dropDownList} />
                    </div>
                }
            </div>
            <div className="px-4 my-4">
                <Filters tags={tagList} />
            </div>


            <div className="p-4">
                <ClassProperties />
            </div>
        </div>
    );
}

export default LeftMenu;