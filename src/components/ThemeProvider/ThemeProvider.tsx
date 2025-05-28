"use client";

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

type ThemeProviderProps = {
    children: ReactNode
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
    // Add this to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            {mounted ? children : null}
        </NextThemesProvider>
    );
};

export default ThemeProvider;