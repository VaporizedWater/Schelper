import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CalendarProvider } from "@/components/CalendarContext/CalendarContext";
import NavWrapper from "@/components/NavWrapper/NavWrapper";
import { SessionProvider } from "next-auth/react"

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Class Scheduling App",
    description: "Schedule and manage classes",
};

export default function RootLayout(
    { children }: Readonly<{ children: React.ReactNode; }>
) {
    return (
        <html className="dark" lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen bg-white dark:bg-white text-black dark:text-black`}>
                <SessionProvider>
                    <CalendarProvider>
                        <NavWrapper />
                        <div className="flex-1">
                            {children}
                        </div>
                    </CalendarProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
