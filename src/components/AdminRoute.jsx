import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
	const { currentUser, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return currentUser && currentUser.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
