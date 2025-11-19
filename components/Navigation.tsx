'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faBullhorn, faImages, faUserShield, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Games', icon: faFutbol },
    { href: '/announcements', label: 'News', icon: faBullhorn },
    { href: '/gallery', label: 'Photos', icon: faImages },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Mobile Header */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-bold text-green-600 flex items-center">
              <FontAwesomeIcon icon={faFutbol} className="mr-2 text-green-600" />
              <span className="hidden xs:inline">Play for Peace</span>
              <span className="xs:hidden">P4P</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-2 w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <FontAwesomeIcon icon={faUser} className="mr-2 w-3 h-3" />
              <span className="font-semibold">{user?.name}</span>
            </div>
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <FontAwesomeIcon icon={faUserShield} className="mr-2 w-4 h-4" />
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile User Info */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg">
              <FontAwesomeIcon icon={faUser} className="mr-1.5 w-3 h-3" />
              <span className="font-semibold max-w-[80px] truncate">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition ${
                isActive(item.href)
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-5 h-5 mb-1 ${isActive(item.href) ? 'text-green-600' : 'text-gray-500'}`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className={`flex flex-col items-center justify-center flex-1 h-full transition ${
                pathname === '/admin' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <FontAwesomeIcon
                icon={faUserShield}
                className={`w-5 h-5 mb-1 ${pathname === '/admin' ? 'text-blue-600' : 'text-gray-500'}`}
              />
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
