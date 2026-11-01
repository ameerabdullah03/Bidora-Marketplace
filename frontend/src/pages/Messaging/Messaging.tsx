import { useState, useEffect } from 'react'
import { Send, X, Phone, Video } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  last_message: string
  updated_at: string
  unread_count: number
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
  is_read: boolean
}

export default function Messaging() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchConversations()
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_id,
          last_message,
          updated_at,
          unread_count,
          profiles!participant_id(full_name)
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      const mappedConversations = (data || []).map(conv => ({
        ...conv,
        participant_name: (conv.profiles as any)?.full_name || 'Unknown'
      }))
      setConversations(mappedConversations)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedConversation) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          content,
          created_at,
          is_read,
          profiles!sender_id(full_name)
        `)
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true })

      if (error) throw error
      const mappedMessages = (data || []).map(msg => ({
        ...msg,
        sender_name: (msg.profiles as any)?.full_name || 'Unknown'
      }))
      setMessages(mappedMessages)

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConversation)
        .neq('sender_id', user?.id)
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user?.id,
        content: newMessage.trim(),
      })

      if (error) throw error
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  if (loading) return <div className="text-center py-12">Loading conversations...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations List */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">{conv.participant_name}</h3>
                  {conv.unread_count > 0 && (
                    <span className="bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">{conv.last_message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                {conversations.find(c => c.id === selectedConversation)?.participant_name}
              </h2>
              <p className="text-xs text-gray-600">Active now</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 py-12">No messages yet. Start the conversation!</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-gray-600'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button
                onClick={sendMessage}
                className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Select a conversation to start messaging</p>
            <p className="text-sm">Choose from your conversations or start a new one</p>
          </div>
        </div>
      )}
    </div>
  )
}
