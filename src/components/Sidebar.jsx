import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, Menu, X, FileStack } from 'lucide-react';
import { getQuotes, getClients, getSettings } from '../utils/storage';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({ quotes: 0, clients: 0 });
  const [company, setCompany] = useState(null);

  useEffect(() => {
    setStats({
      quotes: getQuotes().length,
      clients: getClients().length
    });
    setCompany(getSettings()?.company);
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: stats.quotes },
    { path: '/new-quote', label: 'New Quote', icon: FileText },
    { path: '/clients', label: 'Clients', icon: Users, badge: stats.clients },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <FileStack className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">
                  {company?.name || 'QuoteFlow'}
                </h1>
                <p className="text-xs text-slate-400">Quotation Manager</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-slate-600 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            QuoteFlow v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
