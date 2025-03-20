'use client';

import React, { useState, useEffect } from "react";
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import logo from '../lib/icons';
import Link from "next/link";

const Home = () => {
    const images = ["/wcispsu.jpg", "/NittanyLionShrine.jpg", "/PSU_Light_Dark.jpg"];
    const [currentImage, setCurrentImage] = useState(images[0]);
    const [nextImage, setNextImage] = useState(images[1]);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        let index = 0;
        const cycleImages = () => {
            setNextImage(images[(index + 1) % images.length]);
            setOpacity(0);

            setTimeout(() => {
                setCurrentImage(images[(index + 1) % images.length]);
                setOpacity(1);
                index = (index + 1) % images.length;
            }, 5000);
        };

        const interval = setInterval(cycleImages, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='flex flex-col h-screen'>
            <div className="h-full w-full">
                {/* Current image */}
                <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-5000 ease-in"
                     style={{ backgroundImage: `url(${currentImage})`, opacity }}>
                </div>
                {/* Next image */}
                <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-5000 ease-in"
                     style={{ backgroundImage: `url(${nextImage})`, opacity: 1 - opacity }}>
                </div>
                <div className='min-h-full min-w-full items-center text-center backdrop-blur-xs p-8'>
                    <h1 className='text-lightblue text-8xl font-bold flex items-center justify-center gap-4'>
                        <Image src={logo} height={55} alt="Schelper Icon" />
                        Schelper
                    </h1>
                    <h2 className='pt-4 text-3xl text-graybg drop-shadow-lg'>The Class Scheduling App</h2>
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
                            <span className="rounded-b-lg absolute bottom-0 left-0 right-0 flex items-center justify-center bg-lightblue2 bg-opacity-100 text-graybg text-lg font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer">
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
                            <span className="rounded-b-lg absolute bottom-0 left-0 right-0 flex items-center justify-center bg-lightblue2 bg-opacity-100 text-graybg text-lg font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                Manage Tags
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
