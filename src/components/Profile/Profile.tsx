"use client";

import { useCallback } from "react";
import DropDown from "../DropDown/DropDown";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import SignIn from "../SignIn/SignIn";
import { useSession } from "next-auth/react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { useTheme } from "next-themes";
import Link from "next/link";

const Profile = () => {
    const { data: session } = useSession();
    const { theme, resolvedTheme } = useTheme();

    const renderButton = useCallback((isOpen: boolean) => {
        return (
            <div className={`flex items-center gap-1 px-3 py-2 bg-white rounded-lg 
        hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all duration-200 
        shadow-sm hover:shadow border border-gray-200 dark:border-gray-700
        ${isOpen ? 'bg-gray-100 dark:bg-zinc-700' : ''}`}>

                <MdAccountCircle className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-300" />
                <div className="flex justify-center w-full">
                    {session?.user ? (
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {session.user.email?.split('@')[0]}
                        </span>
                    ) : null}
                </div>
                {isOpen ?
                    <IoMdArrowDropup className="size-4 ml-0.5 text-gray-600 dark:text-gray-400" /> :
                    <IoMdArrowDropdown className="size-4 ml-0.5 text-gray-600 dark:text-gray-400" />
                }
            </div>
        );
    }, []);

    const renderDropdown = useCallback(() => {
        return (
            <div className="w-full rounded-lg shadow-md border border-gray-200 bg-white dark:bg-zinc-800 dark:border-gray-700 overflow-hidden py-2 flex flex-col px-4 items-start gap-2">
                <div className="py-2 flex flex-row items-center gap-2 w-full">
                    <ThemeToggle />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {(theme === "dark" || resolvedTheme === "dark") ? "Dark" : "Light"}
                    </span>
                </div>

                <div className="w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 hover:text-shadow-xs dark:hover:text-gray-300 dark:hover:text-shadow-gray-500 transition-colors">
                    <Link href="/settings" className="">
                        Settings
                    </Link>
                </div>

                <div className="w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 hover:text-shadow-xs dark:hover:text-gray-300 dark:hover:text-shadow-gray-500 transition-colors">
                    <Link href="/calendars" className="">
                        My Calendars
                    </Link>
                </div>

                <div className="w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 hover:text-shadow-xs dark:hover:text-gray-300 dark:hover:text-shadow-gray-500 transition-colors">
                    <Link href="/professors" className="">
                        My Professors
                    </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-center w-full">
                        <SignIn />
                    </div>
                </div>
            </div>
        );
    }, [session, theme, resolvedTheme]);

    return (
        <DropDown
            renderButton={renderButton}
            renderDropdown={renderDropdown}
            buttonClassName="focus:outline-none"
            dropdownClassName="right-0 w-56 mt-1"
            darkClass="dark:bg-zinc-800"
            divClassName=""
        />
    );
};

export default Profile;