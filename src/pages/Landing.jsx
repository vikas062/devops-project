import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PlatformLogo } from "../components/PlatformLogo";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { VideoBackground } from "../components/VideoBackground";
import { AboutVideoCarousel } from "../components/AboutVideoCarousel";
import platformStackImg from "../assets/platform_stack_v2.png";

gsap.registerPlugin(ScrollTrigger);

const logos = ["LeetCode", "GFG", "Codeforces", "HackerRank", "CodeChef", "SPOJ", "AtCoder"];
const platformUrls = {
  LeetCode: "https://leetcode.com", GFG: "https://www.geeksforgeeks.org", Codeforces: "https://codeforces.com",
  HackerRank: "https://www.hackerrank.com", CodeChef: "https://www.codechef.com", SPOJ: "https://www.spoj.com", AtCoder: "https://atcoder.jp"
};

export const Landing = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Advanced setup for butter smooth GSAP animations using matchMedia
    let mm = gsap.matchMedia();

    mm.add(
      {
        // Define breakpoints
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },
      (context) => {
        let { isDesktop, isMobile, reduceMotion } = context.conditions;

        // Force 3D hardware acceleration for smoother renders
        gsap.defaults({ force3D: true, overwrite: "auto" });

        // --- 1. HERO ENTRANCE (Cinematic Stagger & Parallax) ---
        const heroEase = "expo.out"; // More cinematic sweep
        const heroDuration = reduceMotion ? 0 : (isMobile ? 1 : 2);

        const heroTimeline = gsap.timeline();
        heroTimeline.fromTo(".hero-badge", { y: -30, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: heroDuration, ease: heroEase })
          .fromTo(".hero-word",
            { y: isMobile ? 30 : 80, opacity: 0, scale: 1.2, rotationX: 90, filter: "blur(10px)" },
            { y: 0, opacity: 1, scale: 1, rotationX: 0, filter: "blur(0px)", duration: heroDuration * 0.8, stagger: 0.15, ease: "power4.out" }, "-=1.2")
          .fromTo(".hero-desc", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: heroDuration, ease: "expo.out" }, "-=1")
          .fromTo(".hero-actions", { y: 40, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: heroDuration, ease: "elastic.out(1, 0.5)" }, "-=1");

        if (isDesktop && !reduceMotion) {
          heroTimeline.fromTo(".hero-image",
            { scale: 0.8, opacity: 0, y: 150, rotationX: 20, transformPerspective: 1000 },
            { scale: 1, opacity: 1, y: 0, rotationX: 0, duration: 2, ease: "expo.out" },
            "-=1.5"
          );

          // Deep Parallax for Hero Elements
          gsap.to(".hero-image-wrapper", {
            yPercent: 20, // Reduced slightly from 30 for smoother feel
            ease: "none",
            scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1 } // Added scrub smoothing (1s catchup)
          });
          gsap.to(".hero-text-wrapper", {
            yPercent: -15,
            ease: "none",
            scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1 }
          });
        } else {
          // Mobile simple fade-in 
          gsap.fromTo(".hero-image", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 });
        }


        // --- 2. REDUNDANCY STACK (Explode on Scroll) ---
        gsap.fromTo(".redundancy-text *",
          { x: isMobile ? -20 : -50, opacity: 0, filter: "blur(5px)" },
          { x: 0, opacity: 1, filter: "blur(0px)", stagger: 0.15, duration: 1.5, ease: "power4.out", scrollTrigger: { trigger: ".redundancy-section", start: "top 75%", toggleActions: "play none none reverse" } }
        );

        if (isDesktop && !reduceMotion) {
          const stackTl = gsap.timeline({
            scrollTrigger: {
              trigger: ".redundancy-section",
              start: "top 60%",
              end: "top 10%",
              scrub: 1.5 // Buttery scrub
            }
          });
          // 3D Flip Stack Animation
          gsap.set(".mock-card-1", { transformPerspective: 1000, rotationY: -10, z: -50 });
          gsap.set(".mock-card-2", { transformPerspective: 1000, rotationY: -15, z: -100 });
          gsap.set(".mock-card-3", { transformPerspective: 1000, rotationY: -20, z: -150 });

          stackTl.to(".mock-card-1", { x: 30, y: 30, rotationZ: 5, rotationY: 0, z: 0, scale: 1.05, duration: 1, ease: "power2.out" }, 0);
          stackTl.to(".mock-card-2", { x: 100, y: 90, rotationZ: 12, rotationY: 0, z: 0, scale: 1.05, duration: 1, ease: "power2.out" }, 0);
          stackTl.to(".mock-card-3", { x: 170, y: 150, rotationZ: 18, rotationY: 0, z: 0, scale: 1.05, duration: 1, ease: "power2.out" }, 0);
        } else {
          gsap.set([".mock-card-1", ".mock-card-2", ".mock-card-3"], { x: 0, y: 0, rotation: 0 });
          gsap.fromTo([".mock-card-1", ".mock-card-2", ".mock-card-3"],
            { opacity: 0, y: 50, scale: 0.9 },
            { opacity: 1, y: (i) => i * 30, x: (i) => i * 20, rotation: (i) => i * 5, stagger: 0.2, duration: 1.2, ease: "back.out(1.2)", scrollTrigger: { trigger: ".redundancy-section", start: "top 80%" } })
        }


        // --- 3. PLATFORMS (Heavy Stagger) ---
        gsap.fromTo(".platform-logo",
          { y: 30, opacity: 0, scale: 0.8 },
          {
            y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: ".platforms-section", start: "top 85%", toggleActions: "play none none reverse" }
          }
        );


        // --- 4. FEATURES (Intense lift and clip-path reveal) ---
        gsap.fromTo(".features-section",
          { clipPath: "polygon(0% 10%, 100% 0%, 100% 90%, 0% 100%)", opacity: 0.5 },
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", opacity: 1, duration: 1.5, ease: "power3.inOut", scrollTrigger: { trigger: ".features-section", start: "top 85%" } }
        );

        gsap.fromTo(".feature-card",
          { y: isMobile ? 50 : 100, scale: 0.8, opacity: 0, rotationX: 15 },
          {
            y: 0, scale: 1, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.1, ease: "power4.out",
            clearProps: "transform", // Vital for CSS hovers
            scrollTrigger: { trigger: ".features-section", start: "top 60%", toggleActions: "play none none reverse" }
          }
        );

        // --- 5. HALL OF FAME (Infinite Loop & Dramatic Reveal) ---
        gsap.fromTo(".hof-left",
          { opacity: 0, x: -50, filter: "blur(5px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".hof-section", start: "top 65%" } }
        );

        if (isDesktop && !reduceMotion) {
          // Create a seamless vertical loop for the hof-cards using gsap ticker mechanism
          // The setup clones or just relies on the user to scroll down through the list, 
          // but here we just do a beautiful heavy stagger entrance.
          gsap.fromTo(".hof-card",
            { opacity: 0, y: 40, scale: 0.9, rotateX: 20 },
            { opacity: 1, y: 0, scale: 1, rotateX: 0, stagger: 0.15, duration: 1.5, ease: "elastic.out(1, 0.6)", scrollTrigger: { trigger: ".hof-section", start: "top 50%" } }
          );
        } else {
          gsap.fromTo(".hof-card", { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".hof-section", start: "top 60%" } });
        }


        // --- 6. CTA PULSE & RIPPLE ---
        if (!reduceMotion) {
          gsap.fromTo(".cta-pulse-bg",
            { scale: 0.8, opacity: 0.2 },
            { scale: 1.1, opacity: 0, duration: 3, repeat: -1, ease: "sine.out" }
          );
        }
        gsap.fromTo(".cta-content",
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: "expo.out", scrollTrigger: { trigger: ".cta-section", start: "top 85%", toggleActions: "play none none reverse" } }
        );


        // --- 7. ABOUT US (Pinned Scrub Sequence - CENTERED) ---
        if (isDesktop && !reduceMotion) {
          const aboutTl = gsap.timeline({
            scrollTrigger: {
              trigger: ".about-section",
              start: "top top",
              end: "+=1200", // Shorter pin so it doesn't overstay
              scrub: 1.5, // Silkier scrub
              pin: true,
            }
          });

          aboutTl.to(".about-col-left", { opacity: 0, y: -30, scale: 0.95, duration: 1 })
            .fromTo(".about-mission", { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.5 }, "-=0.2")
            .to(".about-mission", { opacity: 0, y: -40, scale: 1.05, duration: 1 }, "+=0.8")
            .fromTo(".about-team", { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.5 }, "-=0.2");
        } else {
          // Mobile: Staggered fade in without pinning
          gsap.fromTo(".about-col-left", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: ".about-section", start: "top 80%" } });
          gsap.fromTo(".about-mission", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, scrollTrigger: { trigger: ".about-section", start: "top 80%" } });
          gsap.fromTo(".about-team", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.6, scrollTrigger: { trigger: ".about-section", start: "top 80%" } });
        }
      }
    );

    return () => mm.revert(); // Ensure 100% clean up on unmount!
  }, []);

  return (
    <div ref={containerRef} className="bg-slate-50 dark:bg-[#040814] min-h-screen font-sans overflow-hidden text-slate-900 dark:text-slate-50 selection:bg-blue-500/30">

      {/* --- SECTION 1: HERO (FULL VIEWPORT) --- */}
      <section className="hero-section relative min-h-screen flex items-center justify-center pt-24 pb-32 px-6 z-10 perspective-1000">

        {/* NEW BACKGROUND VIDEO LAYER */}
        <VideoBackground />

        {/* Text Overlay for subtle surprises on Hero */}
        <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 tracking-[0.5em] text-[10px] text-white/20 uppercase font-black mix-blend-overlay pointer-events-none z-0">
          C-First Engine v1.0
        </div>
        <div className="hidden lg:block absolute right-4 top-1/2 translate-y-1/2 rotate-90 tracking-[0.5em] text-[10px] text-white/20 uppercase font-black mix-blend-overlay pointer-events-none z-0">
          Unify The Grind
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="hero-text-wrapper max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <Badge variant="info" className="hero-badge mb-8 backdrop-blur-md bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-300 px-5 py-2 text-xs uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(255,255,255,0.02)]">
              ✨ The Era of Redundancy ends now
            </Badge>
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] font-display text-slate-900 dark:text-white overflow-hidden flex flex-wrap gap-x-4 gap-y-1 justify-center lg:justify-start">
              {"Master DSA".split(" ").map((word, i) => <span key={i} className="hero-word inline-block drop-shadow-lg will-change-transform">{word}</span>)}
              <span className="hero-word inline-block bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(99,102,241,0.3)] flex-basis-full mt-2 will-change-transform">
                Everywhere.
              </span>
            </h1>
            <p className="hero-desc mt-8 text-lg sm:text-2xl text-slate-600 dark:text-slate-300/80 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              The ultimate <span className="font-semibold text-slate-900 dark:text-white">Canonical-First</span> progress engine. Solve on LeetCode. Sync to Codeforces. Crush your interviews.
            </p>
            <div className="hero-actions mt-10 md:mt-12 flex flex-wrap justify-center lg:justify-start gap-4 md:gap-5">
              <Button asChild size="lg" className="group relative h-14 md:h-16 w-full md:w-[220px] overflow-hidden rounded-full bg-white text-black border-none hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-500 ease-out">
                <Link to="/signup">
                  <span className="relative z-10 font-bold text-lg tracking-wide group-hover:tracking-widest transition-all duration-300">Enter the Matrix</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-14 md:h-16 w-full md:w-auto px-10 rounded-full text-lg border-black/20 dark:border-white/20 hover:bg-black/5 dark:bg-white/10 backdrop-blur-md transition-all text-slate-900 dark:text-white hover:border-black/40 dark:hover:border-white/40 hover:shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Link to="/demo">Watch Demo</Link>
              </Button>
            </div>
          </div>

          <div className="hero-image-wrapper relative perspective-1000 z-20 block mt-10 lg:mt-0">
            <div className="hero-image group relative will-change-transform">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-1000"></div>
              <Card className="relative overflow-hidden bg-white/70 dark:bg-navy-900/50 backdrop-blur-md border-black/10 dark:border-white/10 p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-xl transform transition-transform duration-1000 ease-out lg:hover:rotate-y-[-5deg] lg:hover:rotate-x-[5deg]">
                <div className="absolute right-4 top-4 z-10 rounded-full bg-slate-200 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Sync Active
                </div>
                <img
                  src={platformStackImg}
                  alt="Multi-platform compatibility dashboard"
                  className="w-full rounded-lg object-cover border border-black/10 dark:border-white/10 opacity-90 transition-opacity duration-700 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: REDUNDANCY SHOWCASE (EXPLODING STACK) --- */}
      <section className="redundancy-section py-24 md:py-40 px-6 max-w-7xl mx-auto relative z-20 border-t border-black/5 dark:border-white/5">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 md:gap-16 items-center">
          <div className="redundancy-text z-30 order-2 lg:order-1 text-center lg:text-left">
            <Badge className="mb-6 bg-rose-500/10 text-rose-400 border-none uppercase tracking-widest text-xs px-3 py-1 backdrop-blur-sm">The Core Philosophy</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              Why solve the same array problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">5 times?</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mb-8 mx-auto lg:mx-0">
              When you pass "Valid Parentheses" on LeetCode, DSA Compass instantly recognizes the underlying concept and marks the equivalent problems on HackerRank, GFG, and Codeforces as solved.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 text-slate-900 dark:text-white font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-max mx-auto lg:mx-0 px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-colors hover:bg-black/5 dark:bg-white/10 hover:border-black/20 dark:border-white/20">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              </span>
              Progress Synced Global
            </div>
          </div>

          <div className="relative h-[400px] md:h-[500px] w-full perspective-2000 flex items-center justify-center order-1 lg:order-2">
            {[
              { id: "mock-card-1", plat: "LeetCode", name: "20. Valid Parentheses", match: "100%", z: 30, color: "text-amber-400", bg: "bg-amber-500/10" },
              { id: "mock-card-2", plat: "HackerRank", name: "Balanced Brackets", match: "98%", z: 20, color: "text-green-400", bg: "bg-green-500/10" },
              { id: "mock-card-3", plat: "GFG", name: "Parenthesis Checker", match: "95%", z: 10, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            ].map((mock) => (
              <div
                key={mock.id}
                className={`${mock.id} absolute w-[90%] md:w-full max-w-sm md:max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-navy-900/95 backdrop-blur-2xl p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-blue-500/50 hover:bg-navy-800 hover:scale-[1.05] hover:z-50 hover:shadow-[0_0_60px_rgba(59,130,246,0.2)] cursor-pointer group will-change-transform`}
                style={{ zIndex: mock.z }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-4 items-center">
                    <PlatformLogo platform={mock.plat} className="h-6 md:h-8 transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base md:text-lg">{mock.plat}</span>
                  </div>
                  <Badge className={`${mock.bg} ${mock.color} border-none font-black px-2 py-1 md:px-3`}>{mock.match} Match</Badge>
                </div>
                <p className="text-slate-900 dark:text-white text-lg md:text-xl font-medium mb-2">{mock.name}</p>
                <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-6 font-mono">Status: <span className="text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)] dark:drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">Accepted</span></div>
                <div className="flex gap-3">
                  <span className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <span className="block h-full bg-emerald-500 w-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"></span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: PLATFORMS TEASER (Moved Up) --- */}
      <section className="platforms-section border-y border-black/5 dark:border-white/5 bg-white/[0.01] py-16 md:py-20 relative z-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs md:text-sm text-slate-500 mb-8 md:mb-12 uppercase tracking-[0.3em] font-bold">Unifying the Ecosystem</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-14 lg:gap-20">
            {logos.map((logo) => (
              <a
                key={logo}
                href={platformUrls[logo]}
                target="_blank"
                rel="noopener noreferrer"
                className="platform-logo opacity-0 transition-transform duration-500 hover:scale-125 focus:scale-125 outline-none"
              >
                <PlatformLogo platform={logo} className="h-8 md:h-12 opacity-70 hover:opacity-100 transition-all duration-300 drop-shadow-md hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 4: STATS & FEATURES (INTENSE HOVER) --- */}
      <section className="features-section py-24 md:py-32 relative z-20 bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.05)_0%,transparent_70%)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-24 md:mb-32">
            {[
              { value: 12, suffix: "K+", label: "Questions Mapped" },
              { value: 50, suffix: "K+", label: "Active Trackers" },
              { value: 7, suffix: "", label: "Platform Integrations" },
              { value: 100, suffix: "%", label: "Accuracy Rate" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2 md:gap-3 group text-center lg:text-left">
                <div className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 group-hover:from-blue-500 group-hover:to-purple-500 dark:group-hover:from-blue-300 dark:group-hover:to-purple-400 transition-all duration-700 ease-out sm:drop-shadow-[0_0_15px_rgba(0,0,0,0.05)] sm:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <AnimatedCounter target={stat.value} duration={2 + i * 0.2} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-[0.2em] group-hover:text-slate-800 dark:text-slate-200 transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 perspective-1000">
            {[
              {
                icon: "🧠",
                title: "Canonical Intelligence",
                desc: "Don't just track names. Our engine understands the DSA pattern and maps it universally to save your sanity."
              },
              {
                icon: "📊",
                title: "Deep Dive Analytics",
                desc: "From Radar charts to Activity Heatmaps, gaze upon your true multi-platform ranking in one gorgeous UI."
              },
              {
                icon: "🛡️",
                title: "Zero Private Scraping",
                desc: "Secure extension architecture that verifies DOM submissions without ever holding your passwords."
              }
            ].map((feature, i) => (
              <Card key={i} className="feature-card group relative border-black/5 dark:border-white/5 bg-white dark:bg-[#080d1a] p-8 md:p-10 transition-all duration-500 hover:-translate-y-4 hover:bg-[#0c1222] shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.2)] hover:border-blue-500/30 will-change-transform">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl"></div>
                <div className="relative z-10">
                  <div className="text-4xl md:text-5xl mb-6 md:mb-8 transform transition-transform duration-700 ease-out group-hover:scale-125 group-hover:rotate-[15deg] origin-left drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{feature.icon}</div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 tracking-tight group-hover:text-blue-200 transition-colors duration-300">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base md:text-lg font-light">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 5: HALL OF FAME (NEW 2-COLUMN LUXURY DESIGN) --- */}
      <section className="hof-section py-24 md:py-32 w-full relative border-y border-black/5 dark:border-white/5 bg-slate-100 dark:bg-black/40 overflow-hidden">
        {/* Abstract background glow matching the site's sleek blue/purple */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[1fr_450px] gap-12 lg:gap-20 items-center">

            {/* Left Column: Typography */}
            <div className="hof-left text-left">
              <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-slate-900 dark:text-white mb-2 leading-[1.1]">
                Hall of Fame
              </h2>
              <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-slate-900 dark:text-white mb-10 leading-[1.1]">
                Adored by the 1%
              </h2>

              <p className="text-lg md:text-xl text-slate-900 dark:text-slate-300/80 font-light max-w-xl mb-6 leading-relaxed">
                Welcome to the inner circle. This is where algorithmic legends are celebrated, with no gatekeepers in the way.
              </p>

              <p className="text-lg md:text-xl text-slate-900 dark:text-slate-300/80 font-light max-w-xl mb-12 leading-relaxed">
                Through real-time syncs, canonical mappings, and global leaderboards you can connect more deeply and directly with your progress here than anywhere else.
              </p>

              <button className="relative group px-10 py-4 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:bg-black/5 dark:bg-white/10 hover:border-blue-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
                <span className="relative z-10 text-slate-900 dark:text-white font-medium text-lg tracking-wide group-hover:text-blue-100 transition-colors">Enter the Hall</span>
              </button>
            </div>

            {/* Right Column: Glassmorphic List Panel */}
            <div className="bg-white/60 dark:bg-navy-900/40 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
              <h3 className="text-2xl font-medium text-slate-900 dark:text-white mb-6 pl-2">Hall of Fame</h3>

              <div className="flex flex-col gap-3">
                {[
                  { title: "Legendary Creator", subtitle: "Member since 2021", icon: "🌿", color: "from-amber-400 to-yellow-600" },
                  { title: "Elite Innovator", subtitle: "Member since 2022", icon: "🏆", color: "from-blue-300 to-cyan-500" },
                  { title: "Visionary Leader", subtitle: "Member since 2023", icon: "✨", color: "from-yellow-200 to-amber-400" },
                  { title: "Mastermind", subtitle: "Member since 2024", icon: "💎", color: "from-rose-400 to-pink-600" },
                  { title: "Pioneer", subtitle: "Member since 2025", icon: "🛡️", color: "from-sky-400 to-blue-600" },
                ].map((rank, i) => (
                  <div key={i} className="hof-card group relative flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-[#ffffff0a] border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 ease-out cursor-default shadow-sm hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_40px_-5px_rgba(59,130,246,0.2)] hover:z-10 will-change-transform">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${rank.color} bg-opacity-20 shadow-inner relative overflow-hidden flex-shrink-0`}>
                      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
                      <span className="relative z-10 drop-shadow-md">{rank.icon}</span>
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-slate-900 dark:text-white font-medium text-lg leading-tight tracking-wide group-hover:text-blue-600 dark:group-hover:text-purple-200 transition-colors duration-300">{rank.title}</h4>
                      <p className="text-slate-500 dark:text-white/50 text-sm mt-0.5 font-light">{rank.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION 6: MASSIVE CTA FOOTER --- */}
      <section className="cta-section relative py-32 md:py-48 flex flex-col items-center justify-center overflow-hidden border-b border-black/5 dark:border-white/5">
        <div className="absolute inset-0 bg-slate-100 dark:bg-[#02050c] z-0"></div>
        {/* Deep, rich, subtle ripple glow */}
        <div className="cta-pulse-bg absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0,transparent_50%)] z-0 mix-blend-screen opacity-50"></div>
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        <div className="cta-content text-center relative z-20 px-6 max-w-4xl mx-auto">
          <Badge className="bg-blue-900/40 text-blue-300 border-blue-500/20 mb-8 px-5 py-1.5 uppercase tracking-[0.3em] font-bold text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md">Start your journey</Badge>
          <h2 className="text-5xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white mb-6 md:mb-8 tracking-tighter leading-none">
            Ready to <br className="md:hidden" /><span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]">Transcend?</span>
          </h2>
          <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 mb-12 md:mb-16 font-light max-w-2xl mx-auto">
            Link your accounts once. Let the Canonical Progress Engine handle the rest in real-time.
          </p>
          <Button asChild size="lg" className="group relative h-16 md:h-20 px-10 md:px-16 text-lg md:text-2xl font-black bg-white text-black hover:bg-slate-100 rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_70px_rgba(255,255,255,0.6)] transition-all duration-500 hover:scale-110 active:scale-95">
            <Link to="/signup">
              <span className="relative z-10 flex items-center gap-3">
                Create Free Account
                <span className="transform transition-transform duration-500 group-hover:translate-x-3 text-blue-600 group-hover:text-purple-600">→</span>
              </span>
            </Link>
          </Button>
        </div>
      </section>

      {/* --- SECTION 7: ABOUT US (PINNED SCROLL & CENTERED) --- */}
      <section id="about" className="about-section min-h-[70vh] md:min-h-screen relative z-20 flex flex-col md:flex-row items-center justify-center overflow-hidden border-t border-black/5 dark:border-white/5">

        {/* NEW DYNAMIC VIDEO CAROUSEL LAYER */}
        <AboutVideoCarousel />

        <div className="max-w-4xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center py-24 md:py-0 md:h-[70vh] relative z-10">

          <div className="about-col-left flex flex-col items-center justify-center mb-10 md:mb-16">
            <Badge className="w-max mb-6 md:mb-8 bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-[0.3em] font-bold text-xs px-5 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.2)]">Who We Are</Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight drop-shadow-lg">
              We kill <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-600 drop-shadow-sm">Duplicate</span> Effort.
            </h2>
          </div>

          <div className="about-col-right relative h-auto md:h-[300px] w-full flex items-center justify-center min-h-[200px]">

            {/* Mission Text - scrolls away on desktop, shown sequentially on mobile */}
            <div className="about-mission md:absolute w-full max-w-3xl px-4 flex justify-center text-center md:mb-0 mb-10">
              <p className="text-xl md:text-3xl text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                Our mission is simple: To unify the fragmented world of competitive programming. We believe solving a core concept once means you've mastered it universally.
              </p>
            </div>

            {/* Team/Impact Text - scrolls in later on desktop, shown sequentially on mobile */}
            <div className="about-team md:absolute w-full max-w-3xl px-4 md:opacity-0 flex justify-center text-center">
              <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-[#0b1120] border border-black/5 dark:border-white/5 shadow-2xl flex flex-col items-center w-full group hover:border-black/10 dark:border-white/10 transition-colors duration-500">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tight">The Impact</h3>
                <p className="text-lg md:text-xl text-slate-400/90 mb-6 md:mb-8 font-light max-w-2xl">Built by elite coders for elite coders. By mapping the NeetCode 150 & Striver SDE sheet to 7 platforms, we save an average of 100+ hours of redundant problem-solving per user.</p>
                <div className="flex gap-4 items-center justify-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl md:text-5xl font-black text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]"><AnimatedCounter target={5000} duration={2} suffix="+" /></div>
                  <span className="text-xs md:text-sm uppercase tracking-[0.3em] text-slate-500 font-bold mt-1">Hours Saved</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-black/5 dark:border-white/5 bg-slate-100 dark:bg-[#02040a] pt-12 md:pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-300">DC</div>
            <span className="text-slate-900 dark:text-white font-black tracking-widest text-lg md:text-xl group-hover:text-blue-300 transition-colors">DSA COMPASS</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-900 dark:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-300">Twitter</a>
            <a href="#" className="hover:text-slate-900 dark:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-300">GitHub</a>
            <a href="#" className="hover:text-slate-900 dark:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-300">Privacy</a>
            <a href="#" className="hover:text-slate-900 dark:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-300">Terms</a>
          </div>
          <p className="text-xs md:text-sm text-slate-600 font-medium tracking-wide">© 2026 Canonical Progress Inc. Elite tooling.</p>
        </div>
      </footer>

    </div>
  );
};
