'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Switch to Bright/Light Mode' : 'Switch to Dark Mode'}
      className="flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition shadow-sm"
    >
      {theme === 'dark' ? (
        <Sun className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4 text-cyan-600 dark:text-cyan-400" />
      )}
    </button>
  )
}
