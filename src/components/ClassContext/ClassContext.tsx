import { createContext, ReactNode, use, useContext, useState } from 'react';
import { CombinedClass } from '@/lib/types';

interface ClassContextType {
    currClass: CombinedClass | undefined;
    updateClass: (newClass: CombinedClass) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
    children: ReactNode;
}

export const ClassProvider = ({ children }: ClassProviderProps) => {
    const [currClass, setClass] = useState<CombinedClass>();

    const updateClass = (newClass: CombinedClass) => {
        setClass(newClass);
    }

    return (
        <ClassContext.Provider value={{ currClass, updateClass }} >
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

