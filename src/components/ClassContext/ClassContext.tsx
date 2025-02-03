import { createContext, ReactNode, use, useContext, useState } from 'react';
import { CombinedClass } from '@/lib/types';

interface ClassContextType {
    currCombinedClass: CombinedClass | undefined;
    updateClass: (newCombinedClass: CombinedClass) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
    children: ReactNode;
}

export const ClassProvider = ({ children }: ClassProviderProps) => {
    const [currCombinedClass, setCombinedClass] = useState<CombinedClass>();

    const updateClass = (newClass: CombinedClass) => {
        setCombinedClass(newClass);
    }

    console.log(currCombinedClass + "HEHEHEHHEHE");

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

