"use client";

import { useState } from "react";
import { NotificationList } from "./NotificationList";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { logoutAction } from "../lib/actions/auth";
import Image from "next/image";
import { useNotificationsWS } from "../hooks/useNotificationsWS";

interface HeaderProps {
  user?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}
export default function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = useNotificationsWS();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // Call server action to logout from backend and clear cookies
      const result = await logoutAction();

      if (result.success) {
        // Clear Apollo Client cache to prevent showing old data
        await apolloClient.clearStore();

        // Sign out from NextAuth
        await signOut({ redirect: false });

        // Redirect to login
        router.push("/login");
      } else {
        console.error("Logout failed:", result.error);
        alert("Đăng xuất thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Có lỗi xảy ra khi đăng xuất.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-50 h-14">
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo & Search */}
        <div className="flex items-center gap-2 flex-1">
          <div className="text-blue-600 text-3xl font-bold px-2">f</div>
          <div className="hidden sm:block">
            <input
              type="text"
              placeholder="Tìm kiếm trên Facebook"
              className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 w-60 focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.464 1.286C10.294.803 11.092.5 12 .5c.908 0 1.707.303 2.537.786.795.462 1.7 1.142 2.815 1.977l2.232 1.675c1.391 1.042 2.359 1.766 2.888 2.826.53 1.059.53 2.268.528 4.006v4.3c0 1.355 0 2.471-.119 3.355-.124.928-.396 1.747-1.052 2.403-.657.657-1.476.928-2.404 1.053-.884.119-2 .119-3.354.119H7.93c-1.354 0-2.47 0-3.354-.119-.928-.125-1.747-.396-2.404-1.053-.656-.656-.928-1.475-1.053-2.403C1 18.541 1 17.425 1 16.07v-4.3c0-1.738-.002-2.947.528-4.006.53-1.06 1.497-1.784 2.888-2.826L6.65 3.263c1.114-.835 2.02-1.515 2.815-1.977zM10 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a5 5 0 0 0-5 5v2H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-2V6a5 5 0 0 0-5-5zm3 7V6a3 3 0 1 0-6 0v2h6z" />
            </svg>
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z" />
            </svg>
          </button>
          {/* Notification Bell */}
          <div className="relative">
            <button
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Thông báo"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Red dot indicator if there is at least 1 notification */}
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 z-50">
                <NotificationList notifications={notifications} />
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors overflow-hidden"
            >
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                  height={40}
                  width={40}
                />
              ) : (
                <span>{user?.username?.charAt(0).toUpperCase() || "U"}</span>
              )}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                        {user?.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-full h-full object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <span>
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {user?.fullName || user?.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.email || ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          <span className="font-medium text-sm">
                            Đang đăng xuất...
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className="font-medium text-sm">Đăng xuất</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
