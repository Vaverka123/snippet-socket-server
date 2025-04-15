const io = require("socket.io-client");
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("snippetsResponse", (snippets) => {
  console.log("Received snippets count:", snippets.length);
});

socket.on("error", (message) => {
  console.error("Server error:", message);
});
