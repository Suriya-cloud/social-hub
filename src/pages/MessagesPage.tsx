import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message, User } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [conversationUsers, setConversationUsers] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    if (currentUser) {
      const userConversations = api.conversations.getByUserId(currentUser.id);
      setConversations(userConversations);

      const usersMap = new Map<string, User>();
      userConversations.forEach(conv => {
        conv.participants.forEach(participantId => {
          if (participantId !== currentUser.id) {
            const user = api.users.getById(participantId);
            if (user) {
              usersMap.set(participantId, user);
            }
          }
        });
      });
      setConversationUsers(usersMap);

      if (conversationId) {
        const conv = api.conversations.getById(conversationId);
        if (conv) {
          setSelectedConversation(conv);
          const convMessages = api.messages.getByConversationId(conversationId);
          setMessages(convMessages);
        }
      }
    }
  }, [currentUser, conversationId]);

  const handleSendMessage = () => {
    if (!currentUser || !selectedConversation || !messageText.trim()) return;

    try {
      const newMessage = api.messages.create(
        selectedConversation.id,
        currentUser.id,
        messageText
      );
      setMessages([...messages, newMessage]);
      setMessageText('');

      const updatedConversations = api.conversations.getByUserId(currentUser.id);
      setConversations(updatedConversations);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const getOtherParticipant = (conversation: Conversation): User | null => {
    const otherParticipantId = conversation.participants.find(
      id => id !== currentUser?.id
    );
    return otherParticipantId ? conversationUsers.get(otherParticipantId) || null : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          <div className="xl:col-span-1 bg-card rounded-lg shadow-elegant overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation from a user's profile</p>
                </div>
              ) : (
                conversations.map(conversation => {
                  const otherUser = getOtherParticipant(conversation);
                  if (!otherUser) return null;

                  return (
                    <Link
                      key={conversation.id}
                      to={`/messages/${conversation.id}`}
                      className={`block p-4 border-b border-border hover:bg-muted transition-smooth ${
                        selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherUser.avatar} alt={otherUser.username} />
                          <AvatarFallback className="gradient-bg text-primary-foreground">
                            {otherUser.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{otherUser.username}</p>
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.text || 'Media'}
                            </p>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                              addSuffix: false,
                            })}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="xl:col-span-2 bg-card rounded-lg shadow-elegant overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-border">
                  {(() => {
                    const otherUser = getOtherParticipant(selectedConversation);
                    return otherUser ? (
                      <Link to={`/profile/${otherUser.id}`} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={otherUser.avatar} alt={otherUser.username} />
                          <AvatarFallback className="gradient-bg text-primary-foreground">
                            {otherUser.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{otherUser.username}</p>
                          <p className="text-sm text-muted-foreground">{otherUser.fullName}</p>
                        </div>
                      </Link>
                    ) : null;
                  })()}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => {
                    const isOwnMessage = message.senderId === currentUser?.id;
                    const sender = api.users.getById(message.senderId);

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={sender?.avatar} alt={sender?.username} />
                          <AvatarFallback className="text-xs">
                            {sender?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'gradient-bg text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            {message.text && <p className="text-sm">{message.text}</p>}
                            {message.mediaUrl && (
                              <div className="mt-2">
                                {message.mediaType === 'image' ? (
                                  <img
                                    src={message.mediaUrl}
                                    alt="Shared media"
                                    className="max-w-full rounded"
                                  />
                                ) : (
                                  <video src={message.mediaUrl} controls className="max-w-full rounded" />
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="gradient-bg"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
