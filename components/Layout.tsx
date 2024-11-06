'use client'

import { useState } from 'react'
import { Menu, PenSquare, ChevronDown, User } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-100 border-r transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white">G</span>
            </div>
            <span className="font-semibold">GloGPT</span>
          </div>
          
          <button className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-200 mb-4">
            <PenSquare className="h-4 w-4" />
            New Chat
          </button>
          
          {/* Chat history sections will go here */}
          <div className="space-y-4">
            <div>
              <h3 className="px-2 text-sm font-medium text-gray-500 mb-2">Today</h3>
              {/* Chat history items will go here */}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-1">
                <span className="font-semibold">GloGPT</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            <button>
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}