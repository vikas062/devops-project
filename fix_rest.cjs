const fs = require('fs');
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

    // Text colors
    content = content.replace(/(?<!dark:)text-slate-50(?=[\s"'`])/g, 'text-slate-900 dark:text-slate-50');
    content = content.replace(/(?<!dark:)text-slate-200(?=[\s"'`])/g, 'text-slate-800 dark:text-slate-200');
    content = content.replace(/(?<!dark:)text-slate-300(?=[\s"'`])/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/(?<!dark:)text-slate-400(?=[\s"'`])/g, 'text-slate-600 dark:text-slate-400');

    // Specific Backgrounds that might be missed
    content = content.replace(/(?<!dark:)bg-navy-900\/60(?=[\s"'`])/g, 'bg-white/80 dark:bg-navy-900/60');
    content = content.replace(/(?<!dark:)bg-\[\#1e1e1e\](?=[\s"'`])/g, 'bg-white dark:bg-[#1e1e1e]');
    content = content.replace(/(?<!dark:)bg-\[\#0f0f0f\](?=[\s"'`])/g, 'bg-slate-50 dark:bg-[#0f0f0f]');
    content = content.replace(/(?<!dark:)bg-navy-900\/50(?=[\s"'`])/g, 'bg-white/70 dark:bg-navy-900/50');
    content = content.replace(/(?<!dark:)bg-navy-900(?=[\s"'`])/g, 'bg-slate-50 dark:bg-navy-900');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Patched ${file}`);
    }
});
