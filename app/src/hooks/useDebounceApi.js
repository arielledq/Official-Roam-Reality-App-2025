import { useEffect, useRef } from 'react';

/**
 * A custom hook to debounce a function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function useDebounceApi(func, delay) {
    // A ref to store the timer ID
    const timeoutRef = useRef(null);

    // The debounced function returned by the hook
    const debouncedFunc = (...args) => {
        // Clear any previous timer
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timer to call the function after the delay
        timeoutRef.current = setTimeout(() => {
            func(...args);
        }, delay);
    };

    // Cleanup effect to clear the timer when the component unmounts
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedFunc;
}

export default useDebounceApi;
