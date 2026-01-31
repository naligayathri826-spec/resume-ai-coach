import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Chatbot = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error) setConversations(data || []);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return;

    const loadedMessages: Message[] = (data || []).map((msg) => ({
      id: msg.id,
      text: msg.content,
      sender: msg.role === "user" ? "user" : "bot",
      timestamp: new Date(msg.created_at),
    }));

    if (loadedMessages.length === 0) {
      loadedMessages.push({
        id: "greeting",
        text: "Hi! I'm your **Resume Coach AI** 🚀\n\nI can help you with:\n- ✨ Resume improvements and feedback\n- 💼 Career advice and job search tips\n- 📝 Writing professional summaries\n- 🎯 ATS optimization strategies\n\nWhat would you like to work on today?",
        sender: "bot",
        timestamp: new Date(),
      });
    }

    setMessages(loadedMessages);
  };

  const createNewConversation = async () => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to use the chatbot.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: userId, title: "New Conversation" })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      return;
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversationId(data.id);
    setMessages([
      {
        id: "greeting",
        text: "Hi! I'm your **Resume Coach AI** 🚀\n\nI can help you with:\n- ✨ Resume improvements and feedback\n- 💼 Career advice and job search tips\n- 📝 Writing professional summaries\n- 🎯 ATS optimization strategies\n\nWhat would you like to work on today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const selectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("chat_conversations").delete().eq("id", conversationId);
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!currentConversationId || !userId) return;

    await supabase.from("chat_messages").insert({
      conversation_id: currentConversationId,
      user_id: userId,
      role,
      content,
    });

    if (role === "user" && messages.filter((m) => m.sender === "user").length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await supabase.from("chat_conversations").update({ title }).eq("id", currentConversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === currentConversationId ? { ...c, title } : c))
      );
    }
  };

  const streamChat = async (chatMessages: ChatMessage[], onDelta: (text: string) => void, onDone: () => void) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: chatMessages }),
    });

    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    onDone();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    if (!currentConversationId) {
      if (!userId) {
        toast({ title: "Please sign in", description: "You need to be signed in to use the chatbot.", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: userId, title: inputValue.slice(0, 50) })
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
        return;
      }

      setConversations((prev) => [data, ...prev]);
      setCurrentConversationId(data.id);
    }

    const userMessageId = crypto.randomUUID();
    const userMessage: Message = { id: userMessageId, text: inputValue, sender: "user", timestamp: new Date() };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    if (currentConversationId) {
      await saveMessage("user", inputValue);
    }

    const chatHistory: ChatMessage[] = newMessages
      .filter((msg) => msg.id !== "greeting")
      .map((msg) => ({ role: msg.sender === "user" ? "user" : "assistant", content: msg.text }));

    let assistantText = "";
    const botMessageId = crypto.randomUUID();

    try {
      await streamChat(
        chatHistory,
        (chunk) => {
          assistantText += chunk;
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.sender === "bot" && lastMsg.id === botMessageId) {
              return prev.map((m) => (m.id === botMessageId ? { ...m, text: assistantText } : m));
            }
            return [...prev, { id: botMessageId, text: assistantText, sender: "bot", timestamp: new Date() }];
          });
        },
        async () => {
          setIsTyping(false);
          if (currentConversationId && assistantText) {
            await saveMessage("assistant", assistantText);
          }
        }
      );
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to get response.", variant: "destructive" });
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: "Message copied to clipboard" });
  };

  const exportConversation = () => {
    const content = messages
      .map((m) => `[${m.sender === "user" ? "You" : "AI"}]: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversation.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "Conversation downloaded" });
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickQuestions = [
    "How can I improve my resume?",
    "What skills should I highlight?",
    "Help me write a summary",
    "ATS optimization tips",
  ];

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Button onClick={createNewConversation} className="w-full gradient-primary" size="sm">
            <Plus className="h-4 w-4 mr-2" /> New Chat
          </Button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {filteredConversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
            ) : (
              filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => selectConversation(conv.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-muted/50 group transition-colors ${
                    currentConversationId === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Resume Coach AI</h2>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportConversation}>
                <Download className="h-4 w-4 mr-2" /> Export Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={createNewConversation}>
                <Plus className="h-4 w-4 mr-2" /> New Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="h-20 w-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center">
                  <Bot className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Ask me anything about resumes, career advice, or job searching.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setInputValue(q);
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {message.sender === "bot" ? (
                        <AvatarFallback className="gradient-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={`flex-1 max-w-[85%] ${message.sender === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block p-4 rounded-2xl ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card border border-border rounded-bl-md"
                        }`}
                      >
                        {message.sender === "bot" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${message.sender === "user" ? "justify-end" : ""}`}>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {message.sender === "bot" && message.id !== "greeting" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyMessage(message.text, message.id)}
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && messages[messages.length - 1]?.sender === "user" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping} className="gradient-primary">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
