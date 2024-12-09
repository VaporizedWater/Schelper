// Child (sub-component) of left menu
import { TagPropList } from "@/app/api/types";
import { MdModeEdit } from "react-icons/md";
import Link from "next/link";

const Filters = (props: TagPropList) => {
    return (
        <ul className="flex flex-col min-w-fit h-full max-h-[30vh]">
            <div className="flex flex-row items-center pb-1">
                <div className="text-bold">My&nbsp;Tags</div>
                <Link href={'./tags'}>
                    <button className="rounded-lg px-2"><MdModeEdit className="size-4" /></button>
                </Link>

            </div>
            <div className="overflow-y-scroll scrollbar-webkit scrollbar-thin pr-3" title="tag-list">
                {props.tags.map((tag) => (
                    <li key={tag.tagName} className="flex flex-row items-center" title="tag-item">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name={tag.tagName}
                                className="h-4 w-4 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                            />
                        </label>
                        <span className="ml-3 whitespace-nowrap">{tag.tagName}</span>
                    </li>
                ))}
            </div>
        </ul>
    );
}

export default Filters;