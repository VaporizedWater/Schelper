"use client"

import { signIn } from "next-auth/react"

const SignIn = () => {
    return <button className="px-5 rounded-md h-full w-full sm:min-w-max text-white hover:opacity-75 duration-100" onClick={() => signIn("microsoft-entra-id")}>Log In</button>
}

export default SignIn;