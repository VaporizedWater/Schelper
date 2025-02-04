import { useState, useEffect } from "react";

const useLocalStorage = <T>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null ? (JSON.parse(storedValue) as T) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    const clearValue = () => {
        localStorage.removeItem(key);
        setValue(initialValue);
    };

    return [value, setValue, clearValue] as const;
};

export default useLocalStorage;
