// Use an attribute to determine the appearance and behavior of the component.
import { DropDownItemPropList } from "@/lib/types";
import DropDownItem from "../DropDownItem/DropDownItem";
import Link from "next/link";

const DropDown = (props: DropDownItemPropList) => {
    let i = 0;

    return (
        <ul className="flex flex-col border border-gray-200 rounded-md">
            {props.list.map((item) => (
                <li key={++i} className="bg-white w-full border border-gray-100 items-center flex items-center hover:bg-gray-100 duration-100">
                    <Link href={item.link} className="p-2 w-full">
                        <DropDownItem
                            content={item.content}
                            iconUrl={item.iconUrl}
                            iconAlt={item.iconAlt}
                            link={item.link}
                        />
                    </Link>

                </li>
            ))}
        </ul>
    )
}

export default DropDown;