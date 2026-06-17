const fs = require('fs');

const bgOrbs = `
      {/* Dynamic Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/20 blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-amber-200/20 blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>
`;

// CommercialDashboard
let comm = fs.readFileSync('src/views/CommercialDashboard.tsx', 'utf8');
comm = comm.replace(/<div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative pb-20 md:pb-0">/, '<div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col pb-20 md:pb-0 text-slate-900">\n' + bgOrbs);
comm = comm.replace(/<main className="flex-1 overflow-y-auto px-4 py-4 pb-24">/, '<main className="flex-1 flex flex-col m-2 md:m-4 bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 overflow-hidden"><div className="flex-1 overflow-y-auto px-4 py-4 pb-24">');
comm = comm.replace(/<\/main>/, '</div></main>');
fs.writeFileSync('src/views/CommercialDashboard.tsx', comm);

// SuperAdminDashboard
let sa = fs.readFileSync('src/views/SuperAdminDashboard.tsx', 'utf8');
sa = sa.replace(/<div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">/, '<div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col md:flex-row text-slate-900">\n' + bgOrbs);
sa = sa.replace(/<main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">/, '<main className="flex-1 flex flex-col m-4 md:ml-2 bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 overflow-hidden">');
sa = sa.replace(/<header className="h-20 border-b border-slate-200 bg-white\/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">/, '<header className="h-20 border-b border-white/60 bg-white/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 rounded-t-[2rem]">');
fs.writeFileSync('src/views/SuperAdminDashboard.tsx', sa);

console.log("Fixed wrapper layouts for remaining dashboards");
