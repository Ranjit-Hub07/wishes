"use client";

import { useEffect, useState, useRef } from "react";

export default function TypewriterLetter({ text }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);
  const typedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !typedRef.current) {
            typedRef.current = true;
            setIsTyping(true);
            let index = 0;
            let currentText = "";
            const interval = setInterval(() => {
              if (index < text.length) {
                currentText += text.charAt(index);
                setDisplayedText(currentText);
                index++;
              } else {
                clearInterval(interval);
                setIsTyping(false);
              }
            }, 30);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [text]);

  return (
    <p
      ref={containerRef}
      className={`font-body-lg text-body-lg text-on-surface-variant italic leading-relaxed ${
        isTyping ? "typewriter-cursor" : ""
      }`}
    >
      {displayedText}
    </p>
  );
}
