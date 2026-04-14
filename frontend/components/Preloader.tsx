"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register the useGSAP hook (good habit to avoid potential SSR warnings)
gsap.registerPlugin(useGSAP);

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide scrolling on the main page while the preloader is running
    document.body.style.overflow = "hidden";

    return () => {
      // Re-enable scrolling when the preloader unmounts
      document.body.style.overflow = "";
    };
  }, []);

  useGSAP(
    () => {
      // Create a single unified GSAP timeline
      const tl = gsap.timeline({
        onComplete: () => {
          // Phase 4: Cleanup
          // Completely unmount the preloader from the DOM
          setIsLoading(false);
        },
      });

      // Phase 1: Line Drawing (Duration: ~1.5s)
      // Note: Setting strokeDasharray to "100" and strokeDashoffset to "100" -> "0"
      // works seamlessly because we assigned `pathLength="100"` to the SVG lines!
      tl.fromTo(
        ".logo-line",
        { strokeDasharray: "100", strokeDashoffset: "100" },
        { strokeDashoffset: "0", duration: 1.5, ease: "power2.inOut" }
      );

      // Phase 2: The Exploding Core Reveal (Duration: ~1s)
      tl.to(
        "#logo-core",
        {
          scale: 150, // Scales large enough to cover the screen
          transformOrigin: "center center", // Perfect scaling from middle
          duration: 1,
          ease: "power2.inOut",
        },
        ">" // Start this immediately after Phase 1 completes
      );

      // Fade out the lines as the core explodes
      tl.to(
        ".logo-line",
        {
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        "<" // Trigger simultaneously with the core scaling
      );

      // Phase 3: The Fade Out (Duration: ~0.8s)
      // Fade out the entire white overlay background revealing the page
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.8,
          ease: "power2.easeIn",
        }
      );
    },
    { scope: containerRef }
  );

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
      // Prevent any interactions on the preloader from passing through
      style={{ pointerEvents: "auto" }}
    >
      {/* 
        CRITICAL: overflow="visible" is required on the SVG element so that when 
        the #logo-core expands to scale: 150, it is not artificially cropped by 
        the viewBox boundaries. It needs to bleed out and cover the full screen.
      */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-32 h-32 md:w-48 md:h-48 text-neutral-900"
        style={{ overflow: "visible" }}
      >
        {/* Placeholder lines (Will be drawn dynamically) 
            Providing `pathLength="100"` is a great trick to not need the DrawSVGPlugin.
            It forces the total length of the path to be 100 normalized units.
        */}
        <path
          className="logo-line"
          d="M 20 50 A 30 30 0 1 1 80 50 A 30 30 0 1 1 20 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          pathLength="100"
        />
        <path
          className="logo-line"
          d="M 50 20 L 50 80 M 20 50 L 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          pathLength="100"
        />

        {/* The Core Dot (This is exactly what explodes) */}
        <circle
          id="logo-core"
          cx="50"
          cy="50"
          r="8"
          fill="#F59E0B" // Tailwind amber-500
        />
      </svg>
    </div>
  );
}
