"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Footer from '@/components/Footer/Footer';
import Link from "next/link";
import { ClockTower, DayCampus, LionShrine, NightCampus } from '../lib/icons';
import { useSession } from "next-auth/react"
import SignIn from "@/components/SignIn/SignIn";
import { MdCalendarMonth } from "react-icons/md";

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

    const loggedOut = useMemo(() => {
        return (
            <div className="flex flex-col h-screen">
                <div className="h-full w-full">
                    <div className='min-h-full min-w-full items-center text-center backdrop-blur-xs p-8'>
                        <h1 className='text-lightblue text-shadow-lg text-8xl font-bold flex items-center justify-center gap-4'>
                            Schelper
                        </h1>
                        <h2 className='pt-4 text-3xl text-shadow-lg text-graybg drop-shadow-lg'>The Class Scheduling App</h2>
                        <p className='pt-4 text-xl text-shadow-lg text-graybg drop-shadow-lg'>Please log in to continue</p>
                        <div className="mt-4">
                            <SignIn></SignIn>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }, []);

    const loggedIn = useMemo(() => {
        return (
            <div className='flex flex-col h-screen'>
                <div className="h-full w-full">
                    <div className='min-h-full min-w-full items-center text-center backdrop-blur-xs p-8'>
                        <h1 className='text-lightblue text-shadow-lg text-8xl font-bold flex items-center justify-center gap-4'>
                            Schelper
                        </h1>
                        <h2 className='pt-4 text-3xl text-graybg text-shadow-lg drop-shadow-lg'>The Class Scheduling App</h2>

                        {/* Main navigation options */}
                        <div className='mt-10 flex flex-col items-center justify-center'>
                            <Link className="overflow-hidden"
                                href='/calendar'>
                                <button className="inline-flex gap-2 items-center px-6 py-3 rounded-lg bg-psublue/50 hover:bg-psublue/60 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/40 text-white font-semibold cursor-pointer transition transform duration-200">
                                    <MdCalendarMonth className="h-7 w-7" />
                                    Calendar
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }, []);

    return (
        session?.user == undefined ?
            <>
                {currentBackground}
                {nextBackground}
                {loggedOut}
            </> : <>
                {currentBackground}
                {nextBackground}
                {loggedIn}
            </>
    );
};

export default Home;