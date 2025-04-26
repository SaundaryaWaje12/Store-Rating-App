import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "../config";

const AuthContext = createContext();

export const useAuth = () => {
	return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkLoggedIn = async () => {
			try {
				const token = localStorage.getItem("token");
				if (token) {
					axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
					const response = await axios.get(`${API_URL}/auth/me`);
					setCurrentUser(response.data);
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				localStorage.removeItem("token");
				delete axios.defaults.headers.common["Authorization"];
			} finally {
				setLoading(false);
			}
		};

		checkLoggedIn();
	}, []);

	const login = async (email, password) => {
		try {
			const response = await axios.post(`${API_URL}/auth/login`, {
				email,
				password,
			});

			const { token, user } = response.data;
			localStorage.setItem("token", token);
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			setCurrentUser(user);
			return { success: true, user };
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Login failed",
			};
		}
	};

	const register = async (userData) => {
		try {
			const response = await axios.post(`${API_URL}/auth/register`, userData);
			return { success: true, data: response.data };
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Registration failed",
			};
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		delete axios.defaults.headers.common["Authorization"];
		setCurrentUser(null);
	};

	const updatePassword = async (currentPassword, newPassword) => {
		try {
			const response = await axios.put(`${API_URL}/auth/update-password`, {
				currentPassword,
				newPassword,
			});
			return { success: true, message: response.data.message };
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Password update failed",
			};
		}
	};

	const value = {
		currentUser,
		loading,
		login,
		register,
		logout,
		updatePassword,
		isAdmin: currentUser?.role === "admin",
		isStoreOwner: currentUser?.role === "store_owner",
		isUser: currentUser?.role === "user",
	};

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
