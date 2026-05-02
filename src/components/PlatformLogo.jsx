import leetcode from "../assets/logos/leetcode.svg";
import gfg from "../assets/logos/gfg.svg";
import codeforces from "../assets/logos/codeforces.svg";
import hackerrank from "../assets/logos/hackerrank.svg";
import codechef from "../assets/logos/codechef.svg";
import spoj from "../assets/logos/spoj.svg";
import atcoder from "../assets/logos/atcoder.svg";
import hackerearth from "../assets/logos/hackerearth.svg";

const logos = {
  LeetCode: leetcode,
  GFG: gfg,
  Codeforces: codeforces,
  HackerRank: hackerrank,
  CodeChef: codechef,
  SPOJ: spoj,
  AtCoder: atcoder,
  HackerEarth: hackerearth
};

const logoMap = Object.keys(logos).reduce((acc, key) => {
  acc[key.toLowerCase()] = logos[key];
  return acc;
}, {});

export const PlatformLogo = ({ platform, className }) => {
  if (!platform) return null;
  const src = logoMap[platform.toLowerCase()];
  if (!src) return null;
  return <img src={src} alt={`${platform} logo`} className={className || "h-6"} />;
};
