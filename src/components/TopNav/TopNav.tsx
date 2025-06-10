import Link from "next/link";
import Image from "next/image";
import { HorizontalTextPSULogo } from "@/lib/icons";
import SignIn from "../SignIn/SignIn";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import Profile from "../Profile/Profile";
import { MdCalendarMonth } from "react-icons/md";

const TopNav = () => {
    const { data: session } = useSession();

    const loggedOut = useMemo(() => {
        return (
            <header className="flex flex-row bg-psublue dark:bg-zinc-800 border-b border-gray-400 dark:border-gray-600 sticky top-0 z-50 pl-6 md:pl-8 lg:pl-10">
                <Link href="/" className="cursor-pointer">
                    <div className='py-2'>
                        <Image
                            src={HorizontalTextPSULogo}
                            alt="Logo"
                            height={"40"}
                        />
                    </div>
                </Link>

                <div className="p-4 ml-auto text-white flex flex-row">
                    <SignIn></SignIn>
                </div>
            </header>
        );
    }, []);

    const loggedIn = useMemo(() => {
        return (
            <header className="flex flex-row items-center bg-psublue dark:bg-zinc-800 border-b border-gray-400 dark:border-gray-600 sticky top-0 z-50 pl-6 md:pl-8 lg:pl-10">
                <Link href="/" className="flex items-center">
                    <div className='py-2'>
                        <Image
                            src={HorizontalTextPSULogo}
                            alt="Logo"
                            height={"40"}
                        />
                    </div>
                </Link>

                <div className="p-4 ml-auto text-white flex flex-row items-center gap-2">
                    <Link href={'/calendar'} className="flex items-center">
                        <button className="px-1.5 py-1 w-full sm:min-w-max  text-gray-500 dark:text-white bg-white rounded-lg 
        hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all duration-200 
        shadow-sm hover:shadow border border-gray-200 dark:border-gray-700">
                            <MdCalendarMonth className="h-7 w-7" />
                        </button>
                    </Link>
                    <Profile></Profile>
                </div>
            </header>
        );
    }, []);

    if (session?.user == undefined) {
        return (loggedOut);
    }
    return (loggedIn);
}
// 
export default TopNav;