import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import { AdminLayout } from "@/layouts/admin";
import { NotFound } from "@/pages/error/NotFound";
import { HomePage } from "@/pages/home";
import { Loader } from "@/components/loader";

const ListProduct = lazy(() => import("@/pages/product/ListProduct"));
const CreateProduct = lazy(() => import("@/pages/product/CreateProduct"));
const ChatHome = lazy(() => import("@/pages/chat/ChatHome"));

export const Router = () => {
	return (
		<>
			<Routes>
				<Route path="/" element={<AdminLayout />}>
					<Route index element={<HomePage />} />
					<Route
						path="chat"
						element={
							<Suspense fallback={<Loader />}>
								<ChatHome />
							</Suspense>
						}
					/>
					<Route
						path="create"
						element={
							<Suspense fallback={<Loader />}>
								<CreateProduct />
							</Suspense>
						}
					/>
					<Route
						path="list"
						element={
							<Suspense fallback={<Loader />}>
								<ListProduct />
							</Suspense>
						}
					/>

					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</>
	);
};
