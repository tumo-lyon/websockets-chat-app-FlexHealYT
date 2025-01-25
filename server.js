import { createServer } from "node:http";
import express from "express";
import { Server as SocketServer } from "socket.io";

const app = express();

const server = createServer(app);

const io = new SocketServer(server);

let writers = new Set();

app.use(express.static("public"));

// req = request ; res = response
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

io.on("connection", (socket) => {
  const ip_adress = socket.conn.remoteAddress.replace("::ffff:", "");
  io.emit("system_message", {
    content: `${ip_adress} just connected`,
  });

  io.on("disconnect", () => {
    io.emit("system_message", {
      content: `${ip_adress} just disconnected`,
    });
    // Remove the user from the writers array if they were typing
    writers = writers.filter((writer) => writer !== ip_address);
    io.emit("typing", writers);
  });

  socket.on("user_message_send", (data) => {
    const now = new Date();
    for (const [id, sock] of io.sockets.sockets) {
      sock.emit("user_message", {
        author: ip_adress,
        content: data.content,
        time: `${now.getHours()}:${now.getMinutes()}`,
        isMe: id === socket.id,
      });
    }
  });

  socket.on("typing_start", () => {
    writers.add(ip_adress)
    io.emit("typing", Array.from(writers));
  });
  
  socket.on("typing_stop", () => {
    writers.delete(ip_adress)
    io.emit("typing", Array.from(writers));
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
