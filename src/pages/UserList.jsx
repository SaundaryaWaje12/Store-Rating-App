import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { PlusCircle, Search, User, Star, ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

const UserList = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");
	const [showAddForm, setShowAddForm] = useState(false);
	const [newUser, setNewUser] = useState({
		name: "",
		email: "",
		password: "",
		address: "",
		role: "user",
	});
	const [formErrors, setFormErrors] = useState({});
	const [viewUser, setViewUser] = useState(null);
	console.log(viewUser);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get(`${API_URL}/users`);
				setUsers(response.data);
			} catch (error) {
				console.error("Error fetching users:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleSort = (field) => {
		if (field === sortField) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleAddUser = () => {
		setShowAddForm(true);
		setViewUser(null);
	};

	const handleUserFormChange = (e) => {
		const { name, value } = e.target;
		setNewUser((prev) => ({ ...prev, [name]: value }));
	};

	const validateUserForm = () => {
		const errors = {};

		// Name validation (20-60 characters)
		if (newUser.name.length < 20 || newUser.name.length > 60) {
			errors.name = "Name must be between 20 and 60 characters";
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newUser.email)) {
			errors.email = "Please enter a valid email address";
		}

		// Address validation (max 400 characters)
		if (newUser.address.length > 400) {
			errors.address = "Address must not exceed 400 characters";
		}

		// Password validation (8-16 chars, uppercase, special char)
		if (newUser.password) {
			const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(.{8,16})$/;
			if (!passwordRegex.test(newUser.password)) {
				errors.password =
					"Password must be 8-16 characters with at least one uppercase letter and one special character";
			}
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmitUser = async (e) => {
		e.preventDefault();

		if (!validateUserForm()) {
			return;
		}

		try {
			const response = await axios.post(`${API_URL}/users`, newUser);

			// Add the new user to the list
			setUsers([...users, response.data]);

			// Reset form and close it
			setNewUser({
				name: "",
				email: "",
				password: "",
				address: "",
				role: "user",
			});
			setShowAddForm(false);
		} catch (error) {
			console.error("Error adding user:", error);
		}
	};

	const handleViewUser = (user) => {
		setViewUser(user);
		setShowAddForm(false);
	};

	const filteredUsers = users.filter((user) => {
		if (!searchQuery) return true;

		const query = searchQuery.toLowerCase();
		return (
			user.name.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query) ||
			user.address.toLowerCase().includes(query) ||
			user.role.toLowerCase().includes(query)
		);
	});

	const sortedUsers = [...filteredUsers].sort((a, b) => {
		if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
		if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	const getSortIcon = (field) => {
		if (sortField !== field) return null;
		return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
	};

	if (loading) {
		return (
			<div className="min-h-[80vh] flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
				<h1 className="text-2xl font-bold mb-4 sm:mb-0">Users</h1>

				<div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
					{/* Search */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search users..."
							value={searchQuery}
							onChange={handleSearch}
							className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64"
						/>
					</div>

					{/* Add User Button */}
					<button
						onClick={handleAddUser}
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<PlusCircle className="h-5 w-5 mr-2" />
						Add User
					</button>
				</div>
			</div>

			<div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
				{/* User Table */}
				<div className={`bg-white rounded-lg shadow-sm ${viewUser ? "md:w-2/3" : "w-full"}`}>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
										onClick={() => handleSort("name")}
									>
										<div className="flex items-center">
											Name
											{getSortIcon("name")}
										</div>
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
										onClick={() => handleSort("email")}
									>
										<div className="flex items-center">
											Email
											{getSortIcon("email")}
										</div>
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
										onClick={() => handleSort("role")}
									>
										<div className="flex items-center">
											Role
											{getSortIcon("role")}
										</div>
									</th>
									<th scope="col" className="relative px-6 py-3">
										<span className="sr-only">Actions</span>
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{sortedUsers.map((user) => (
									<tr
										key={user.id}
										className={`hover:bg-gray-50 ${viewUser?.id === user.id ? "bg-blue-50" : ""}`}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
													{user.name.charAt(0)}
												</div>
												<div className="ml-3">
													<div className="text-sm font-medium text-gray-900">{user.name}</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-500">{user.email}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap capitalize">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
							user.role === "admin"
								? "bg-purple-100 text-purple-800"
								: user.role === "store_owner"
								? "bg-green-100 text-green-800"
								: "bg-blue-100 text-blue-800"
						}`}
											>
												{user.role.replace("_", " ")}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<button
												onClick={() => handleViewUser(user)}
												className="text-blue-600 hover:text-blue-900"
											>
												<MoreHorizontal className="h-5 w-5" />
											</button>
										</td>
									</tr>
								))}
								{sortedUsers.length === 0 && (
									<tr>
										<td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
											No users found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Add User Form */}
				{showAddForm && (
					<div className="bg-white p-6 rounded-lg shadow-sm md:w-1/3">
						<h2 className="text-lg font-semibold mb-4">Add New User</h2>

						<form onSubmit={handleSubmitUser} className="space-y-4">
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
									Full Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									required
									value={newUser.name}
									onChange={handleUserFormChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										formErrors.name ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
								/>
								{formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
								<p className="mt-1 text-xs text-gray-500">Must be between 20 and 60 characters</p>
							</div>

							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={newUser.email}
									onChange={handleUserFormChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										formErrors.email ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
								/>
								{formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									required
									value={newUser.password}
									onChange={handleUserFormChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										formErrors.password ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
								/>
								{formErrors.password && (
									<p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
								)}
								<p className="mt-1 text-xs text-gray-500">
									8-16 characters, 1 uppercase letter, 1 special character
								</p>
							</div>

							<div>
								<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
									Address
								</label>
								<textarea
									id="address"
									name="address"
									rows="3"
									required
									value={newUser.address}
									onChange={handleUserFormChange}
									className={`appearance-none block w-full px-3 py-2 border ${
										formErrors.address ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
								/>
								{formErrors.address && (
									<p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
								)}
								<p className="mt-1 text-xs text-gray-500">Maximum 400 characters</p>
							</div>

							<div>
								<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
									Role
								</label>
								<select
									id="role"
									name="role"
									value={newUser.role}
									onChange={handleUserFormChange}
									className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
								>
									<option value="user">Normal User</option>
									<option value="store_owner">Store Owner</option>
									<option value="admin">Admin</option>
								</select>
							</div>

							<div className="flex justify-end space-x-3 pt-2">
								<button
									type="button"
									onClick={() => setShowAddForm(false)}
									className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Add User
								</button>
							</div>
						</form>
					</div>
				)}

				{/* User Details */}
				{viewUser && !showAddForm && (
					<div className="bg-white p-6 rounded-lg shadow-sm md:w-1/3">
						<div className="flex justify-between items-start mb-4">
							<h2 className="text-lg font-semibold">User Details</h2>
							<button onClick={() => setViewUser(null)} className="text-gray-500 hover:text-gray-700">
								&times;
							</button>
						</div>

						<div className="flex flex-col items-center mb-4">
							<div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium mb-2">
								{viewUser.name.charAt(0)}
							</div>
							<h3 className="text-xl font-medium">{viewUser.name}</h3>
							<p className="text-gray-500 capitalize">{viewUser.role.replace("_", " ")}</p>
						</div>

						<div className="space-y-4 mt-6">
							<div>
								<h4 className="text-sm font-medium text-gray-500">Email</h4>
								<p className="mt-1">{viewUser.email}</p>
							</div>

							<div>
								<h4 className="text-sm font-medium text-gray-500">Address</h4>
								<p className="mt-1">{viewUser.address}</p>
							</div>

							{viewUser.role === "store_owner" && (
								<div>
									<h4 className="text-sm font-medium text-gray-500">Store Rating</h4>
									<div className="flex items-center mt-1">
										<Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
										<span>{parseFloat(viewUser.rating)?.toFixed(1) || "N/A"}</span>
									</div>
								</div>
							)}

							<div>
								<h4 className="text-sm font-medium text-gray-500">Joined</h4>
								<p className="mt-1">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default UserList;
