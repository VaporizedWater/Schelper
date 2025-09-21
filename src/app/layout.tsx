import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CalendarProvider } from "@/components/CalendarContext/CalendarContext";
import NavWrapper from "@/components/NavWrapper/NavWrapper";
import { SessionProvider } from "next-auth/react";
import ThemeProvider from "@/components/ThemeProvider/ThemeProvider";
import { ToastProvider } from "@/components/Toast/Toast";
import { ConfirmProvider } from "@/components/Confirm/Confirm";

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
    title: "Schelper | The Class Scheduling App",
    description: "Schedule and manage classes",
};

export default function RootLayout(
    { children }: Readonly<{ children: React.ReactNode; }>
) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}>
                <ThemeProvider>
                    <SessionProvider>
                        <ToastProvider>
                            <ConfirmProvider>
                                <CalendarProvider>
                                    <NavWrapper />
                                    <div className="flex-1">
                                        {children}
                                    </div>
                                </CalendarProvider>
                            </ConfirmProvider>
                        </ToastProvider>
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
