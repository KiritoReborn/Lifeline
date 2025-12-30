interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export default function Sidebar({ isOpen = true, onClose, activePage = 'hospitals', onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'tracking', label: 'Live Tracking', icon: '📡' },
    { id: 'hospitals', label: 'Hospitals', icon: '🏥' },
    { id: 'ambulance-requests', label: 'Ambulance Requests', icon: '🚑' },
    { id: 'user-management', label: 'User Management', icon: '👥' },
    { id: 'api-test', label: 'API Test', icon: '🧪' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-blue-400">OpenICU</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate?.(item.id);
                onClose?.();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200 text-left
                ${activePage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Jane Doe</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              onNavigate?.('logout');
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-left"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
