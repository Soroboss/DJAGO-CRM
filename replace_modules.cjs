const fs = require('fs');

function replaceBlock(content, startMarker, endMarkerRegex, replacement) {
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) return content;
  
  // Find the closing brace of the block. We use regex or a simple stack for JSX
  const substr = content.substring(startIndex);
  // We'll just replace everything from start marker up to "        {/* Tab: Kanban */}" or similar
  const match = substr.match(endMarkerRegex);
  if (match) {
    const endIndex = startIndex + match.index;
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    return before + replacement + "\n\n" + after;
  }
  return content;
}

// DgDashboard
let dg = fs.readFileSync('src/views/DgDashboard.tsx', 'utf8');

// Add imports
if (!dg.includes('FormGeneratorModule')) {
  dg = dg.replace("import { Skeleton } from '../components/Skeleton';", "import { Skeleton } from '../components/Skeleton';\nimport { FormGeneratorModule } from '../components/FormGeneratorModule';\nimport { KanbanModule } from '../components/KanbanModule';\nimport { ActivityFeedModule } from '../components/ActivityFeedModule';");
}

dg = replaceBlock(
  dg, 
  "{/* Tab: Form Generator */}", 
  /\{\/\* Tab: Kanban \*\/\}/, 
  `        {/* Tab: Form Generator */}
        {activeTab === 'forms' && <FormGeneratorModule />}`
);

dg = replaceBlock(
  dg, 
  "{/* Tab: Kanban */}", 
  /\{\/\* Tab: Feed \*\/\}/, 
  `        {/* Tab: Kanban */}
        {activeTab === 'kanban' && <KanbanModule />}`
);

dg = replaceBlock(
  dg, 
  "{/* Tab: Feed */}", 
  /\{\/\* Tab: Admin \*\/\}/, 
  `        {/* Tab: Feed */}
        {activeTab === 'feed' && <ActivityFeedModule scope="global" />}`
);

fs.writeFileSync('src/views/DgDashboard.tsx', dg);

// ManagerDashboard
let mgr = fs.readFileSync('src/views/ManagerDashboard.tsx', 'utf8');

if (!mgr.includes('KanbanModule')) {
  mgr = mgr.replace("import { NetworkBadge } from '../components/NetworkBadge';", "import { NetworkBadge } from '../components/NetworkBadge';\nimport { KanbanModule } from '../components/KanbanModule';\nimport { ActivityFeedModule } from '../components/ActivityFeedModule';");
}

mgr = replaceBlock(
  mgr, 
  "{/* Tab: Kanban */}", 
  /\{\/\* Tab: Feed \*\/\}/, 
  `        {/* Tab: Kanban */}
        {activeTab === 'kanban' && <KanbanModule filteredClients={teamClients} />}`
);

mgr = replaceBlock(
  mgr, 
  "{/* Tab: Feed */}", 
  /\{\/\* Tab: Reassign \*\/\}/, 
  `        {/* Tab: Feed */}
        {activeTab === 'feed' && <ActivityFeedModule scope="zone" zoneId={user?.zone} />}`
);

fs.writeFileSync('src/views/ManagerDashboard.tsx', mgr);

console.log("Replaced modules in DgDashboard and ManagerDashboard.");
