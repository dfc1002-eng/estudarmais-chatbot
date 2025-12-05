"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessageToAgent } from "@/lib/api";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent" | "system";
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const addMessage = (text: string, sender: "user" | "agent" | "system") => {
    setMessages((prevMessages) => [...prevMessages, { id: crypto.randomUUID(), text, sender }]);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = input.trim();
    addMessage(userMessage, "user");
    setInput("");
    setIsLoading(true);

    try {
      const agentResponse = await sendMessageToAgent(userMessage);
      addMessage(agentResponse, "agent");
    } catch (error) {
      // The error toast is already handled in api.ts, just add the fallback message
      addMessage("Um instante, estou buscando as informações para você!", "system");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-md mx-auto flex flex-col h-[80vh]">
      <CardHeader className="border-b">
        <CardTitle className="text-center text-lg font-semibold text-primary">Estudar+ Atendimento</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4" viewportRef={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.sender === "agent"
                      ? "bg-muted text-muted-foreground"
                      : "bg-yellow-100 text-yellow-800 text-sm italic", // System message style
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-muted text-muted-foreground animate-pulse">
                  Digitando...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex items-center p-4 border-t">
        <Input
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSendMessage();
            }
          }}
          className="flex-1 mr-2"
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;