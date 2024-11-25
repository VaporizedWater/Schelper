// Child (sub-component) of left menu
import { TagPropList } from "@/app/api/types";
import { MdModeEdit } from "react-icons/md";

const Filters = (props: TagPropList) => {
    return (
        <ul className="flex flex-col">
            <div className="flex flex-row">
                <div className="text-bold">My&nbsp;Tags</div>
                <button className="rounded-lg px-2"><MdModeEdit className="size-4" /></button>
            </div>
            {props.tags.map((tag) => (
                <li key={tag.tagName}>
                    <input
                        type="checkbox"
                        name={tag.tagName}
                    />
                    {tag.tagName}
                </li>
            ))}
        </ul>
    );
}

export default Filters;