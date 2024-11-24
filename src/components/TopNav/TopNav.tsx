import Link from "next/link";
import Image from "next/image";
import logo1 from "public/whitebglogo2.png"

const TopNav = () => {
    return (
        <header className="flex flex-row bg-psublue sticky top-0 z-50 pl-6 md:pl-8 lg:pl-10 py-5">
            <Link href="/" className="">
                <div className='items-center'>
                    <Image
                        src={logo1}
                        alt="Logo"
                        height={"64"}
                    />
                </div>
            </Link>

            <div className="p-5 ml-auto text-white flex flex-row">
                <Link href={'/login'}>
                    <button className="px-5 rounded-md h-full w-full sm:min-w-max text-white hover:opacity-75 duration-100">Login</button>
                </Link>
                <Link href={'/calendar'}>
                    <button className="px-5 rounded-md h-full w-full sm:min-w-max text-white hover:opacity-75 duration-100">Calendar</button>
                </Link>
            </div>
        </header>
    );
}
// 
export default TopNav;