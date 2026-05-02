import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export const PublicProfile = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/users/${username}`);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    };
    load();
  }, [username]);

  const solvedPlatforms = useMemo(() => {
    if (!data) return [];
    return data.solves.map((solve) => solve.platform);
  }, [data]);

  if (error) {
    return <div className="mx-auto max-w-5xl px-6 py-20 text-rose-300">{error}</div>;
  }

  if (!data) {
    return <div className="mx-auto max-w-5xl px-6 py-20 text-slate-700 dark:text-slate-300">Loading profile...</div>;
  }

  const { user, stats } = data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-hover gradient-border">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400">Public profile</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{user.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">@{user.username}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-600 dark:text-slate-400">Solved</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.solvedCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-600 dark:text-slate-400">Coverage</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.coverage}%</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {solvedPlatforms.length === 0 ? (
              <Badge>No solves yet</Badge>
            ) : (
              solvedPlatforms.map((platform, idx) => (
                <Badge key={`${platform}-${idx}`} variant="info">{platform}</Badge>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
