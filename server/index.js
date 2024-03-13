const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();

const io = new Server(httpServer, {
  transports: ["websocket", "polling"],
});

io.on("connection", async (socket) => {
	console.log("a user connected", socket.id);
  const sockets = await io.fetchSockets();
  console.log({ sockets_length: sockets.length });

	socket.use(([event, ...args], next) => {
    if(event === "auth") {
      console.log("Authenticated!");
    }
		next();
	});

	socket.on("send_message", (msg) => {
		console.log("message:", msg);
    io.emit("receive_message", { msg, socketId: socket.id });
	});

	socket.on("ping", (msg) => {
		console.log("ping: ", msg);

    // the client did not acknowledge the event in the given delay
		socket.timeout(5000).emit("pong", (err) => {
      console.log({ err });
		});
	});

	socket.on("error", (err) => {
		if (err && err.message === "unauthorized event") {
			socket.disconnect();
		}
	});

	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
	});
});

httpServer.listen(4000);

console.log("server socket started on port 4000");
