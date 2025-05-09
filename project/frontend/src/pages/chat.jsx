import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Avatar, Typography, Button, TextField } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { red } from "@mui/material/colors";
import ChatItem from "../components/chat/chatitem";
import toast from "react-hot-toast";

const Chat = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Verify token and scroll to bottom
  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("http://localhost:8000/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Session verification failed");
        }
      } catch (error) {
        toast.error(error.message);
        auth.logout();
        navigate("/login");
      }
    };

    verifySession();
    const interval = setInterval(verifySession, 5 * 60 * 1000); // Verify every 5 minutes

    return () => clearInterval(interval);
  }, [auth, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { content: inputMessage, role: "user" };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await fetch("http://localhost:8000/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get AI response");
      }

      const data = await response.json();
      const aiMessage = { content: data.response, role: "assistant" };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      if (error.message.includes("Session expired")) {
        auth.logout();
        navigate("/login");
      }
      const errorMessage = { 
        content: error.message, 
        role: "assistant" 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  return (
    <Box sx={{ display: "flex", flex: 1, width: "100%", height: "100%", mt: 3, gap: 3 }}>
    {/* Left sidebar */}
    <Box sx={{ display: { md: "flex", xs: "none", sm: "none" }, flex: 0.2, flexDirection: "column" }}>
      <Box sx={{ display: "flex", width: "100%", height: "60vh", bgcolor: "rgb(17,29,39)", borderRadius: 5, flexDirection: "column", mx: 3 }}>
        <Avatar sx={{ mx: "auto", my: 2, bgcolor: "white", color: "black", fontWeight: 700 }}>
          {auth?.user?.name?.[0] || "HR"}
        </Avatar>
        <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>
          You are talking to a chatbot
        </Typography>
        <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
          This chatbot will help you find best 3 candidates matching the job description provided.
          It will also help you with the Job description. It will maintain a specific flow to retrive needed information for the job description.

        </Typography>

        <Button
          sx={{
            width: "200px",
            my: "auto",
            color: "white",
            fontWeight: "700",
            borderRadius: 3,
            mx: "auto",
            bgcolor: red[300],
            ":hover": { bgcolor: red.A100, color: "black" }
          }}
        >
          ENJOY YOUR CHAT
        </Button>
      </Box>
    </Box>

    {/* Chat area */}
    <Box sx={{ display: "flex", flex: { md: 0.8, xs: 1, sm: 1 }, flexDirection: "column", px: 3 }}>
      <Typography sx={{ fontSize: "40px", color: "white", mb: 2, mx: "auto" }}>
        HR AI Assistant
      </Typography>
      
      {/* Messages container */}
      <Box sx={{ 
        width: "100%", 
        height: "60vh", 
        borderRadius: 3, 
        mx: "auto", 
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden",
        bgcolor: "rgb(17,29,39)"
      }}>
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {chatMessages.map((chat, index) => (
            <ChatItem key={index} content={chat.content} role={chat.role} />
          ))}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input area */}
        <Box sx={{ display: "flex", p: 2, gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            sx={{ 
              bgcolor: "white", 
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { border: "none" }
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            sx={{
              bgcolor: red[300],
              color: "white",
              ":hover": { bgcolor: red.A100, color: "black" }
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  </Box>
);
};

export default Chat;