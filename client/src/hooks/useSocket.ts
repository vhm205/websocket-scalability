import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = () => {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<Socket>();

	useEffect(() => {
		socketRef.current = io(`http://35.247.134.118:4000`, {
			transports: ["websocket"],
		});

		const engine = socketRef.current?.io?.engine;
		console.log(engine?.transport?.name); // in most cases, prints "polling"

		engine?.once("upgrade", () => {
			// called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
			console.log(engine.transport.name); // in most cases, prints "websocket"
		});

		socketRef.current.on("connect", () => {
			console.log("Connected to server");
			setIsConnected(true);
		});

		socketRef.current.on("disconnect", () => {
			console.log("Disconnected from server");
			setIsConnected(false);
		});

		socketRef.current.on("connect_error", (error) => {
			console.log("Error connecting to server:", error);
		});

		return () => {
			socketRef.current?.disconnect();
		};
	}, []);

	const addListener = <T>(event: string, callback: (data: T) => void) => {
		socketRef.current?.on(event, callback);
	};

	const removeListener = (event: string) => {
		socketRef.current?.off(event);
	};

	const emitEvent = <T>(event: string, data?: T) => {
		if (socketRef.current?.connected) {
			socketRef.current?.emit(event, data);
		}
	};

	return {
		isConnected,
		socket: socketRef.current,
		emitEvent,
		addListener,
		removeListener,
	};
};

export default useSocket;
