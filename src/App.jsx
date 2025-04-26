import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StoreList from "./pages/StoreList";
import UserList from "./pages/UserList";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AddUserForm from "./pages/AddUserForm";

// Route Protection Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import StoreOwnerRoute from "./components/StoreOwnerRoute";

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					{/* Auth Routes */}
					<Route path="/" element={<MainLayout />} />
					<Route element={<AuthLayout />}>
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
					</Route>

					{/* Protected Routes */}
					<Route element={<ProtectedRoute />}>
						<Route element={<MainLayout />}>
							{/* Common Routes */}
							<Route path="/profile" element={<Profile />} />
							<Route path="/stores" element={<StoreList />} />

							{/* Admin Only Routes */}
							<Route element={<AdminRoute />}>
								<Route path="/dashboard" element={<Dashboard />} />
								<Route path="/users" element={<UserList />} />
							</Route>

							{/* Store Owner Only Routes */}
							<Route element={<StoreOwnerRoute />}>
								<Route path="/store-dashboard" element={<Dashboard />} />
							</Route>

							{/* Redirect to appropriate dashboard based on role */}
							<Route path="/" element={<Dashboard />} />
						</Route>
					</Route>

					{/* 404 Route */}
					<Route path="*" element={<NotFound />} />

					<Route path="/highsecureadd" element={<AddUserForm />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
