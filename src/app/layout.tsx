import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CalendarProvider } from "@/components/CalendarContext/CalendarContext";
import NavWrapper from "@/components/NavWrapper/NavWrapper";

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
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-graybg flex flex-col h-screen`}>
                <NavWrapper />
                <div className="bg-graybg flex-1">
                    <CalendarProvider>
                        {children}
                    </CalendarProvider>
                </div>
            </body>
        </html>
    );
}
