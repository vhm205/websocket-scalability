const { createServer } = require("http");
const { Server } = require("socket.io");
const redisStreamAdapter = require("@socket.io/redis-streams-adapter");
const Redis = require("ioredis");
const uuid = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

(async () => {
  const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  const redisAdapter = redisStreamAdapter.createAdapter(redisClient);

  const httpServer = createServer();

  const io = new Server(httpServer, {
		transports: ["websocket", "polling"],
		adapter: redisAdapter,
	});

	io.use(async (socket, next) => {
		const sessionID = socket.handshake.auth.session;
    console.log({ auth: socket.handshake.auth });
		console.log({ sessionID });
    console.log("====================================");

		if (sessionID) {
			// find existing session
			const session = await redisClient.get(`session:${sessionID}`);

			if (session) {
				await redisClient.sadd(
					`session:${sessionID}:sockets`,
					socket.id
				);
				const sockets = await redisClient.smembers(
					`session:${sessionID}:sockets`
				);

        socket.session = {
          id: sessionID,
          sockets,
        };
				return next();
			}
		}

		// create new session
    const newSessionId = uuid.v4();
    socket.session = {
      id: newSessionId,
      sockets: [socket.id],
    }

		await Promise.all([
			redisClient.set(`session:${newSessionId}`, newSessionId),
			redisClient.sadd(`session:${newSessionId}:sockets`, socket.id),
		]);

    socket.emit("sync_session", newSessionId);
		next();
	});

  io.on("connection", async (socket) => {
    console.log("a user connected", socket.id);
    const sockets = await io.fetchSockets();
    console.log({ sockets_length: sockets.length });
    console.log("====================================");

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

    socket.on("disconnect", async () => {
      const sessionId = socket.session.id;
      console.log("user disconnected", socket.id, sessionId);

      await redisClient.srem(`session:${sessionId}:sockets`, socket.id);

      const total = await redisClient.scard(`session:${sessionId}:sockets`);
      if(!total) {
        await redisClient.del(`session:${sessionId}`);
      }
    });
  });

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT);
  console.log(`server socket started on port ${PORT}`);
})()
