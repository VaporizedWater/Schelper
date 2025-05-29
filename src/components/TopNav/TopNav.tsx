import Link from "next/link";
import Image from "next/image";
import { HorizontalTextPSULogo } from "@/lib/icons";
import SignIn from "../SignIn/SignIn";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import Profile from "../Profile/Profile";

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
                <Link href="/" className="">
                    <div className='py-2'>
                        <Image
                            src={HorizontalTextPSULogo}
                            alt="Logo"
                            height={"40"}
                        />
                    </div>
                </Link>

                <div className="p-4 ml-auto text-white flex flex-row">
                    <Link href={'/calendar'}>
                        <button className="px-4 rounded-md h-full w-full sm:min-w-max text-white hover:opacity-75 duration-100">
                            <Image
                                src="/calendar1.png"
                                alt="Edit Calendar"
                                width={30}
                                height={12}
                                className="cursor-pointer transition rounded-sm"
                            />
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