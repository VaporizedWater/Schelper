// Parent of Filters, and ClassProperties
import { useEffect, useState } from "react";

import leftarrow from "public/left_triangle.png"
import rightarrow from "public/right_triangle.png"
import Image from "next/image";
import Filters from "../Filters/Filters";
import ClassProperties from "../ClassProperties/ClassProperties";
import { TagProps } from "@/app/api/types";
import Link from "next/link";

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
        <div className="flex flex-col border-2 border-gray-200">
            <div className="flex flex-row gap-4 p-5 items-center bg-gray-100">
                <div className=''>
                    <Link href={'/'}>
                        <Image
                            src={leftarrow}
                            alt="Logo"
                            height={"30"}
                        />
                    </Link>
                </div>
                <div className="">Calendar&nbsp;View</div>
                <div className=''>
                    <Link href={'/'}>
                        <Image
                            src={rightarrow}
                            alt="Logo"
                            height={"30"}
                        />
                    </Link>
                </div>
            </div>
            <div className="px-4 border-y border-gray-200">
                <Filters tags={tagList} />
            </div>
            <div className="p-4">

                <ClassProperties />
            </div>
        </div>
    );
}

export default LeftMenu;