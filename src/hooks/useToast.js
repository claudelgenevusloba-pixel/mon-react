import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(duration = 3500) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const clearToast = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      setToast({ message, type });
      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, duration);
    },
    [duration]
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return { toast, showToast, clearToast };
}
