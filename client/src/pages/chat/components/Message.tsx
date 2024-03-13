import { FC } from "react";

type Props = {
  content: string;
}

const Message: FC<Props> = ({ content }) => {
	return (
		<>
			<div className="p-3 mb-2 rounded-lg bg-slate-200 dark:text-black">
        {content}
			</div>
		</>
	);
};

export default Message;
