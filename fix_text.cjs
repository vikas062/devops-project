const fs = require('fs');
const path = require('path');

const files = ['./src/pages/Landing.jsx', './src/pages/Profile.jsx', './src/pages/Dashboard.jsx', './src/components/StatsDashboard.jsx', './src/components/SolvedDonut.jsx', './src/pages/Signup.jsx', './src/pages/Login.jsx'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace text-white in h1, h2, h3, h4, p, span, div, but NOT if it's inside a bg-blue, bg-emerald, bg-purple, etc.
    // Actually simpler: just replace `text-white` with `text-slate-900 dark:text-white` anywhere it matches "text-white"
    // THEN revert it for buttons, badges, and specifically colored backgrounds.

    content = content.replace(/(?<!dark:)text-white(?=[\s"'`])/g, 'text-slate-900 dark:text-white');

    // Reverts for specific components that should stay white in light mode:
    // Buttons with solid backgrounds
    const reverts = [
        /bg-blue-[0-9]{3}([^>]*)text-slate-900 dark:text-white/g,
        /bg-purple-[0-9]{3}([^>]*)text-slate-900 dark:text-white/g,
        /bg-emerald-[0-9]{3}([^>]*)text-slate-900 dark:text-white/g,
        /text-transparent([^>]*)text-slate-900 dark:text-white/g,
        /bg-black([^>]*)text-slate-900 dark:text-white/g,
        /from-blue-[0-9]{3}([^>]*)text-slate-900 dark:text-white/g
    ];

    reverts.forEach(r => {
        content = content.replace(r, (match) => match.replace('text-slate-900 dark:text-white', 'text-white'));
    });

    // Additional fixes for specific dark areas like the Background component fallback and cursor
    content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Updated text colors in ${file}`);
    }
});
