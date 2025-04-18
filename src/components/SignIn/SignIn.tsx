"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useCalendarContext } from "../CalendarContext/CalendarContext";


const SignIn = () => {
    const { data: session } = useSession();
    const { resetContextToEmpty } = useCalendarContext();

    if (session?.user) {
        return (
            <div className="flex flex-row items-center">
                <button className="px-5 border rounded-full text-white hover:opacity-75 duration-100" onClick={() => {
                    resetContextToEmpty();
                    signOut()
                }}>Log Out</button>
                <div className="text-white text-sm ml-2">{session.user.email?.split('@')[0]}</div>
            </div>
        )
    }
    return <button className="px-5 border rounded-full text-white hover:opacity-75 duration-100" onClick={() => signIn("microsoft-entra-id")}>Log In</button>
}

export default SignIn;

// className="px-5 rounded-md h-full w-full sm:min-w-max text-white "