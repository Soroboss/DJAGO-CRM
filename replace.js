const fs = require('fs');
const files = [
  'src/views/ManagerDashboard.tsx',
  'src/views/CommercialDashboard.tsx',
  'src/views/SuperAdminDashboard.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace layout wrappers
    content = content.replace(/className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row"/g, 'className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col md:flex-row text-slate-900"');
    
    // Replace desktop sidebars
    content = content.replace(/className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200\/60 p-6 h-screen sticky top-0 justify-between shrink-0"/g, 'className="hidden md:flex flex-col w-64 glass-sidebar m-4 mr-2 rounded-[2rem] p-6 h-[calc(100vh-2rem)] sticky top-4 justify-between shrink-0 shadow-2xl relative z-20"');
    
    // Replace main areas
    content = content.replace(/className="flex-1 overflow-y-auto px-6 py-8 md:py-10 max-w-7xl mx-auto w-full"/g, 'className="flex-1 flex flex-col m-4 md:ml-2 bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 overflow-hidden"><div className="flex-1 overflow-y-auto px-6 py-8 md:py-10 max-w-7xl mx-auto w-full"');
    
    // Fix closing tags for main
    content = content.replace(/<\/main>/g, '</div></main>');

    // Replace basic cards with glass cards
    content = content.replace(/bg-white\/45 border border-slate-200/g, 'glass-card border border-white/40 shadow-xl backdrop-blur-md');
    content = content.replace(/p-5 rounded-2xl bg-white\/45/g, 'p-6 rounded-[2rem] glass-card glass-panel-hover');
    content = content.replace(/p-6 rounded-2xl bg-white/g, 'p-6 rounded-[2rem] glass-card');
    content = content.replace(/p-4 rounded-xl bg-white/g, 'p-4 rounded-[1.5rem] glass-card');
    
    // Replace modals to be premium
    content = content.replace(/bg-white\/80 backdrop-blur-sm z-50/g, 'bg-slate-900/40 backdrop-blur-xl z-50');
    content = content.replace(/w-full max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xl/g, 'w-full max-w-md bg-white/95 border border-white rounded-[2rem] p-6 shadow-[0_20px_60px_rgb(0,0,0,0.15)]');
    content = content.replace(/w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-2xl/g, 'w-full max-w-3xl bg-white/95 border border-white rounded-[2rem] p-8 shadow-[0_20px_60px_rgb(0,0,0,0.15)]');

    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log("Done replacing classes for glassmorphism.");
