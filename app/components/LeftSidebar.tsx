export default function LeftSidebar() {
  const menuItems = [
    { icon: "👤", label: "Trang cá nhân", active: false },
    { icon: "👥", label: "Bạn bè", active: false },
    { icon: "📺", label: "Video", active: false },
    { icon: "🏪", label: "Marketplace", active: false },
    { icon: "👥", label: "Nhóm", active: false },
    { icon: "🎮", label: "Trò chơi", active: false },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] overflow-y-auto p-2">
      <nav className="space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left">
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xl">▼</span>
          </div>
          <span className="font-medium text-sm">Xem thêm</span>
        </button>
      </nav>
    </aside>
  );
}
