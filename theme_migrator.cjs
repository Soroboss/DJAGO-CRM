const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Global replacements
      const replacements = [
        [/bg-\[\#05070c\]/g, 'bg-slate-50'],
        [/bg-\[\#0a0f1c\]/g, 'bg-white'],
        [/bg-\[\#070b14\]/g, 'bg-white'],
        [/bg-\[\#090d16\]/g, 'bg-white'],
        [/text-slate-100/g, 'text-slate-900'],
        [/text-slate-200/g, 'text-slate-800'],
        [/text-slate-300/g, 'text-slate-700'],
        [/text-slate-400/g, 'text-slate-500'],
        [/text-slate-450/g, 'text-slate-500'],
        [/text-slate-500/g, 'text-slate-400'],
        [/border-slate-800/g, 'border-slate-200'],
        [/border-slate-700/g, 'border-slate-200'],
        [/border-slate-600/g, 'border-slate-300'],
        [/border-white\/\[0\.05\]/g, 'border-slate-200'],
        [/border-white\/10/g, 'border-slate-200'],
        [/border-white\/20/g, 'border-slate-300'],
        [/bg-slate-800\/80/g, 'bg-slate-100/80'],
        [/bg-slate-800\/50/g, 'bg-slate-100/50'],
        [/bg-slate-800/g, 'bg-slate-100'],
        [/bg-slate-900/g, 'bg-slate-50'],
        [/from-slate-900/g, 'from-white'],
        [/to-\[\#0a0f1c\]/g, 'to-slate-50'],
        [/to-\[\#05070c\]/g, 'to-slate-100'],
        [/via-\[\#05070c\]/g, 'via-slate-50'],
        [/text-slate-350/g, 'text-slate-600'],
        [/bg-white\/\[0\.02\]/g, 'bg-white'],
        [/bg-white\/\[0\.04\]/g, 'bg-slate-50'],
        [/hover:bg-slate-800/g, 'hover:bg-slate-200'],
        [/hover:bg-slate-750/g, 'hover:bg-slate-200'],
        [/hover:bg-white\/\[0\.04\]/g, 'hover:bg-slate-50'],
        [/hover:border-slate-700/g, 'hover:border-slate-300'],
        [/text-white/g, 'text-slate-900'] // Risky but we will handle buttons
      ];

      for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
      }

      // Restore text-white in brand buttons (orange, emerald, blue, red)
      // We look for combinations where bg-brand-orange or bg-brand-emerald or bg-blue or bg-red or from-brand-orange is present in the same className string
      content = content.replace(/className="([^"]*)"/g, (match, classNames) => {
        if (classNames.includes('bg-brand-orange') || 
            classNames.includes('from-brand-orange') ||
            classNames.includes('bg-brand-emerald') ||
            classNames.includes('bg-blue-500') ||
            classNames.includes('bg-blue-600') ||
            classNames.includes('bg-red-500') ||
            classNames.includes('bg-red-600')) {
          return `className="${classNames.replace(/text-slate-900/g, 'text-white')}"`;
        }
        return match;
      });

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Migration complete');
