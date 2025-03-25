import Image from "next/image";
import { LogoIcon } from "@/lib/icons";

const Footer = () => {
    return (
        <footer className="w-full bg-psublue p-5 text-white relative bottom-0 flex flex-row items-center gap-2">
            <span>Copyright © 2024 </span>
            <span className="flex flex-row items-center">
                <LogoIcon height="36" width="36"/>
                <p className="font-bold text-lg text-lightblue text-center p-1 ">Schelper</p>
            </span>
        </footer>
    );
}

export default Footer;