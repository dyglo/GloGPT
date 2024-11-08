'use client'

import { useState, useEffect } from 'react'
import { Search, MessageSquare, Menu, FolderKanban, FileText, Users, History, Settings, HelpCircle, Sun, Moon, Paperclip, Mic, Send, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type Chat = {
  id: string
  title: string
  messages: Message[]
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }
}

const ThinkingIndicator = () => (
  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
    <span>Thinking</span>
    <span className="animate-pulse">.</span>
    <span className="animate-pulse animation-delay-200">.</span>
    <span className="animate-pulse animation-delay-400">.</span>
  </div>
)

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.message }
      const newMessages = [...updatedMessages, assistantMessage]
      setMessages(newMessages)

      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: newMessages, title: chat.messages.length === 0 ? input.slice(0, 30) : chat.title } 
            : chat
        )
        if (!currentChatId) {
          const newChatId = Date.now().toString()
          updatedChats.push({ id: newChatId, title: input.slice(0, 30), messages: newMessages })
          setCurrentChatId(newChatId)
        }
        return updatedChats
      })
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    if (currentChatId && messages.length > 0) {
      setChats(prevChats => [
        ...prevChats,
        { id: currentChatId, title: messages[0].content.slice(0, 30), messages }
      ]);
    }
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  const switchChat = (chatId: string) => {
    setCurrentChatId(chatId);
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
    }
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.setProperty('--primary', '#3b82f6')
      document.documentElement.style.setProperty('--primary-foreground', '#ffffff')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.style.setProperty('--primary', '#60a5fa')
      document.documentElement.style.setProperty('--primary-foreground', '#000000')
      localStorage.setItem('theme', 'dark')
    }
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0 -ml-64'} flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden md:relative md:ml-0 fixed h-full z-20`}>
        <div className="p-4 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-white font-semibold">T</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">TafChat</span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1 overflow-y-auto">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <MessageSquare className="h-4 w-4" />
              New Chat
            </button>
            <div className="mt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chat History</h3>
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => switchChat(chat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left ${
                    chat.id === currentChatId 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } rounded-lg`}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Settings & Help */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
          </div>

          {/* Theme Toggle & User */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="flex items-center gap-3 px-3 py-2 mt-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">User Name</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">user@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between bg-white dark:bg-black">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">TafChat</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-gray-700 dark:text-gray-200" /> : <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4">
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white text-center">Welcome to TafChat</h1>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
                Get started by TafChat AI task and Chat can do the rest. Not sure where to start?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Write copy</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Image generation</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Create avatar</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Write code</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white dark:bg-gray-800 prose dark:prose-invert prose-sm max-w-none'
                    }`}
                  >
                    {message.role === 'user' ? (
                      message.content
                    ) : (
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <ThinkingIndicator />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message TafChat..."
                className="w-full pl-4 pr-32 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                TafChat may produce inaccurate information about people, places, or facts.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}