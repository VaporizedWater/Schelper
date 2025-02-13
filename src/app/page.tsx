'use client'

import React, { useState, useEffect } from "react";
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import logo from '../lib/icons';

const Home = () => {
    const [backgroundUrl, setBackgroundUrl] = useState("/wcispsu.jpg");

    useEffect(() => {
        const images = ["/wcispsu.jpg", "/NittanyLionShrine.jpg", "/PSU_Light_Dark.jpg"]; 
        let index = 0;

        const interval = setInterval(() => {
            index = (index + 1) % images.length;
            setBackgroundUrl(images[index]);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval); // Cleanup when unmounting
    }, []);

    return (
        <div className='flex flex-col'>
            <div className="bg-center bg-cover h-screen max-w-screen justify-items-center transition-all duration-500 ease-in-out" 
                style={{ backgroundImage: `url(${backgroundUrl})` }}>
                <div className='justify-items-center backdrop-blur-[1px]'>
                    <h1 className='text-lightblue mt-40 text-8xl text-center items-center flex flex-row font-bold rounded-full'>
                        <Image src={logo} height={55} alt="Schelper Icon" />
                        <p className='drop-shadow-2xl'>Schelper</p>
                    </h1>
                    <h2 className='pt-4 text-3xl text-graybg drop-shadow-lg'>The Class Scheduling App</h2>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
