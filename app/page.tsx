"use client"; // Runs in browser (needed for hooks and interactivity)

import { useMutation, useQuery } from "convex/react"; // Hooks to interact with Convex
import { useState } from "react"; // React hook for managing component state
import { api } from "../convex/_generated/api"; // Auto-generated API from Convex functions

export default function Home() {
  // Fetch all messages from database in real-time
  // Connects to: convex/functions/message.ts (list query)
  // Auto-updates when new messages are added
  const messages = useQuery(api.functions.message.list);

  // Function to add new message to database
  // Connects to: convex/functions/message.ts (create mutation)
  const createMessage = useMutation(api.functions.message.create);

  // Track what user is typing in input field
  const [input, setInput] = useState("");

  // Runs when user submits the form (clicks Send or presses Enter)
  const handleSubmit = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault(); // Prevent page refresh
    createMessage({ sender: "Alice", content: input }); // Save to database
    setInput(""); // Clear input field after sending
  };

  return (
    <div>
      {/* Display all messages from database */}
      {/* messages?.map uses optional chaining in case messages is undefined */}
      {messages?.map((message, index) => (
        <div key={index}>
          {" "}
          {/* Unique key for React rendering */}
          <strong>{message.sender}</strong>: {message.content}
        </div>
      ))}

      {/* Form to send new messages */}
      <form onSubmit={handleSubmit}>
        {" "}
        {/* Calls handleSubmit on submit */}
        <input
          type="text"
          name="message"
          id="message"
          value={input} // Controlled input: value from state
          onChange={(e) => setInput(e.target.value)} // Update state on typing
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
