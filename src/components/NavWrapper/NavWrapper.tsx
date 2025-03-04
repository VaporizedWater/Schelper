'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/TopNav/TopNav';

const NavWrapper = () => {
    const pathname = usePathname();
    const hideNavRoutes = ['/login', '/calendar', '/viewConflicts', '/exportSheet', '/importSheet', '/classes', '/addTag'];
    const showNav = !hideNavRoutes.includes(pathname);

    return showNav ? <TopNav /> : null;
}

export default NavWrapper;