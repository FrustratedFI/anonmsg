const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });
const cors = require("cors");

app.use(cors());
app.use(express.static("public"));

// --- Placeholder AI moderation function ---
async function aiModerate(message) {
    // Example: block messages longer than 300 chars
    if(message.length > 300) return { allowed: false, reason: "Too long" };
    // TODO: Replace with your Gemini / AI API call
    return { allowed: true };
}

// --- Real-time messaging ---
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", async (data, ack) => {
        const modResult = await aiModerate(data.message);

        if(!modResult.allowed){
            // optional: notify sender if blocked
            ack({ allowed: false, reason: modResult.reason });
            return;
        }

        // broadcast message to everyone
        io.emit("newMessage", { user: data.user, message: data.message, time: new Date().toLocaleTimeString() });

        // confirm to sender
        ack({ allowed: true });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Server running on port", PORT));