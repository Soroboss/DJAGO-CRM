const fs = require('fs');
const files = [
  'src/views/DgDashboard.tsx',
  'src/views/ManagerDashboard.tsx',
  'src/views/CommercialDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add the vocab and modules variables
  if (content.includes('const { user, logout, team, createTeammate } = useAuthStore();')) {
    content = content.replace(
      'const { user, logout, team, createTeammate } = useAuthStore();',
      'const { user, logout, team, createTeammate, organization, industryConfig } = useAuthStore();\n  const vocab = industryConfig?.vocabulary || { client: "Client", clients: "Clients", transaction: "Transaction", transactions: "Transactions", agent: "Agent", agents: "Agents" };\n  const modules = organization?.active_modules || industryConfig?.defaultModules || { sales: true, support: true, delivery: true, field_tracking: true, inventory: false };'
    );
  } else if (content.includes('const { user, logout, team } = useAuthStore();')) {
    content = content.replace(
      'const { user, logout, team } = useAuthStore();',
      'const { user, logout, team, organization, industryConfig } = useAuthStore();\n  const vocab = industryConfig?.vocabulary || { client: "Client", clients: "Clients", transaction: "Transaction", transactions: "Transactions", agent: "Agent", agents: "Agents" };\n  const modules = organization?.active_modules || industryConfig?.defaultModules || { sales: true, support: true, delivery: true, field_tracking: true, inventory: false };'
    );
  }

  // Hide Orders tab
  content = content.replace(
    /(<button[^>]*onClick={\(\) => setActiveTab\('orders'\)}[\s\S]*?<\/button>)/g,
    "{modules.delivery && ($1)}"
  );

  // Hide Transactions tab
  content = content.replace(
    /(<button[^>]*onClick={\(\) => setActiveTab\('transactions'\)}[\s\S]*?<\/button>)/g,
    "{modules.sales && ($1)}"
  );

  // Hide Kanban tab
  content = content.replace(
    /(<button[^>]*onClick={\(\) => setActiveTab\('kanban'\)}[\s\S]*?<\/button>)/g,
    "{modules.sales && ($1)}"
  );

  // Vocabulary replacements
  content = content.replace(/>Transactions Deals</g, ">{vocab.transactions}<");
  content = content.replace(/>Deals</g, ">{vocab.transactions}<");
  content = content.replace(/Clients</g, "{vocab.clients}<");
  content = content.replace(/Client</g, "{vocab.client}<");
  content = content.replace(/Waras Recrutés</g, "{vocab.agents} Recrutés<");
  content = content.replace(/Transactions \& Pipeline National</g, "{vocab.transactions} & Pipeline National<");
  content = content.replace(/Transactions \& Pipeline/g, "{vocab.transactions} & Pipeline<");
  content = content.replace(/>Mes Transactions</g, ">Mes {vocab.transactions}<");

  fs.writeFileSync(file, content);
  console.log(`Modified ${file}`);
});
