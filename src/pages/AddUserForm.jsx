import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; // Assuming you have your API URL defined here

const AddUserForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "",
		// Add other potential fields as needed
	});
	const [message, setMessage] = useState("");
	const [errors, setErrors] = useState({}); // To store validation errors
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Username is required";
		}
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Invalid email format";
		}
		if (!formData.password.trim()) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}
		if (!formData.role.trim()) {
			newErrors.role = "Role is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return; // Stop submission if there are errors
		}

		try {
			const response = await axios.post(`${API_URL}/auth/add-user`, formData);
			setMessage(response.data.message);
			// Optionally redirect the user after successful addition
			// navigate('/admin/users');
			console.log("User added:", response.data.user);
			setFormData({ name: "", email: "", password: "", role: "" }); // Clear form
			setErrors({}); // Clear errors on successful submission
		} catch (error) {
			setMessage(error.response?.data?.message || "Failed to add user.");
			console.error("Error adding user:", error);
		}
	};

	return (
		<div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
			<h2 className="text-2xl font-semibold mb-4">Add New User</h2>
			{message && (
				<div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded">{message}</div>
			)}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
						name:
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
							errors.name ? "border-red-500" : ""
						}`}
						required
					/>
					{errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
				</div>
				<div>
					<label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
						Email:
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
							errors.email ? "border-red-500" : ""
						}`}
						required
					/>
					{errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
				</div>
				<div>
					<label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
						Password:
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
							errors.password ? "border-red-500" : ""
						}`}
						required
					/>
					{errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
				</div>
				<div>
					<label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
						Role:
					</label>
					<input
						type="text"
						id="role"
						name="role"
						value={formData.role}
						onChange={handleChange}
						className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
							errors.role ? "border-red-500" : ""
						}`}
						required
					/>
					{errors.role && <p className="text-red-500 text-xs italic">{errors.role}</p>}
					<p className="text-gray-500 text-xs italic">e.g., 'admin', 'user', 'editor', 'temporary', etc.</p>
				</div>
				{/* Add more input fields here for other user details */}
				<button
					type="submit"
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
				>
					Add User
				</button>
			</form>
		</div>
	);
};

export default AddUserForm;
