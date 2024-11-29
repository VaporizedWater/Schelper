import { DropDownItemProps } from "@/app/api/types";
import Image from "next/image";
import logo from "@/lib/icons";

const DropDownItem = (props: DropDownItemProps) => {
    return (
        <div className="flex flex-row gap-2 ">
            <Image
                src={logo}
                height={20}
                alt={props.iconAlt}
            />
            {props.content}
        </div>
    );
}

export default DropDownItem;