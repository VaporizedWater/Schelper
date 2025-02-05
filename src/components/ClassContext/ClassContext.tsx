"use client"

import { createContext, ReactNode, useContext, useState } from 'react';
import { CombinedClass } from '@/lib/types';

interface ClassContextType {
    currCombinedClass: CombinedClass | undefined;
    updateClass: (newCombinedClass: CombinedClass) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
    children: ReactNode;
}

const days: { [key: string]: string } = {
    Mon: '2025-01-06',
    Tues: '2025-01-07',
    Wed: '2025-01-08',
    Thurs: '2025-01-09',
    Fri: '2025-01-10',
};



export const ClassProvider = ({ children }: ClassProviderProps) => {
    const [currCombinedClass, setCombinedClass] = useState<CombinedClass>();

    const updateClass = (newClass: CombinedClass) => {
        // Create the event object
        const convertedDay = days[newClass.classProperties.days[0]];
        const dateStringStart = convertedDay + 'T' + newClass.classProperties.start_time;
        const dateStringEnd = convertedDay + 'T' + newClass.classProperties.end_time;
        setCombinedClass(newClass);
    }

    return (
        <ClassContext.Provider value={{ currCombinedClass, updateClass }} >
            {children}
        </ClassContext.Provider>
    );
}

export const useClassContext = () => {
    const context = useContext(ClassContext);
    if (context === undefined) {
        throw new Error('useClassContext must be used within a ClassProvider');
    }
    return context;
}

