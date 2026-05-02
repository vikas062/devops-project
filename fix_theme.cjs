const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
    });
    return filelist;
}

const files = walkSync('./src').filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

const replacements = {
    // Backgrounds
    'bg-\\[#0f0f0f\\]': 'bg-slate-50 dark:bg-[#0f0f0f]',
    'bg-\\[#1e1e1e\\]': 'bg-white dark:bg-[#1e1e1e]',
    'bg-\\[#040814\\]': 'bg-slate-50 dark:bg-[#040814]',
    'bg-\\[#080d1a\\]': 'bg-white dark:bg-[#080d1a]',
    'bg-\\[#0b1120\\]': 'bg-white dark:bg-[#0b1120]',
    'bg-\\[#02040a\\]': 'bg-slate-100 dark:bg-[#02040a]',
    'bg-\\[#02050c\\]': 'bg-slate-100 dark:bg-[#02050c]',
    'bg-\\[#2d2d2d\\]': 'bg-slate-200 dark:bg-[#2d2d2d]',
    'bg-\\[#252525\\]': 'bg-slate-100 dark:bg-[#252525]',
    'bg-\\[#0b101b\\]': 'bg-slate-100 dark:bg-[#0b101b]',
    'bg-\\[#333\\]': 'bg-slate-200 dark:bg-[#333]',
    // borders
    'border-\\[#333\\]': 'border-slate-200 dark:border-[#333]',
    'border-\\[#444\\]': 'border-slate-300 dark:border-[#444]',
    'border-white/5': 'border-black/5 dark:border-white/5',
    'border-white/10': 'border-black/10 dark:border-white/10',
    // texts
    'text-slate-200': 'text-slate-800 dark:text-slate-200',
    'text-slate-300': 'text-slate-700 dark:text-slate-300',
    'text-slate-400': 'text-slate-600 dark:text-slate-400',
    // Handling white text roughly: Only if it's exact text-white, and not part of another word
    // Wait, replacing text-white blindly is very dangerous, so let's skip it unless specific
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const [findRaw, replace] of Object.entries(replacements)) {
        // We use a RegExp that checks that 'dark:' is NOT immediately preceding our class
        // JavaScript RegExp lookbehinds are supported in modern Node
        const rule = new RegExp(`(?<!dark:)${findRaw}(?=[\\s"'\\\`])`, 'g');
        content = content.replace(rule, replace);
    }

    const navyRules = [
        { find: 'bg-navy-900/40', replace: 'bg-white/60 dark:bg-navy-900/40' },
        { find: 'bg-navy-900/50', replace: 'bg-white/70 dark:bg-navy-900/50' },
        { find: 'bg-navy-900/60', replace: 'bg-white/80 dark:bg-navy-900/60' },
        { find: 'bg-navy-900/95', replace: 'bg-white/95 dark:bg-navy-900/95' },
        { find: 'bg-navy-900', replace: 'bg-slate-100 dark:bg-navy-900' }
    ];

    for (const r of navyRules) {
        const rule = new RegExp(`(?<!dark:)${r.find}(?=[\\s"'\\\`])`, 'g');
        content = content.replace(rule, r.replace);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Updated theme classes in ${file}`);
    }
});
