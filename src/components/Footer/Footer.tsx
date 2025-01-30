import Image from "next/image";
import logo from "@/lib/icons";

const Footer = () => {
    return (
        <footer className="w-full bg-psublue p-5 text-white relative bottom-0 flex flex-row items-center gap-2">
            <span>Copyright © 2024 </span>
            <span className="flex flex-row items-center">
                <Image src={logo} height={36} alt="Schelper Icon" />
                <p className="font-bold text-lg text-lightblue text-center p-1 ">Schelper</p>
            </span>
        </footer>
    );
}

export default Footer;