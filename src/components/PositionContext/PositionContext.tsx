import React, { createContext, useState, ReactNode, useContext } from 'react';


interface Position {
    x: number;
    y: number;
}


interface PositionContextType {
    positions: { [key: string]: Position };
    updatePosition: (id: string, position: Position) => void;
}


const PositionContext = createContext<PositionContextType | undefined>(undefined);


interface PositionProviderProps {
    children: ReactNode;
}

export const PositionProvider: React.FC<PositionProviderProps> = ({ children }) => {
    const [positions, setPositions] = useState<{ [key: string]: Position }>({});


    const updatePosition = (id: string, position: Position) => {
        setPositions(prevPositions => ({
            ...prevPositions,
            [id]: position
        }));
    };

    return (
        <PositionContext.Provider value={{ positions, updatePosition }}>
            {children}
        </PositionContext.Provider>
    );
};


export function usePositionContext() {
    const context = useContext(PositionContext);
    if (context === undefined) {
        throw new Error('usePositionContext must be used within a PositionProvider');
    }
    return context;
}