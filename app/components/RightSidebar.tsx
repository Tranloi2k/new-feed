export default function RightSidebar() {
  const contacts = [
    { name: "Nguyễn Văn A", online: true },
    { name: "Trần Thị B", online: true },
    { name: "Lê Văn C", online: false },
    { name: "Phạm Thị D", online: true },
    { name: "Hoàng Văn E", online: false },
  ];

  return (
    <aside className="hidden xl:block fixed right-0 top-14 w-64 h-[calc(100vh-3.5rem)] overflow-y-auto p-3">
      <div className="space-y-4">
        {/* Sponsored */}
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 font-semibold text-sm mb-2">
            Được tài trợ
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Quảng cáo 1</div>
                <div className="text-xs text-gray-500">sponsor.com</div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Contacts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
              Người liên hệ
            </h3>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {contacts.map((contact, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>
                <span className="text-sm font-medium">{contact.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
