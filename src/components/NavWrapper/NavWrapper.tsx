"use client";

import { usePathname } from 'next/navigation';
import TopNav from '@/components/TopNav/TopNav';

const NavWrapper = () => {
    const pathname = usePathname();
    const hideNavRoutes: string[] = [];
    const showNav = !hideNavRoutes.includes(pathname);

    return showNav ? <TopNav /> : null;
}

export default NavWrapper;