'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dataset',
      label: 'Task 1',
      href: '/dataset',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Embedding',
      label: 'Task 2',
      href: '/embedding',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      name: 'Search',
      label: 'Task 3',
      href: '/search',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
  ];

  return (
    <aside className="w-72 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white h-screen p-6 flex flex-col border-r border-neutral-800 sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Semantic Search</h1>
          </div>
        </div>
        <p className="text-neutral-400 text-sm pl-[52px]">AI Research Assistant</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                }
              `}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}

              {/* Icon */}
              <div className={`
                flex-shrink-0 transition-transform duration-200
                ${isActive ? '' : 'group-hover:scale-110'}
              `}>
                {item.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className={`text-xs ${isActive ? 'text-primary-100' : 'text-neutral-500 group-hover:text-neutral-400'}`}>
                  {item.label}
                </div>
              </div>

              {/* Arrow indicator for active item */}
              {isActive && (
                <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-neutral-800/50">
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-neutral-400">University Project</p>
            <p className="text-xs text-neutral-500 mt-0.5">FastAPI + Next.js</p>
          </div>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" title="System Ready" />
        </div>
      </div>
    </aside>
  );
}
