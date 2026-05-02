const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(dir + '/' + file).isDirectory()
            ? walkSync(dir + '/' + file, filelist)
            : filelist.concat(dir + '/' + file);
    });
    return filelist;
}

const files = walkSync('./src').filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix Borders
    content = content.replace(/(?<!dark:)border-white\/5(?=[\s"'`])/g, 'border-black/5 dark:border-white/5');
    content = content.replace(/(?<!dark:)border-white\/10(?=[\s"'`])/g, 'border-black/10 dark:border-white/10');
    content = content.replace(/(?<!dark:)border-white\/20(?=[\s"'`])/g, 'border-black/20 dark:border-white/20');

    // Fix semi-transparent BGs meant for dark mode
    content = content.replace(/(?<!dark:)bg-white\/5(?=[\s"'`])/g, 'bg-black/5 dark:bg-white/5');
    content = content.replace(/(?<!dark:)bg-white\/10(?=[\s"'`])/g, 'bg-black/5 dark:bg-white/10');
    content = content.replace(/(?<!dark:)bg-black\/40(?=[\s"'`])/g, 'bg-slate-100 dark:bg-black/40');
    content = content.replace(/(?<!dark:)bg-black\/60(?=[\s"'`])/g, 'bg-slate-200 dark:bg-black/60');

    // Hover semi-transparent BGs
    content = content.replace(/(?<!dark:)hover:bg-white\/10(?=[\s"'`])/g, 'hover:bg-black/10 dark:hover:bg-white/10');
    content = content.replace(/(?<!dark:)hover:bg-white\/5(?=[\s"'`])/g, 'hover:bg-black/5 dark:hover:bg-white/5');

    // Hover Borders
    content = content.replace(/(?<!dark:)hover:border-white\/20(?=[\s"'`])/g, 'hover:border-black/20 dark:hover:border-white/20');
    content = content.replace(/(?<!dark:)hover:border-white\/30(?=[\s"'`])/g, 'hover:border-black/30 dark:hover:border-white/30');

    // Fix Secondary Texts (ignoring 500s usually works)
    content = content.replace(/(?<!dark:)text-slate-300(?=[\s"'`])/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/(?<!dark:)text-slate-400(?=[\s"'`])/g, 'text-slate-600 dark:text-slate-400');

    // Hover texts
    content = content.replace(/(?<!dark:)hover:text-white(?=[\s"'`])/g, 'hover:text-slate-900 dark:hover:text-white');

    // Residual `text-white` inside specific cards that were missed
    content = content.replace(/(?<!dark:)text-white(?=[\s"'`])/g, 'text-slate-900 dark:text-white');

    // Revert buttons to keep them white text
    const buttonFixes = [
        /bg-blue-[3-9]00(?:[^>]*)text-slate-900 dark:text-white/g,
        /bg-purple-[3-9]00(?:[^>]*)text-slate-900 dark:text-white/g,
        /bg-emerald-[3-9]00(?:[^>]*)text-slate-900 dark:text-white/g,
        /from-blue-[3-9]00(?:[^>]*)text-slate-900 dark:text-white/g,
        /bg-white(?:[^>]*)text-slate-900 dark:text-white/g, // if it's explicitly bg-white, text might need to be dark regardless, wait, leave bg-white alone.
    ];

    buttonFixes.forEach(r => {
        content = content.replace(r, (match) => match.replace('text-slate-900 dark:text-white', 'text-white'));
    });

    // Clean deduplications
    content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');
    content = content.replace(/(text-slate-\d00 dark:)text-slate-\d00 dark:/g, '$1');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Polished UI colors in ${file}`);
    }
});
