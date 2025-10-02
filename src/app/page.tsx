"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import { ClockTower, DayCampus, LionShrine, AMIC, BridgeOverTrout, GlenhillFarmhouse, GlenhillRhody, LilleyLibrary, JunkerGym, LionMascotBench, LionMascotNumber1, LionShrineAerial, MaryBehrendMonument, SmithChapelSummer } from '../lib/icons';
import { useSession } from "next-auth/react"
import SignIn from "@/components/SignIn/SignIn";
import { MdCalendarMonth } from "react-icons/md";

const images = [LionShrine, AMIC, BridgeOverTrout, GlenhillFarmhouse, GlenhillRhody, LilleyLibrary, JunkerGym, LionMascotBench, LionMascotNumber1, LionShrineAerial, MaryBehrendMonument, SmithChapelSummer, DayCampus, ClockTower];

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
                setTopIsA((t) => !t);
                const next = images[idxRef.current % images.length];
                idxRef.current += 1;
                if (topIsA) setImgA(next);
                else setImgB(next);
                setOpacity(1);
            }, FADE_MS);
        };

        const timer = setInterval(run, HOLD_MS + FADE_MS); // hold → fade → hold → …
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topIsA]);

    // Background layer container (positioned and behind content)
    const Backgrounds = (
        <div className="absolute inset-0 -z-10">
            {/* top image */}
            <Image
                src={imgA}
                alt=""
                fill
                sizes="100vw"
                // First image prioritized for instant paint; subsequent swaps are cached
                priority
                fetchPriority="high"
                style={{ objectFit: "cover", opacity: topIsA ? opacity : 1 - opacity }}
                className="transition-opacity duration-[2500ms] ease-linear"
            />
            {/* next image */}
            <Image
                src={imgB}
                alt=""
                fill
                sizes="100vw"
                // Give the "next" layer a strong hint to load early too
                fetchPriority="high"
                loading="eager"
                style={{ objectFit: "cover", opacity: !topIsA ? opacity : 1 - opacity }}
                className="transition-opacity duration-[2500ms] ease-linear"
            />
        </div>
    );

    const loggedOut = useMemo(() => {
        return (
            <div className="flex flex-col h-screen">
                <div className="flex flex-col h-full w-full items-center justify-start text-center p-8">
                    <h1 className="text-lightblue p-4 rounded-lg w-fit text-shadow-lg text-8xl backdrop-blur-[1px] font-bold flex items-center justify-center gap-4">
                        Schelper
                    </h1>
                    <h2 className="pt-4 text-3xl text-shadow-lg text-graybg drop-shadow-lg">
                        The Class Scheduling App
                    </h2>
                    <p className="pt-4 text-xl text-shadow-lg text-graybg drop-shadow-lg">
                        Please log in to continue
                    </p>
                    <div className="mt-4">
                        <SignIn />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }, []);

    const loggedIn = useMemo(() => {
        return (
            <div className='flex flex-col h-screen'>
                <div className="flex flex-col h-full w-full items-center justify-start text-center p-8">
                    <h1 className="text-lightblue p-4 rounded-lg w-fit text-shadow-lg text-8xl backdrop-blur-[1px] font-bold flex items-center justify-center gap-4">
                        Schelper
                    </h1>
                    <h2 className="mt-4 text-4xl text-shadow-lg text-graybg drop-shadow-lg">
                        The Class Scheduling App
                    </h2>

                    {/* Main navigation options */}
                    <div className="mt-10 flex flex-col items-center justify-center">
                        <Link className="overflow-hidden" href="/calendar">
                            <button className="inline-flex gap-2 items-center px-6 py-3 rounded-lg bg-psublue/50 hover:bg-psublue/60 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/40 text-white font-semibold cursor-pointer transition transform duration-200">
                                <MdCalendarMonth className="h-7 w-7" />
                                Calendar
                            </button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }, []);

    return session?.user == undefined ? (
        <>
            {Backgrounds}
            {loggedOut}
        </>
    ) : (
        <>
            {Backgrounds}
            {loggedIn}
        </>
    );
};

export default Home;
