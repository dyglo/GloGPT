'use client'

import { useState, useEffect } from 'react'
import { Menu, PenSquare, ChevronDown, User, Send, Moon, Sun } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
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

// Simplified markdown components configuration
const markdownComponents: Components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
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

const generateChatTitle = (query: string): string => {
  const lowercaseQuery = query.toLowerCase()
  if (lowercaseQuery.includes('code') || lowercaseQuery.includes('programming')) {
    return 'Code Assistance'
  } else if (lowercaseQuery.includes('explain') || lowercaseQuery.includes('what is')) {
    return 'Explanation Request'
  } else if (lowercaseQuery.includes('how to') || lowercaseQuery.includes('how do i')) {
    return 'How-to Guide'
  } else {
    return 'General Query'
  }
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedChats = localStorage.getItem('chats')
    if (savedChats) {
      setChats(JSON.parse(savedChats))
    }
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    if (currentChatId) {
      const currentChat = chats.find(chat => chat.id === currentChatId)
      if (currentChat) {
        setMessages(currentChat.messages)
      }
    }
  }, [currentChatId, chats])

  const handleNewChat = () => {
    const newChatId = Date.now().toString()
    setChats(prevChats => [...prevChats, { id: newChatId, title: 'New Chat', messages: [] }])
    setCurrentChatId(newChatId)
    setMessages([])
    setInput('')
  }

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
            ? { ...chat, messages: newMessages, title: chat.messages.length === 0 ? generateChatTitle(input) : chat.title } 
            : chat
        )
        if (!currentChatId) {
          const newChatId = Date.now().toString()
          updatedChats.push({ id: newChatId, title: generateChatTitle(input), messages: newMessages })
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold">G</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">GloGPT</span>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 mb-6 transition-colors text-gray-700 dark:text-gray-300"
          >
            <PenSquare className="h-4 w-4" />
            New Chat
          </button>
          
          <div className="space-y-4">
            <div>
              <h3 className="px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Chat History</h3>
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChatId(chat.id)}
                  className={`w-full text-left px-2 py-1 rounded-lg transition-colors ${
                    chat.id === currentChatId 
                      ? 'bg-gray-200 dark:bg-gray-800' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                  } text-gray-700 dark:text-gray-300`}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-black">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900 dark:text-white">GloGPT</span>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">What can I help with?</h1>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <button className="p-4 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  Create image
                </button>
                <button className="p-4 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  Brainstorm
                </button>
                <button className="p-4 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  Help me write
                </button>
                <button className="p-4 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                  Summarize text
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-900 prose dark:prose-invert prose-sm max-w-none'
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

        {/* Message input */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message GloGPT..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
            GloGPT can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}