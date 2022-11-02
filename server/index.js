const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());  // midlleware and recognise the incoming request as json object//

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);   // authentication routes//
app.use("/api/messages", messageRoutes);  // messaging routes//

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {                             // cross origin resource sharing//
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();   // global object in node js, It will store all of our online users //
io.on("connection", (socket) => {   // Here "connection" is an event//
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {   // we will grab the data//
    const sendUserSocket = onlineUsers.get(data.to);   // finding the online users//
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);   // here we are emitting the message to user and our message are stored in db//
    }
  });
});
