"use client"
import { useState } from "react";

interface Message {
  sender: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "Alice", content: "Hello world!" },
    { sender: "Bob", content: "Hi Alice" },
  ]);

const [input, setInput] = useState("");
const handleSubmit = (event: React.FormEvent<HTMLElement>) => {
  event.preventDefault();
  setMessages([...messages, {sender: "Alice", content: input}])
  setInput("");
}



  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.sender}</strong>: {message.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input type="text" name="message" id="message" value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
