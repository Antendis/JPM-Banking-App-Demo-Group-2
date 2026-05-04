"use client";
import { useEffect, useState } from "react";

export function useDelayedLoading(loading: boolean, delay = 200) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!loading) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [loading, delay]);
  return show;
}
