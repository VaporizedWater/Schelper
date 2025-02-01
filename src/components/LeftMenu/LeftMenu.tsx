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

    useEffect(() => {
        const fetchTags = async () => {
            const res = await fetch('/api/tags');
            const data = await res.json();
            setTags(data);
        }

        fetchTags();
    }, []);

    return (
        <div className="flex flex-col max-w-fit">
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