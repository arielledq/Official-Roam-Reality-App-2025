import { useRef } from 'react';

/**
 * A custom hook to throttle a function.
 * @param {Function} func - The function to throttle.
 * @param {number} delay - The cooldown period in milliseconds.
 * @returns {Function} The throttled function.
 */
function useThrottle(func, delay) {
    // A ref to track the last time the function was called.
    const lastCallRef = useRef(0);

    // The throttled function returned by the hook
    const throttledFunc = (...args) => {
        const now = new Date().getTime();
        // Check if the cooldown period has passed
        if (now - lastCallRef.current >= delay) {
            // Execute the function
            func(...args);
            // Update the last call timestamp
            lastCallRef.current = now;
        }
    };

    return throttledFunc;
}

export default useThrottle;
