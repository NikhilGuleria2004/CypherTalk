//socket.js

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL // Add environment variable support
    ],
  },
});

const userSocketMap = {}; 

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Video Chat Signaling Events with more error checking
  socket.on("call-user", (data) => {
    const targetSocketId = userSocketMap[data.targetUserId];
    if (!targetSocketId) {
      socket.emit("call-error", { message: "User not online" });
      return;
    }
    
    io.to(targetSocketId).emit("incoming-call", {
      callerId: data.callerId,
      callerName: data.callerName,
      signal: data.signal
    });
  });

  socket.on("accept-call", (data) => {
    const callerSocketId = userSocketMap[data.callerId];
    if (!callerSocketId) {
      socket.emit("call-error", { message: "Caller disconnected" });
      return;
    }

    io.to(callerSocketId).emit("call-accepted", {
      signal: data.signal,
      receiverId: data.receiverId
    });
  });

  socket.on("signal", (data) => {
    const targetSocketId = userSocketMap[data.targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("signal", {
        signal: data.signal,
        senderId: data.senderId
      });
    }
  });

  socket.on("end-call", (data) => {
    const targetSocketId = userSocketMap[data.targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended", {
        senderId: data.senderId
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };