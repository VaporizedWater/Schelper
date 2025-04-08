'use client';

import React, { useState, useEffect } from "react";
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import Link from "next/link";
import { signIn } from "next-auth/react"
import { ClockTower, DayCampus, LionShrine, LogoIcon, NightCampus } from '../lib/icons';
import { useSession } from "next-auth/react"
import SignIn from "@/components/SignIn/SignIn";

const Home = () => {
    const { data: session } = useSession();

    const images = [LionShrine, DayCampus, NightCampus, ClockTower];
    const [currentImage, setCurrentImage] = useState(images[0]);
    const [nextImage, setNextImage] = useState(images[1]);
    const [opacity, setOpacity] = useState(1);
    const [index, setIndex] = useState(0);

    const currentBackground = (
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-2500 ease-linear"
            style={{ backgroundImage: `url(${currentImage.src})`, opacity }}>
        </div>
    );
    const nextBackground = (
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-2500 ease-linear"
            style={{ backgroundImage: `url(${nextImage.src})`, opacity: 1 - opacity }}>
        </div>
    );

    useEffect(() => {
        const cycleImages = () => {
            const nextIdx = (index + 1) % images.length;
            setNextImage(images[nextIdx]);
            setOpacity(0);

            // After the duration, swap images and reset opacity
            setTimeout(() => {
                setCurrentImage(nextImage);
                setIndex(nextIdx);
                setOpacity(1);
            }, 2500);
        };

        const interval = setInterval(cycleImages, 3000); // Increase interval to wait for full transition
        return () => clearInterval(interval);
    });

    return (
        session?.user == undefined ?
            <>
                <div className="flex flex-col h-screen">
                    <div className="h-full w-full">
                        {currentBackground}
                        {nextBackground}
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
            <div className='flex flex-col h-screen'>
                <div className="h-full w-full">
                    {currentBackground}
                    {nextBackground}
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
    );
};

export default Home;