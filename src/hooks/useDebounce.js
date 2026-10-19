import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any fast-changing value.
 * Commonly used for search inputs to prevent excessive API calls or calculations.
 *
 * @param {any} value - The input value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 400ms)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel the timer if value or delay changes before the timer fires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
