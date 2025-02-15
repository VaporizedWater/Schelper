import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TopNav from "@/components/TopNav/TopNav";
import { CalendarProvider } from "@/components/CalendarContext/CalendarContext";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-graybg h-[100vh]`}>
                <TopNav></TopNav>
                <div className="bg-graybg h-full">
                    <CalendarProvider>
                        {children}
                    </CalendarProvider>
                </div>
            </body>
        </html>
    );
}
