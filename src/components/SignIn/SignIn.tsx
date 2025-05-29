"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useCalendarContext } from "../CalendarContext/CalendarContext";


const SignIn = () => {
    const { data: session } = useSession();
    const { resetContextToEmpty } = useCalendarContext();

    if (session?.user) {
        return (
            <button
                className="w-full px-4 py-2 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 text-sm font-medium transition-colors"
                onClick={() => {
                    resetContextToEmpty();
                    signOut()
                }}
            >
                Log Out
            </button>
        )
    }

    return (
        <button
            className="px-4 py-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-sm font-medium transition-colors"
            onClick={() => signIn("microsoft-entra-id")}
        >
            Log In
        </button>
    )
}

export default SignIn;