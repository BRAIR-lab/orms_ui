import { ActionIcon, Container, Card, Box, ScrollArea, Group, Textarea, Flex } from "@mantine/core"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import TitleTile from "../components/TitleTile"
import { IconSend } from "@tabler/icons-react"
import * as ROSLIB from "roslib";

function Message({ children, isUser }) {
	return (
		<Container>
			{children}
		</Container>
	)
}
// (MADE BY GEMINI)
const markdownComponents = {
  // Styles the block containing the code
  pre: ({ node, ...props }) => (
    <pre
      style={{
        whiteSpace: 'pre-wrap',       // This is the magic line that forces wrapping!
        wordBreak: 'break-word',      // Ensures long unbroken strings don't overflow
        backgroundColor: '#dee2e6',   // A slightly darker gray (Mantine gray.3) to stand out from gray.1
        padding: '12px',
        borderRadius: '8px',
        margin: '10px 0',
        fontFamily: 'monospace',
        fontSize: '0.9em'
      }}
      {...props}
    />
  ),
  // Styles the text inside the block, or inline code snippets
  code: ({ node, inline, ...props }) => (
    <code
      style={{
        backgroundColor: inline ? '#dee2e6' : 'transparent', // Only add bg if it's inline like `this`
        padding: inline ? '2px 6px' : '0',
        borderRadius: inline ? '4px' : '0',
        fontFamily: 'monospace',
      }}
      {...props}
    />
  ),
};

function MessageContent({ children, isUser }) {
  return (
    <Card padding={0} radius='lg' maw="80%" ml={isUser ? 'auto' : 0} mb='sm' mt='sm'>
    <Box
      bg={isUser ? 'yellow.6' : 'gray.1'}  p="md"
      style={{ color: isUser ? 'white' : 'var(--mantine-color-gray-9)',}}
    >
      {children}
    </Box>
    </Card>
  )
}

export function ChatToBaby({name, onClick, ros}) {
  const [input, setInput] = useState("");
  const [lastAnswer, setLastAnswer] = useState('')
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false);
  const viewport = useRef(null);
  const inputRef = useRef(null);
  const [askAction, setAskAction] = useState(null);

  useEffect(() => {
  
    if(!ros) return;
  
    var ask = new ROSLIB.Action({
      ros: ros,
      name: '/web_chat/chat_ask',
      actionType: 'simple_server_interfaces/action/ChatAsk'
    })
    setAskAction(ask)
    var goal = { question: "" }
    ask.sendGoal(goal, (a)=>{}, (a)=>{})
  
    return () => {
    }
    }, [ros]);

  const addMessage = (userMessage) => {
    // TODO: disattivare la casella di testo (o la possibilità di fare invio)
    if (!userMessage.trim()) return;
    setIsStreaming(true);
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        role: "assistant",
        content: lastAnswer
      },
      {
        id: messages.length + 2,
        role: "user",
        content: userMessage
      }
    ])
    setLastAnswer("")

    var goal = { question: userMessage }
    askAction.sendGoal(goal, 
      function(result) {
        setIsStreaming(false);
        if(! result.success) {
          setLastAnswer("There has been an error in the answer generation")
        } else {
          setLastAnswer(result.full_answer)
        }
      },
      function(feedback) {
        console.log(feedback)
        if(feedback.split){
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              role: "assistant",
              content: feedback.partial_answer
            },
            {
              id: prev.length + 2,
              role: "assistant",
              content: ""
            }
          ])
          setLastAnswer("")
        } else {
          setLastAnswer((prev) => prev + feedback.partial_answer);
        }
      }
    )
  }

  useEffect(
    () => viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' }),
    [messages, lastAnswer]
  )
  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  return (
	<Card
		  shadow="sm" padding="lg" radius="md" withBorder
		  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
		>
      <TitleTile text={name} onClick={onClick} />
      <ScrollArea viewportRef={viewport} style={{ flex: 1, minHeight: 0 }}>
          {messages.map((message) => {
            const isAssistant = message.role === "assistant"

            return (
              <Message key={message.id} isUser={!isAssistant} padding='md'>
                  {isAssistant ? (
                      message.content !== '' && <MessageContent isUser={!isAssistant}>
                          <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                      </MessageContent>
                  ) : (
                    <MessageContent isUser={!isAssistant}>
                      {message.content}
                    </MessageContent>
                  )}
              </Message>
            )
          })}
          {lastAnswer !== '' && (
            <Message key="streaming" isUser={false} padding='md'>
              <MessageContent isUser={false}>
                <ReactMarkdown components={markdownComponents}>{lastAnswer}</ReactMarkdown>
              </MessageContent>
            </Message>
          )}
      </ScrollArea>

      {/* Add message / footer */}
      <Flex gap='md' align="flex-end">
        <Textarea
          placeholder="Message..."
          autoFocus minRows={2} maxRows={6} radius="md" autosize
          style={{ flex:1 }}
          size="lg"
          value={input}
          disabled={isStreaming}
          ref={inputRef}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addMessage(input);
              setInput("");
            }
          }}
        />
        <ActionIcon size="36" radius="md" onClick={addMessage} disabled={isStreaming}>
          <IconSend size={20} />
        </ActionIcon>
      </Flex>
	</Card>
  )
}