import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const AnimatedCounter = ({ target, duration = 2, delay = 0, suffix = "", prefix = "", className = "" }) => {
    const counterRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!counterRef.current || hasAnimated.current || target === undefined || target === null) return;

        const obj = { val: 0 };

        const ctx = gsap.context(() => {
            gsap.to(obj, {
                val: target,
                duration: duration,
                delay: delay,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: counterRef.current,
                    start: "top 85%",
                    onEnter: () => {
                        hasAnimated.current = true;
                    },
                    once: true
                },
                onUpdate: () => {
                    if (counterRef.current) {
                        counterRef.current.innerHTML = Math.round(obj.val);
                    }
                }
            });
        }, counterRef);

        return () => ctx.revert();
    }, [target, duration, delay]);

    return (
        <span className={className}>
            {prefix}
            <span ref={counterRef}>0</span>
            {suffix}
        </span>
    );
};
