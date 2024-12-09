// Child (sub-component) of ClassProperties
import { PropertyProps } from "@/lib/types";

const Property = (props: PropertyProps) => {
    return (
        <div className="flex flex-row justify-items-center">
            <div className="border border-gray w-1/2">{props.property}</div>
            <div className="border border-gray w-1/2">{props.value}</div>
        </div>
    )
}

export default Property;