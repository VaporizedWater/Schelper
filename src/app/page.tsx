'use client'

import React from 'react';
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import logo from '../lib/icons';

const Home = () => (
    <div className='flex flex-col'>
        <div className="bg-center bg-cover bg-[url('../../public/wcispsu.jpg')] h-screen max-w-screen justify-items-center">
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

export default Home;
