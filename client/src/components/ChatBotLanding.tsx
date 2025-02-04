import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";
import { Bot, Send } from "lucide-react";
import { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [allMessages, setAllMessages] = useState<{ message: string; sender: "user" | "ai" }[]>([{ message: "Hi there! How can I help you today?", sender: "ai" }]);

  const fetchCustomerRequest = async () => {
    try {
      const { data } = await axios.post(
        baseUrl + "/llm",
        { message: chatInput },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      setAllMessages((prevMessages) => [...prevMessages, { message: data.message, sender: "ai" }]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (chatInput.trim()) {
      setAllMessages((prevMessages) => [...prevMessages, { message: chatInput, sender: "user" }]);
      fetchCustomerRequest();
      setChatInput("");
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Conditionally render the button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-blue-dark focus:outline-none">
          <Bot className="w-6 h-6" /> {/* Adjust the icon size to match the button size */}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white shadow-lg rounded-lg w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="text-md font-semibold">Customer Service</h3>
            <button
              onClick={toggleChat}
              className="text-white focus:outline-none">
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {allMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} p-3 rounded-lg max-w-[75%]`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div className="p-4 border-t">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 justify-center">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="flex items-center w-10 h-10 justify-center p-2 bg-primary text-white rounded-full hover:bg-blue-dark focus:outline-none">
                <Send className="w-6 h-6 relative right-[1px]" /> {/* Adjust the icon size to match the button size */}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
