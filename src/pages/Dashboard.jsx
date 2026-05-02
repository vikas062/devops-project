import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../lib/api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { PlatformLogo } from "../components/PlatformLogo";
import { Button } from "../components/ui/button";
import { ActivityGraph } from "../components/ActivityGraph";
import { TopicRadar } from "../components/TopicRadar";
gsap.registerPlugin(ScrollTrigger);

const platformOrder = ["LeetCode", "GFG", "Codeforces", "HackerRank", "CodeChef", "SPOJ", "AtCoder"];

const solveToKey = (solve) => `${solve.canonicalQuestionId}_${solve.platform}`;

export const Dashboard = ({ isDemo = false }) => {
  const [questions, setQuestions] = useState([]);
  const [solves, setSolves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageRef = useRef(null);
  const qCardsRef = useRef([]);

  useEffect(() => {
    const load = async () => {
      if (isDemo) {
        try {
          // Fetch all real questions public endpoint
          const { data } = await api.get("/questions");
          setQuestions(data.questions);

          // Generate some fake solves for the demo experience
          if (data.questions.length > 0) {
            const fakeSolves = data.questions.slice(0, 3).flatMap(q => {
              // solving 1st platform for first 3 questions
              const p = q.platforms[0];
              return p ? [{
                canonicalQuestionId: q._id,
                platform: p.platform,
                verified: true
              }] : [];
            });
            setSolves(fakeSolves);
          } else {
            setSolves([]);
          }
        } catch (err) {
          setError("Failed to load demo data. Ensure backend is running.");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await api.get("/questions/with-solves");
        setQuestions(data.questions);
        setSolves(data.solves);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isDemo]);

  // GSAP: Animate cards when they come into viewport
  useEffect(() => {
    if (!loading && questions.length > 0 && pageRef.current) {
      const ctx = gsap.context(() => {

        // Redundancy Dashboard Panels Stagger
        if (document.querySelectorAll('.redundancy-panel').length > 0) {
          gsap.fromTo(
            ".redundancy-panel",
            { y: 50, opacity: 0, scale: 0.98 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              stagger: 0.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ".redundancy-panel",
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }

        // Canonical Library Cards Stagger
        if (qCardsRef.current.length > 0) {
          gsap.fromTo(
            qCardsRef.current.filter(Boolean),
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: ".q-container-trigger",
                start: "top 80%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      }, pageRef);

      return () => ctx.revert();
    }
  }, [loading, questions]);


  const solveMap = useMemo(() => {
    const map = new Map();
    solves.forEach((solve) => map.set(solveToKey(solve), solve));
    return map;
  }, [solves]);

  const { stats, masteredPatterns, redundantReps } = useMemo(() => {
    const total = questions.length;
    // Count unique canonical questions PLUS unique non-canonical questions
    const solvedCount = new Set(
      solves.map((solve) => {
        if (solve.canonicalQuestionId) return solve.canonicalQuestionId;
        // fallback to slug or title for non-canonical
        return `non_canonical_${solve.platform}_${solve.problemSlug || solve.questionTitle}`;
      })
    ).size;
    const coverage = total ? Math.round((solvedCount / total) * 100) : 0;

    // Calculate Streak
    const sortedSolves = [...solves].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let streak = 0;
    if (sortedSolves.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let current = new Date(sortedSolves[0].createdAt);
      current.setHours(0, 0, 0, 0);

      // if last solve was today or yesterday, streak is active
      const diffTime = Math.abs(today - current);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak = 1;

        // Re-doing simple streak logic:
        const dates = [...new Set(sortedSolves.map(s => new Date(s.createdAt).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);

        if (dates.length > 0) {
          const lastSolve = dates[0];
          const isActive = (today.getTime() - lastSolve) <= (86400000); // 24hrs (approx check)

          if (isActive || diffDays <= 1) { // consistent with above
            let tempStreak = 1;
            for (let i = 0; i < dates.length - 1; i++) {
              const prev = dates[i];
              const next = dates[i + 1];
              const dayDiff = (prev - next) / (1000 * 60 * 60 * 24);
              if (dayDiff === 1) {
                tempStreak++;
              } else {
                break;
              }
            }
            streak = tempStreak;
          } else {
            streak = 0;
          }
        }
      }
    }

    // Process Redundancy
    const solveGroups = {};
    solves.forEach(s => {
      if (!solveGroups[s.canonicalQuestionId]) solveGroups[s.canonicalQuestionId] = [];
      solveGroups[s.canonicalQuestionId].push(s);
    });

    const mastered = [];
    const redundant = [];

    questions.forEach(q => {
      const qSolves = solveGroups[q._id] || [];
      if (qSolves.length > 0) {
        mastered.push({
          id: q._id,
          title: q.canonicalTitle,
          topic: q.topic || [],
          platforms: [...new Set(qSolves.map(s => s.platform))]
        });
      }
      if (qSolves.length > 1) {
        redundant.push({
          id: q._id,
          title: q.canonicalTitle,
          topic: q.topic || [],
          count: qSolves.length,
          platforms: qSolves.map(s => s.platform) // preserve duplicates to show volume
        });
      }
    });

    return {
      stats: { total, solvedCount, coverage, streak },
      masteredPatterns: mastered,
      redundantReps: redundant
    };
  }, [questions, solves]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex items-center justify-center transition-colors duration-300">
        <div className="w-8 h-8 rounded-full border-t-2 border-l-2 border-purple-500 animate-spin blur-[1px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-rose-500 dark:text-rose-300">{error}</div>
    );
  }

  // Reset ref array on each render to prevent accumulation of stale DOM nodes
  qCardsRef.current = [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white overflow-hidden selection:bg-purple-500/30 transition-colors duration-300">
      <div ref={pageRef} className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-20 relative z-10">

        {/* Soft atmospheric background lights */}
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none opacity-40"></div>
        <div className="absolute bottom-1/4 right-0 w-[30rem] h-[30rem] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none opacity-30"></div>

        {/* Sync button and stats are now on Profile page */}
        <div className="grid gap-6 lg:grid-cols-2 mb-10 mt-10 relative z-10">
          <ActivityGraph />
          <TopicRadar questions={questions} solves={solves} />
        </div>
        {/* Navigation & Stats Header */}
        <div className="flex justify-between items-end mb-6 relative z-10 px-2 mt-8 md:mt-12">
          <h2 className="text-3xl font-medium tracking-tight text-slate-800 dark:text-white mb-0 text-neon-cyan drop-shadow-sm dark:drop-shadow-none">Progress Tracking</h2>
          <div className="flex gap-4">
            <Badge className="bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 px-4 py-1.5 text-sm backdrop-blur-md rounded-lg shadow-sm">
              Coverage {stats.coverage}%
            </Badge>
            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/30 px-4 py-1.5 text-sm backdrop-blur-md rounded-lg shadow-sm hidden md:inline-flex">
              Streak {stats.streak} 🔥
            </Badge>
          </div>
        </div>

        {/* 2-Column Redundancy Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10">
          {/* Left: Solved Patterns */}
          <Card className="glass-premium p-6 redundancy-panel flex flex-col h-[400px] border-slate-200 dark:border-cyan-500/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(6,182,212,0.05)] bg-white/80 dark:bg-black/40 backdrop-blur-xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_5px_#06b6d4] dark:shadow-[0_0_5px_#22d3ee]"></span>
                Solved Patterns
              </h3>
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-black">{masteredPatterns.length} / {stats.total}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {masteredPatterns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-500 text-sm">
                  <span className="text-3xl mb-3 opacity-30">📚</span>
                  <p>No patterns solved yet.</p>
                </div>
              ) : (
                masteredPatterns.map(pattern => (
                  <div key={pattern.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 hover:bg-white dark:hover:bg-black/40 transition-all flex justify-between items-center group cursor-default shadow-sm dark:shadow-sm drop-shadow-sm dark:drop-shadow-none backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{pattern.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-widest">{pattern.topic.join(", ")}</p>
                    </div>
                    <div className="flex gap-1.5 pl-4 border-l border-slate-200 dark:border-white/5">
                      {pattern.platforms.slice(0, 3).map((p, idx) => (
                        <PlatformLogo key={`${p}-${idx}`} platform={p} className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Right: Redundant Practices */}
          <Card className="glass-premium p-6 redundancy-panel flex flex-col h-[400px] border-slate-200 dark:border-purple-500/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden bg-white/80 dark:bg-black/40 backdrop-blur-xl transition-colors duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 dark:bg-purple-600/10 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-white/10 relative z-10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 shadow-[0_0_5px_#a855f7] dark:shadow-[0_0_5px_#c084fc]"></span>
                Redundant Reps
              </h3>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-bold">{redundantReps.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar relative z-10">
              {redundantReps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-500 text-sm">
                  <span className="text-3xl mb-3 opacity-30">🔁</span>
                  <p>No redundant practice recorded.</p>
                </div>
              ) : (
                redundantReps.map(rep => (
                  <div key={rep.id} className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-200 dark:border-white/5 hover:border-purple-500/40 dark:hover:border-purple-500/40 hover:bg-white dark:hover:bg-black/60 transition-all flex justify-between items-center group cursor-default shadow-sm dark:shadow-sm drop-shadow-sm dark:drop-shadow-none backdrop-blur-sm">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">{rep.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-widest truncate">{rep.topic.join(", ")}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-3 border-l border-slate-200 dark:border-white/10">
                      <span className="px-2 py-0.5 mb-1.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                        {rep.count} Solves
                      </span>
                      <div className="flex gap-1 justify-end">
                        {rep.platforms.slice(0, 3).map((p, idx) => (
                          <PlatformLogo key={`${p}-${idx}`} platform={p} className="w-3.5 h-3.5 opacity-60 group-hover:opacity-90 transition-opacity drop-shadow-sm dark:drop-shadow-none" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="mt-16 q-container-trigger relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-0 text-neon-cyan drop-shadow-sm dark:drop-shadow-none">Canonical Library</h2>
            <div className="h-px bg-gradient-to-r from-cyan-500/50 to-transparent flex-1 opacity-50"></div>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {questions.map((question, idx) => (
              <div key={question._id} ref={el => qCardsRef.current.push(el)}>
                <AccordionItem value={question._id} className="glass-premium group overflow-hidden border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-transparent data-[state=open]:border-cyan-500/50 dark:data-[state=open]:border-cyan-500/30 shadow-sm dark:shadow-none data-[state=open]:shadow-[0_0_15px_rgba(6,182,212,0.1)] dark:data-[state=open]:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-500 ease-out backdrop-blur-xl">
                  <AccordionTrigger className="hover:bg-slate-50 dark:hover:bg-white/[0.04] px-6 py-5 transition-colors focus:no-underline hover:no-underline">
                    <div className="text-left flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] font-bold text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">Q{String(idx + 1).padStart(2, '0')}</p>
                      <p className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white mt-1 group-data-[state=open]:text-cyan-600 dark:group-data-[state=open]:text-cyan-100 transition-colors">{question.canonicalTitle}</p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></span>
                        {question.topic.join(", ")}
                      </p>
                    </div>
                    <Badge variant="info" className="ml-auto mr-4 bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30 backdrop-blur-md">Match {question.overallMatch}%</Badge>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 mt-4">
                      {platformOrder.map((platform, j) => {
                        const entry = question.platforms.find((item) => item.platform === platform);
                        const solve = entry ? solveMap.get(`${question._id}_${platform}`) : null;
                        if (!entry) {
                          return (
                            <div key={platform} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 px-5 py-4 backdrop-blur-sm opacity-60">
                              <div className="flex items-center gap-4">
                                <PlatformLogo platform={platform} className="h-6 opacity-30 dark:opacity-50 grayscale" />
                                <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Not Available</span>
                              </div>
                              <div className="h-px bg-slate-200 dark:bg-white/5 flex-1 mx-4 hidden md:block"></div>
                              <Badge className="bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none font-medium shadow-none">Inactive</Badge>
                            </div>
                          );
                        }
                        return (
                          <div key={platform} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all duration-300 group/plat shadow-sm dark:shadow-inner">
                            <div className="flex items-center gap-4">
                              <PlatformLogo platform={platform} className="h-6 md:h-7 transition-transform group-hover/plat:scale-110 drop-shadow-sm dark:group-hover/plat:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                              <div>
                                <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-white tracking-wide">{entry.name}</p>
                                <a className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors flex items-center gap-1 mt-0.5" href={entry.link} target="_blank" rel="noreferrer">
                                  Open Platform <span className="transform transition-transform group-hover/plat:translate-x-1">→</span>
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 ml-auto">
                              <Badge variant="outline" className="border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-200 bg-cyan-50 dark:bg-transparent shadow-none dark:shadow-sm">Score {entry.score}%</Badge>
                              {solve ? (
                                <Badge className={solve.verified ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-none dark:shadow-sm" : "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 shadow-none dark:shadow-sm"}>
                                  {solve.verified ? "Verified" : "Self-marked"}
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 dark:bg-black/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shadow-none dark:shadow-sm">Unsolved</Badge>
                              )}
                              {!solve && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-slate-300 dark:border-white/10 hover:border-cyan-400 dark:hover:border-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-white transition-all shadow-none bg-white dark:bg-transparent"
                                  onClick={() => {
                                    api.post("/solve/manual", { canonicalQuestionId: question._id, platform, questionTitle: entry.name })
                                      .then((resp) => {
                                        if (resp.data.solve) {
                                          setSolves((prev) => [...prev.filter((s) => !(s.canonicalQuestionId === question._id && s.platform === platform)), resp.data.solve]);
                                        } else {
                                          console.error("Invalid response format:", resp.data);
                                        }
                                      })
                                      .catch((err) => {
                                        console.error("Failed to mark solve:", err);
                                        alert("Failed to mark solve: " + (err.response?.data?.message || err.message));
                                      });
                                  }}
                                >
                                  Mark
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
