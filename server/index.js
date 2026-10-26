const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// === ENV ===
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/simplechat";
const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] }
});

app.use(cors());
app.use(bodyParser.json());

// === Mongoose models ===
const { Schema } = mongoose;

const UserSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: String,
  photoURL: String,
  username: { type: String, index: true } // we will store a lowercase username
}, { timestamps: true });

const MessageSchema = new Schema({
  from: String, // uid
  to: String,   // uid
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema({
  participants: [String], // two uids sorted
  lastMessage: String,
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Message = mongoose.model("Message", MessageSchema);
const Conversation = mongoose.model("Conversation", ConversationSchema);

// === API endpoints ===
// Upsert user
app.post("/api/users", async (req, res) => {
  try {
    const { uid, name, email, photoURL, username } = req.body;
    if (!uid) return res.status(400).json({ error: "uid required" });
    const uname = (username || name || email || uid).toLowerCase();
    const user = await User.findOneAndUpdate(
      { uid },
      { uid, name, email, photoURL, username: uname },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Search users by username (simple contains)
app.get("/api/users", async (req, res) => {
  try {
    const q = (req.query.search || "").toLowerCase();
    if (!q) return res.json([]);
    const results = await User.find({ username: { $regex: q, $options: "i" } })
                              .limit(20)
                              .select("uid name email photoURL username");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Get messages between two users (paginated basic)
app.get("/api/messages/:userA/:userB", async (req, res) => {
  try {
    const { userA, userB } = req.params;
    const msgs = await Message.find({
      $or: [
        { from: userA, to: userB },
        { from: userB, to: userA }
      ]
    }).sort({ createdAt: 1 }).limit(100); // last 100 messages
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// === Socket.io realtime ===
const onlineUsers = new Map(); // uid -> socket.id

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("user_connected", (uid) => {
    onlineUsers.set(uid, socket.id);
    socket.uid = uid;
    console.log("user connected:", uid);
  });

  socket.on("private_message", async (data) => {
    // data: { from, to, text }
    try {
      const { from, to, text } = data;
      const msg = new Message({ from, to, text });
      await msg.save();

      // update or create conversation (store participants sorted)
      const parts = [from, to].sort();
      await Conversation.findOneAndUpdate(
        { participants: parts },
        { participants: parts, lastMessage: text, updatedAt: new Date() },
        { upsert: true }
      );

      // emit to recipient if online
      const toSocketId = onlineUsers.get(to);
      if (toSocketId) {
        io.to(toSocketId).emit("private_message", msg);
      }
      // also send ack back to sender (so sender can append)
      socket.emit("message_sent", msg);
    } catch (err) {
      console.error("private_message error", err);
    }
  });

  socket.on("disconnect", () => {
    if (socket.uid) {
      onlineUsers.delete(socket.uid);
      console.log("user disconnected:", socket.uid);
    }
  });
});

// === DB connect and server start ===
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("mongo connected");
    server.listen(PORT, () => console.log("Server started on", PORT));
  })
  .catch(err => {
    console.error("Mongo connect error", err);
  });
