// Child (sub-component) of left menu
import { TagProps } from "@/app/api/types";
import { TagPropList } from "@/app/api/types";

const Filters = (props: TagPropList) => {
    return (
        <div className="flex flex-col overflow-y-auto">
            <div className="p-1 text-center">Filters .
                <button className="bg-gray-300 rounded-lg">MANAGE</button></div>
            {props.tags.map((tag) => (
                <label key={tag.tagName}>
                    <input
                        type="checkbox"
                        name={tag.tagName}
                    />
                    {tag.tagName}
                </label>
            ))}
        </div>
    );
}

export default Filters;