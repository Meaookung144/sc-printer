'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Switch } from '@radix-ui/react-switch'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">🌞</span>
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        className="relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 data-[state=checked]:bg-red-600"
      >
        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
      </Switch>
      <span className="text-sm">🌙</span>
    </div>
  )
}