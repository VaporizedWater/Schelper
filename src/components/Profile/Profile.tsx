"use client";

import { useCallback, useMemo } from "react";
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

    // stable ID for this dropdown
    const dropdownId = useMemo(() => "profile-dropdown", []);

    const renderButton = useCallback(
        (isOpen: boolean) => (
            <div
                id={`${dropdownId}-button`}
                role="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={`${dropdownId}-menu`}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        // rely on DropDown's toggle
                        document
                            .getElementById(`${dropdownId}-button`)
                            ?.click();
                    }
                }}
                className={`flex items-center gap-1 px-3 py-2 bg-white rounded-lg 
          hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all duration-200 
          shadow-sm hover:shadow border border-gray-200 dark:border-gray-700
          ${isOpen ? "bg-gray-100 dark:bg-zinc-700" : ""} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
                title={session?.user ? session.user.email?.split("@")[0] : "User menu"}
            >
                <MdAccountCircle
                    className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-300"
                    aria-hidden="true"
                />
                <div className="flex justify-center w-full">
                    {session?.user ? (
                        <span
                            className="text-sm font-medium text-gray-800 dark:text-gray-200"
                            aria-label={`Signed in as ${session.user.email}`}
                        >
                            {session.user.email?.split("@")[0]}
                        </span>
                    ) : null}
                </div>
                {isOpen ? (
                    <IoMdArrowDropup
                        className="size-4 ml-0.5 text-gray-600 dark:text-gray-400"
                        aria-hidden="true"
                    />
                ) : (
                    <IoMdArrowDropdown
                        className="size-4 ml-0.5 text-gray-600 dark:text-gray-400"
                        aria-hidden="true"
                    />
                )}
            </div>
        ),
        [dropdownId, session]
    );

    const renderDropdown = useCallback(
        () => (
            <div
                id={`${dropdownId}-menu`}
                role="menu"
                aria-labelledby={`${dropdownId}-button`}
                className="w-full rounded-lg shadow-md border border-gray-200 bg-white dark:bg-zinc-800 dark:border-gray-700 overflow-hidden py-2 flex flex-col px-4 items-start gap-2"
            >
                {/* Theme toggle */}
                <div role="none" className="py-2 flex items-center gap-2 w-full">
                    <ThemeToggle />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {(theme === "dark" || resolvedTheme === "dark") ? "Dark" : "Light"}
                    </span>
                </div>

                {/* Menu links */}
                {[
                    { href: "/settings", label: "Settings", sub: false },
                    { href: "/calendars", label: "My Calendars", sub: false },
                    { href: "/department", label: "My Department", sub: false },
                    { href: "/professors", label: "My Professors", sub: true },
                    { href: "/professors", label: "My Classes", sub: true },
                ].map(({ href, label, sub }, idx) => (
                    <Link
                        key={idx}
                        href={href}
                        role="menuitem"
                        tabIndex={0}
                        className={`w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500` + (sub ? " pl-2" : "")}
                        title={label}
                    >
                        {label}
                    </Link>
                ))}

                {/* Sign in/out */}
                <div
                    role="none"
                    className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 w-full flex justify-center"
                >
                    <SignIn />
                </div>
            </div>
        ),
        [dropdownId, theme, resolvedTheme]
    );

    return (
        <DropDown
            id={dropdownId}
            label="User menu"
            renderButton={renderButton}
            renderDropdown={renderDropdown}
            buttonClassName="focus:outline-none"
            dropdownClassName="right-0 w-56 mt-1"
            darkClass="dark:bg-zinc-800"
            divClassName=""
            closeOnOutsideClick={true}
        />
    );
};

export default Profile;
