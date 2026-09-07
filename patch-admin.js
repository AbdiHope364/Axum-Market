const fs = require('fs');

const filepath = 'apps/admin/app/page.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Change root div and insert sidebar
const oldRootDiv = '<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">';

const newRootDiv = `<div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
  {/* Sidebar */}
  <aside className={\`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 md:relative md:translate-x-0 \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col\`}>
    <div className="p-4 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-amber-400" />
        <span className="font-black text-white text-lg tracking-tight">Admin<span className="text-amber-400">Panel</span></span>
      </div>
      <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
        <X className="w-5 h-5" />
      </button>
    </div>
    <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
      {[
        { id: 'seller_approvals', label: 'Seller Approvals', icon: Clock, count: stats.pendingSellersCount },
        { id: 'moderation', label: 'Listing Moderation', icon: AlertCircle, count: stats.pendingListings },
        { id: 'all_listings', label: 'Inventory', icon: CheckCircle, count: allListings.length },
        { id: 'categories', label: 'Categories & Breeds', icon: Layers, count: categories.length },
        { id: 'sellers', label: 'Sellers Directory', icon: Users, count: stats.totalSellers },
        { id: 'reports', label: 'Safety Reports', icon: Flag, count: stats.totalReports },
      ].map((tab) => {
        const Icon = tab.icon;
        return (
        <button
          key={tab.id}
          onClick={() => { setActiveTab(tab.id as any); setIsSidebarOpen(false); }}
          className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-sm transition \${activeTab === tab.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}\`}
        >
          <div className="flex items-center gap-2.5">
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </div>
          {tab.count !== undefined && tab.count > 0 && (
            <span className={\`text-[10px] px-1.5 py-0.5 rounded-full \${activeTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'}\`}>
              {tab.count}
            </span>
          )}
        </button>
      )})}
    </nav>
  </aside>

  {isSidebarOpen && (
    <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
  )}

  {/* Main Content Area */}
  <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">`;

content = content.replace(oldRootDiv, newRootDiv);

// 2. Change Header
const oldHeaderPrefix = '<header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between">';
const newHeaderPrefix = `<header className="shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between">
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 -ml-1.5 mr-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
        <Menu className="w-5 h-5" />
      </button>`;
content = content.replace(oldHeaderPrefix + '\n        <div className="flex items-center gap-2 sm:gap-3 min-w-0">', newHeaderPrefix);

// 3. Change Main
const oldMain = '<main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8 space-y-4 sm:space-y-6">';
const newMain = '<main className="flex-1 overflow-y-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8 space-y-4 sm:space-y-6">';
content = content.replace(oldMain, newMain);

// 4. Remove Desktop Navigation Tabs Bar (hidden on mobile, thumb bar below)
content = content.replace('hidden md:flex items-center gap-1.5 overflow-x-auto', 'hidden items-center gap-1.5 overflow-x-auto');

// 5. Hide Mobile Bottom Nav
const oldMobileNav = '<nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40';
content = content.replace(oldMobileNav, oldMobileNav.replace('md:hidden', 'hidden'));

// 6. Fix closing tags
const lastIndex = content.lastIndexOf('  );\n}');
if (lastIndex !== -1) {
content = content.substring(0, lastIndex) + '    </div>\n  );\n}';
}

fs.writeFileSync(filepath, content);
console.log('Patched ' + filepath);
