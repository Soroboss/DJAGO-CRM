const fs = require('fs');
const files = [
  'src/views/DgDashboard.tsx',
  'src/views/ManagerDashboard.tsx',
  'src/views/CommercialDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add organization and industryConfig to useAuthStore
  content = content.replace(
    /const { user, logout, team, createTeammate } = useAuthStore\(\);/,
    "const { user, logout, team, createTeammate, organization, industryConfig } = useAuthStore();\n  const vocab = industryConfig?.vocabulary || { client: 'Client', clients: 'Clients', transaction: 'Transaction', transactions: 'Transactions', agent: 'Agent', agents: 'Agents' };\n  const modules = organization?.active_modules || industryConfig?.defaultModules || { sales: true, support: true, delivery: true, field_tracking: true, inventory: false };"
  );
  
  if (content.indexOf('organization, industryConfig') === -1) {
    content = content.replace(
      /const { user, logout, team } = useAuthStore\(\);/,
      "const { user, logout, team, organization, industryConfig } = useAuthStore();\n  const vocab = industryConfig?.vocabulary || { client: 'Client', clients: 'Clients', transaction: 'Transaction', transactions: 'Transactions', agent: 'Agent', agents: 'Agents' };\n  const modules = organization?.active_modules || industryConfig?.defaultModules || { sales: true, support: true, delivery: true, field_tracking: true, inventory: false };"
    );
  }

  // 2. Wrap buttons with module conditions
  // We need to be careful with exact string matches
  content = content.replace(
    /<button[^>]*onClick={\(\) => setActiveTab\('orders'\)}[\s\S]*?<\/button>/g,
    "{modules.delivery && ($&)}"
  );
  content = content.replace(
    /<button[^>]*onClick={\(\) => setActiveTab\('transactions'\)}[\s\S]*?<\/button>/g,
    "{modules.sales && ($&)}"
  );
  content = content.replace(
    /<button[^>]*onClick={\(\) => setActiveTab\('kanban'\)}[\s\S]*?<\/button>/g,
    "{modules.sales && ($&)}"
  );

  // Replace literal texts with vocabulary
  content = content.replace(/>Transactions Deals</g, ">{vocab.transactions}<");
  content = content.replace(/>Clients</g, ">{vocab.clients}<");
  content = content.replace(/>Waras Recrutés</g, ">{vocab.agents} Recrutés<");
  content = content.replace(/>Transactions \& Pipeline National</g, ">{vocab.transactions} & Pipeline National<");

  fs.writeFileSync(file, content);
  console.log(`Modified ${file}`);
});
