import { useEffect, useReducer, useRef, useState } from "react"


export const useDebounceHook= <T>(value:T,delay:number) : T => {
  const [debounceVal, setdebounceVal] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
        setdebounceVal(value)
    }, delay);

    return () => clearTimeout(handler)
  }, [value,delay])
  

  return debounceVal
}

export const useThrottling = <T>(value:T,delay:number) : T =>{
    const [throttledVal, setThrottledVal] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLast = now - lastExecuted.current;

    if (timeSinceLast >= delay) {
      setThrottledVal(value);
      lastExecuted.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledVal(value);
        lastExecuted.current = Date.now();
      }, delay - timeSinceLast);

      return () => clearTimeout(timeoutId); // clear if value changes too quickly
    }
    }, [delay,value])
    

    return throttledVal

}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useFetchHook = <T>(url:string):UseFetchResult<T> =>{
    const [data, setdata] = useState<T | null>(null)
    const [loading, setloading] = useState<boolean>(false)
    const [error, seterror] = useState<string | null>(null)

    

    return {
        data,loading,error
    }
}