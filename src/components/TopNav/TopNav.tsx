import Link from "next/link";
import Image from "next/image";
import logo1 from "public/whitebglogo2.png"

const TopNav = () => {
    return (
        <header className="flex flex-row bg-psublue sticky top-0 z-50 pl-6 md:pl-8 lg:pl-10">
            <Link href="/" className="">
                <div className='py-2'>
                    <Image
                        src={logo1}
                        alt="Logo"
                        height={"40"}
                    />
                </div>
            </Link>

            <div className="p-4 ml-auto text-white flex flex-row">
                {/* <Link href={'/login'}>
                    <button className="px-5 rounded-md h-full w-full sm:min-w-max text-white hover:opacity-75 duration-100">Login</button>
                </Link> */}
                <Link href={'/calendar'}>
                    <button className="px-5 rounded-md h-full w-full sm:min-w-max text-white hover:opacity-75 duration-100">Calendar</button>
                </Link>
            </div>
        </header>
    );
}
// 
export default TopNav;