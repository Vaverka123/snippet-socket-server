const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fetch = require("node-fetch");

// Serve a simple webpage for testing (optional, see Step 4)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Listen for 'getSnippets' event from client
  socket.on("getSnippets", async () => {
    try {
      // Make HTTP request to the REST API
      const response = await fetch("https://codelang.vercel.app/api/snippets");

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Parse JSON data
      const snippets = await response.json();

      // Send data back to client
      socket.emit("snippetsResponse", snippets);
    } catch (error) {
      // Send error message to client
      socket.emit("error", `Failed to fetch snippets: ${error.message}`);
      console.error("Error:", error);
    }
  });

  // Log when client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
