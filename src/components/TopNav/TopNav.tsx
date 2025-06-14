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

    const commonHeaderProps = {
        role: "banner",
        "aria-label": "Site header",
        className:
            "flex flex-row items-center bg-psublue dark:bg-zinc-800 border-b border-gray-400 dark:border-gray-600 sticky top-0 z-50 pl-6 md:pl-8 lg:pl-10",
    } as const;

    const loggedOut = useMemo(() => {
        return (
            <header  {...commonHeaderProps}>
                <Link href="/" aria-label="Go to homepage" className="flex items-center py-2">
                    <Image
                        src={HorizontalTextPSULogo}
                        alt="Logo"
                        height={"40"}
                        priority
                    />
                </Link>

                <div className="ml-auto p-4 text-white flex items-center">
                    <SignIn></SignIn>
                </div>
            </header>
        );
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loggedIn = useMemo(() => {
        return (
            <header {...commonHeaderProps}>
                <Link href="/" aria-label="Go to homepage" className="flex items-center py-2">
                    <Image
                        src={HorizontalTextPSULogo}
                        alt="Logo"
                        height={"40"}
                        priority
                    />
                </Link>

                <nav
                    aria-label="User actions"
                    className="ml-auto p-4 text-white flex items-center space-x-2"
                >
                    <Link
                        href={'/calendar'}
                        aria-label="View calendar"
                        className="inline-flex items-center justify-center px-1.5 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
                    >
                        <MdCalendarMonth
                            className="h-7 w-7 text-gray-500 dark:text-white"
                            aria-hidden="true"
                        />
                    </Link>
                    <Profile />
                </nav>
            </header>
        );
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return session?.user ? loggedIn : loggedOut;
}
// 
export default TopNav;