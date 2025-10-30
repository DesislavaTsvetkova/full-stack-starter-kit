import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'Tools', path: '/tools' },
  ];

  // function to check if current path matches (exact for /dashboard /profile /tools, or startsWith for grouped pages)
  const isActive = (path) => pathname === path;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">AI Tools Directory</h1>
          <nav className="flex items-center gap-4">
            {navItems.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={
                  'px-4 py-2 text-sm font-medium rounded-lg transition ' +
                  (isActive(path)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
                }
                aria-current={isActive(path) ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
            <button
              onClick={async () => { await logout(); router.push('/login'); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
