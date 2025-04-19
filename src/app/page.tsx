'use client';

import React, { useState, useEffect, useRef } from "react";
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import Link from "next/link";
import { ClockTower, DayCampus, LionShrine, LogoIcon, NightCampus } from '../lib/icons';
import { useSession } from "next-auth/react"
import SignIn from "@/components/SignIn/SignIn";

const images = [LionShrine, DayCampus, NightCampus, ClockTower];

const FADE_MS = 2500;
const HOLD_MS = 5000;

const Home = () => {
    const { data: session } = useSession();

    const [topIsA, setTopIsA] = useState(true);
    const [imgA, setImgA] = useState(images[0]);
    const [imgB, setImgB] = useState(images[1]);
    const [opacity, setOpacity] = useState(1);
    const idxRef = useRef(2);

    useEffect(() => {
        const run = () => {
            setOpacity(0);
            setTimeout(() => {
                setTopIsA(t => !t);
                const next = images[idxRef.current % images.length];
                idxRef.current += 1;
                if (topIsA) setImgA(next); else setImgB(next);
                setOpacity(1);
            }, FADE_MS);
        };

        const timer = setInterval(run, HOLD_MS + FADE_MS); // hold → fade → hold → …
        return () => clearInterval(timer);
    }, [topIsA]);

    const currentBackground = (
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2500ms] ease-linear"
            style={{ backgroundImage: `url(${imgA.src})`, opacity: topIsA ? opacity : 1 - opacity, zIndex: topIsA ? -9 : -10 }}>
        </div>
    );
    const nextBackground = (
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2500ms] ease-linear"
            style={{ backgroundImage: `url(${imgB.src})`, opacity: !topIsA ? opacity : 1 - opacity, zIndex: !topIsA ? -9 : -10 }}>
        </div>
    );

    return (
        session?.user == undefined ?
            <>
                {currentBackground}
                {nextBackground}
                <div className="flex flex-col h-screen">
                    <div className="h-full w-full">
                        <div className='min-h-full min-w-full items-center text-center backdrop-blur-xs p-8'>
                            <h1 className='text-lightblue text-shadow-lg text-8xl font-bold flex items-center justify-center gap-4'>
                                <LogoIcon height="96" width="96" />
                                Schelper
                            </h1>
                            <h2 className='pt-4 text-3xl text-shadow-lg text-graybg drop-shadow-lg'>The Class Scheduling App</h2>
                            <p className='pt-4 text-xl text-shadow-lg text-graybg drop-shadow-lg'>Please log in to continue</p>
                            <div className="mt-4">
                                {/* <button onClick={async () => {
                                    await signIn("microsoft-entra-id");
                                }} className="p-2 border rounded-full bg-white">Log in</button> */}
                                <SignIn></SignIn>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
            :
            <>
                {currentBackground}
                {nextBackground}
                <div className='flex flex-col h-screen'>
                    <div className="h-full w-full">
                        <div className='min-h-full min-w-full items-center text-center backdrop-blur-xs p-8'>
                            <h1 className='text-lightblue text-shadow-lg text-8xl font-bold flex items-center justify-center gap-4'>
                                {/* <LogoIcon height="96" width="96" /> */}
                                Schelper
                            </h1>
                            <h2 className='pt-4 text-3xl text-graybg text-shadow-lg drop-shadow-lg'>The Class Scheduling App</h2>

                            {/* Main navigation options */}
                            <div className='mt-10 flex flex-col items-center justify-center drop-shadow-lg'>
                                <Link className="overflow-hidden"
                                    href='/calendar'>
                                    <Image
                                        src="/calendar1.png"
                                        alt="Edit Calendar"
                                        width={240}
                                        height={96}
                                        className="cursor-pointer transition rounded-t-lg"
                                    />
                                    <div className="w-full rounded-b-lg bg-lightblue2 bg-opacity-100 text-graybg text-lg font-semibold opacity-100">
                                        Edit Calendar
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
    );
};

export default Home;