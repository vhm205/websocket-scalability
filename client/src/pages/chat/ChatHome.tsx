import { FC, useEffect, useRef, useState } from "react";
import Message from "./components/Message";
import useSocket from "@/hooks/useSocket";

const ChatHome: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
	const { addListener, removeListener, emitEvent } = useSocket();

  const [messages, setMessages] = useState<string[]>([]);

	useEffect(() => {
		const storedMessages = localStorage.getItem("messages");
		if (storedMessages) {
			setMessages(JSON.parse(storedMessages));
		}
	}, []);

	useEffect(() => {
		addListener(
			"receive_message",
			(payload: { msg: string; socketId: string }) => {
				console.log("Received message:", payload);
				setMessages((prevMessages: string[]) => {
					const newMessages = [...prevMessages, payload.msg];
					localStorage.setItem("messages", JSON.stringify(newMessages));
					return newMessages;
				});
			}
		);

		return () => {
			removeListener("receive_message");
		};
	}, [addListener, removeListener]);

	const sendMessage = () => {
		let msg = "Hello from client!";

		if (inputRef.current?.value) {
			msg = inputRef.current.value;
			inputRef.current.value = "";
			inputRef.current.focus();
		}

		emitEvent("send_message", msg);
	};

	return (
		<>
			<div className="container flex min-h-screen flex-col px-6 py-3">
				<div className="breadcrumbs text-sm">
					<ul>
						<li>
							<a>Admin</a>
						</li>
						<li>Chat</li>
					</ul>
				</div>
				<div className="box-border px-5 py-5 shadow-md">
					<h2 className="text-2xl font-bold">Chat</h2>

					<div className="flex flex-col justify-start min-h-60 max-h-96 mt-5 p-4 bg-slate-400 overflow-auto">
						{messages.map((message, index) => (
							<Message key={index} content={message} />
						))}
					</div>

					<div className="flex justify-end mt-4">
						<input
              ref={inputRef}
							type="text"
							className="input input-borderd input-primary grow max-w-xs mr-2"
						/>
						<button className="btn btn-neutral w-28" onClick={sendMessage}>
							Send
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default ChatHome;
