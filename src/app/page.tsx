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
                            <h1 className='text-lightblue text-8xl font-bold flex items-center justify-center gap-4'>
                                <LogoIcon height="96" width="96" />
                                Schelper
                            </h1>
                            <h2 className='pt-4 text-3xl text-graybg drop-shadow-lg'>The Class Scheduling App</h2>
                            <p className='pt-4 text-xl text-graybg drop-shadow-lg'>Please log in to continue</p>
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
                            <h1 className='text-lightblue text-8xl font-bold flex items-center justify-center gap-4'>
                                <LogoIcon height="96" width="96" />
                                Schelper
                            </h1>
                            <h2 className='pt-4 text-3xl text-graybg drop-shadow-lg'>The Class Scheduling App</h2>

                            {/* Main navigation options */}
                            <div className='mt-10 flex justify-center gap-6'>
                                <Link className="relative group overflow-hidden"
                                    href='/calendar'>
                                    <Image
                                        src="/calendar1.png"
                                        alt="Edit Calendar"
                                        width={160}
                                        height={64}
                                        className="cursor-pointer transition rounded-lg"
                                    />
                                    <span className="rounded-b-lg absolute bottom-0 left-0 right-0 flex items-center justify-center bg-lightblue2 bg-opacity-100 text-graybg text-lg font-semibold opacity-0 group-hover:opacity-100 transition duration-[16ms] cursor-pointer">
                                        Edit Calendar
                                    </span>
                                </Link>
                                <Link className="relative group"
                                    href='/tags'>
                                    <Image
                                        src="/tag.png"
                                        alt="Manage Tags"
                                        width={160}
                                        height={64}
                                        className="cursor-pointer transition rounded-lg"
                                    />
                                    <span className="rounded-b-lg absolute bottom-0 left-0 right-0 flex items-center justify-center bg-lightblue2 bg-opacity-100 text-graybg text-lg font-semibold opacity-0 group-hover:opacity-100 transition duration-[16ms] cursor-pointer">
                                        Manage Tags
                                    </span>
                                </Link>
                            </div>

                            {/* Cohort Filter Options */}
                            <div className="mt-10">
                                <h3 className="text-2xl text-graybg mb-4 drop-shadow-lg">View Calendar by Cohort</h3>
                                <div className="flex justify-center gap-4">
                                    {['freshman', 'sophomore', 'junior', 'senior'].map((cohort) => (
                                        <Link
                                            key={cohort}
                                            href={`/calendar?cohort=${cohort}`}
                                            className="px-6 py-3 bg-lightblue2 text-graybg rounded-lg hover:bg-blue-600 transition-colors capitalize font-semibold"
                                        >
                                            {cohort}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
    );
};

export default Home;