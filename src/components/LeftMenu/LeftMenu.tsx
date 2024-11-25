// Parent of Filters, and ClassProperties
import { useEffect, useState } from "react";
import Image from "next/image";
import Filters from "../Filters/Filters";
import { TagProps } from "@/app/api/types";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
import { IoCaretDown } from "react-icons/io5";

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
        <div className="flex flex-col">
            <div className="flex flex-row gap-2 p-4 items-center bg-white shadow-lg border border-gray rounded-lg hover:bg-grayblue duration-100 w-fit">
                <div className=''>
                    <Link href={'/'} className="">
                        <MdAdd className="size-7 text-lightblack"></MdAdd>
                    </Link>
                </div>
                <div className="flex">Create</div>
                <div className=''>
                    <IoCaretDown className="size-3"></IoCaretDown>
                </div>
            </div>
            <div className="px-4 mr-4 my-4 max-h-[30vh] overflow-y-scroll scrollbar-webkit scrollbar-thin">
                <Filters tags={tagList} />
            </div>
            {/* <div className="p-4"> */}
            {/* <ClassProperties /> */}
            {/* </div> */}
        </div>
    );
}

export default LeftMenu;