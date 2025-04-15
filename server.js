const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fetch = require("node-fetch");

console.log("node-fetch loaded:", typeof fetch);

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Auto-fetch on connect
  (async () => {
    try {
      console.log("Auto-fetch starting for client:", socket.id);
      const response = await fetch("https://codelang.vercel.app/api/snippets");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const apiResponse = await response.json();
      const snippets = apiResponse.data?.data || [];
      console.log("Auto-fetch snippets count:", snippets.length);
      if (!Array.isArray(snippets)) {
        throw new Error("API response data.data is not an array");
      }
      socket.emit("snippetsResponse", snippets);
    } catch (error) {
      console.error("Auto-fetch error:", error.message);
      socket.emit("error", `Failed to fetch snippets: ${error.message}`);
    }
  })();

  // Manual getSnippets
  socket.on("getSnippets", async () => {
    try {
      console.log("Manual fetch starting for client:", socket.id);
      const response = await fetch("https://codelang.vercel.app/api/snippets");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const apiResponse = await response.json();
      const snippets = apiResponse.data?.data || [];
      console.log("Manual fetch snippets count:", snippets.length);
      if (!Array.isArray(snippets)) {
        throw new Error("API response data.data is not an array");
      }
      socket.emit("snippetsResponse", snippets);
    } catch (error) {
      console.error("Manual fetch error:", error.message);
      socket.emit("error", `Failed to fetch snippets: ${error.message}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Periodic updates: Fetch every 5 seconds
setInterval(async () => {
  try {
    console.log("Periodic fetch starting...");
    const response = await fetch("https://codelang.vercel.app/api/snippets");
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const apiResponse = await response.json();
    const snippets = apiResponse.data?.data || [];
    console.log("Periodic snippets count:", snippets.length);
    if (!Array.isArray(snippets)) {
      throw new Error("API response data.data is not an array");
    }
    io.emit("snippetsResponse", snippets); // Broadcast to all clients
  } catch (error) {
    console.error("Periodic fetch error:", error.message);
  }
}, 5000);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
