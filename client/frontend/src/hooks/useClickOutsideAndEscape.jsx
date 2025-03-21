import { useEffect, useRef } from "react";

export function useClickOutsideAndEscape(callback) {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [callback]);

  return ref;
}
