import React, { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "../components/resizable";
import { Textarea } from "../components/textarea";
import { cn, generateUUID } from "../utils";
import { ScrollArea } from "../components/scrollarea";
import KnowledgeGraph from "../components/KnowledgeGraph/KnowledgeGraph";
import { MessageSquareIcon } from "lucide-react";
import { sendMessage } from "../api";
import { marked } from 'marked';
import TableView from "./TableView";

const Interface = ({ view }) => {
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const submitMessage = async (message) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, message]);
    const response = await sendMessage(message.content);
    if (response) {
      setMessages((prev) => [...prev, response]);
    } else {
      setMessages((prev) => [...prev, {
        id: generateUUID(),
        role: "assistant",
        content: "Something went wrong",
        type: "error"
      }]);
    }
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    const chatScroll = document.querySelector('.chat-scroll div');
    if (chatScroll) {
      const scrollArea = chatScroll.querySelector('div');
      setTimeout(() => {
        chatScroll.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant"
      && messages[messages.length - 1].type === "visualization") {
      setSelectedMessageId(messages[messages.length - 1].id);
    }
  }, [messages.length]);


  const buildTableData = (elements) => {
    return elements.map(element => {
      if (!element?.data?.source || !element?.data?.target) return null;
      return {
        source: element.data.source,
        target: element.data.target,
        relationship: element.data.label
      }
    }).filter(Boolean);
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="interface-container flex-1">
      {/* Left panel - Visualization */}
      <ResizablePanel defaultSize={60}>
        <ScrollArea className="h-full p-4 graph-scroll">
          {(() => {
            const selectedMessage = messages.find(m => m.id === selectedMessageId);
            return (selectedMessage?.type === "visualization" && selectedMessage?.visualData?.elements?.length > 0) ? (
              view === 'graph' ? (
                <KnowledgeGraph
                  elements={selectedMessage?.visualData?.elements}
                  className="rounded-lg border-none p-4"
                />
              ) : (
                <TableView
                  data={buildTableData(selectedMessage?.visualData?.elements)}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a message to view details
              </div>
            );
          })()}
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle disabled={true} />

      {/* Right panel - Chat */}
      <ResizablePanel defaultSize={40}>
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 overflow-auto p-4 chat-scroll">
            <div className="flex-1 overflow-auto p-4">
              {messages.map(message => (
                <>
                  <div
                    key={message.id}
                    onClick={() => {
                      if (message.type !== "visualization") return;
                      if (selectedMessageId === message.id) {
                        setSelectedMessageId(null)
                      } else {
                        setSelectedMessageId(message.id)
                      }
                    }}
                    className={cn(
                      "mb-4 p-4 rounded-lg transition-colors",
                      message.role === "assistant" && message.type === "visualization" && "cursor-pointer ai-response border",
                      selectedMessageId === message.id && "selected",
                      message.type === "error" && "destructive",
                    )}
                  >
                    {message.role === "assistant" && <MessageSquareIcon className="w-4 h-4 mb-2" />}
                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                  </div>
                  {selectedMessageId === message.id && message.visualData?.cypher_query && (
                    <div className="mb-4 bg-muted py-2 px-4 rounded-lg">
                      <code>
                        {message.visualData?.cypher_query}
                      </code>
                    </div>
                  )}
                </>
              ))}
              {isLoading && <div className="mb-4 p-4 rounded-lg flex justify-center items-center"><div className="loader" /></div>}
            </div>
          </ScrollArea>

          {/* Chat input */}
          <div className="px-4 pt-1 pb-4">
            <Textarea
              type="textarea"
              defaultValue={messages.length === 0 ? Math.random() > 0.5 ? "all skills similar to 'Deep Learning'" : "Give skill which belongs to skill category 'Data Science'" : null}
              disabled={isLoading}
              placeholder="ask anything..."
              className="flex-1 p-2 rounded-md borde custom-textarea"
              rows={3}
              onKeyDown={(e) => {
                if (!(e.key === 'Enter' && !e.shiftKey)) return;
                e.preventDefault();
                const usermessage = e.target.value;
                if (!usermessage) return;
                e.target.value = "";
                submitMessage({
                  id: generateUUID(),
                  role: "user",
                  content: usermessage,
                  type: "text"
                });
              }}
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default Interface;
