import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Plus, MessageSquare, Trash2 } from "lucide-react";
import Footer from "@/components/Footer";
import { useAuthGracePeriod } from "@/hooks/useAuthGracePeriod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  useAuthGracePeriod();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  // Load conversations when user is available
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

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    const loadedMessages: Message[] = (data || []).map((msg) => ({
      id: msg.id,
      text: msg.content,
      sender: msg.role === "user" ? "user" : "bot",
      timestamp: new Date(msg.created_at),
    }));

    // Add greeting if no messages
    if (loadedMessages.length === 0) {
      loadedMessages.unshift({
        id: "greeting",
        text: "Hi! I'm your Resume Coach! 👋 I can help you improve your resume, answer career questions, and provide personalized advice. What would you like to know?",
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
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return;
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversationId(data.id);
    setMessages([
      {
        id: "greeting",
        text: "Hi! I'm your Resume Coach! 👋 I can help you improve your resume, answer career questions, and provide personalized advice. What would you like to know?",
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
    
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error("Error deleting conversation:", error);
      return;
    }

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

    // Update conversation title if it's the first user message
    if (role === "user" && messages.filter((m) => m.sender === "user").length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await supabase
        .from("chat_conversations")
        .update({ title })
        .eq("id", currentConversationId);
      
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

    // Create conversation if none exists
    if (!currentConversationId) {
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
        .insert({ user_id: userId, title: inputValue.slice(0, 50) })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
        return;
      }

      setConversations((prev) => [data, ...prev]);
      setCurrentConversationId(data.id);
    }

    const userMessageId = crypto.randomUUID();
    const userMessage: Message = {
      id: userMessageId,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    // Save user message
    if (currentConversationId) {
      await saveMessage("user", inputValue);
    }

    // Convert messages to chat format (excluding the greeting)
    const chatHistory: ChatMessage[] = newMessages
      .filter((msg) => msg.id !== "greeting")
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

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
              return prev.map((m) =>
                m.id === botMessageId ? { ...m, text: assistantText } : m
              );
            }
            return [
              ...prev,
              {
                id: botMessageId,
                text: assistantText,
                sender: "bot",
                timestamp: new Date(),
              },
            ];
          });
        },
        async () => {
          setIsTyping(false);
          // Save assistant message
          if (currentConversationId && assistantText) {
            await saveMessage("assistant", assistantText);
          }
        }
      );
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const quickQuestions = [
    "How can I improve my resume?",
    "What skills should I add?",
    "Help me with my summary",
    "Review my experience section",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI Resume Coach
            </h1>
            <p className="text-lg text-muted-foreground">
              Get personalized advice to improve your resume
            </p>
          </div>

          <div className="flex gap-4 animate-fade-in">
            {/* Sidebar - Conversation History */}
            <Card className="w-72 flex-shrink-0 hidden md:block">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Conversations</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createNewConversation}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No conversations yet
                    </p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted group ${
                          currentConversationId === conv.id ? "bg-muted" : ""
                        }`}
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate flex-1">{conv.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => deleteConversation(conv.id, e)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Main Chat Area */}
            <Card className="flex-1 shadow-large">
              <CardHeader>
                <CardTitle>Chat with AI Coach</CardTitle>
                <CardDescription>
                  Ask anything about resume writing, career advice, or job searching
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Messages */}
                <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 bg-muted/20 rounded-lg">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Start a new conversation or select one from the sidebar</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={createNewConversation}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Conversation
                        </Button>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === "user" ? "flex-row-reverse" : ""
                        } animate-fade-in`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender === "user"
                              ? "bg-primary"
                              : "gradient-primary"
                          }`}
                        >
                          {message.sender === "user" ? (
                            <User className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <Bot className="h-5 w-5 text-primary-foreground" />
                          )}
                        </div>
                        <div
                          className={`flex-1 max-w-[80%] ${
                            message.sender === "user" ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && messages[messages.length - 1]?.sender === "user" && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="bg-card border border-border p-3 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputValue(question)}
                      className="text-xs"
                      disabled={isTyping}
                    >
                      {question}
                    </Button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isTyping || !inputValue.trim()}
                    className="gradient-primary shadow-soft"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chatbot;