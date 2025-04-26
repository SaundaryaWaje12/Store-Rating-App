import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import { Users, Store, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
	const { currentUser } = useAuth();
	const [stats, setStats] = useState({
		userCount: 0,
		storeCount: 0,
		ratingCount: 0,
	});
	const [recentStores, setRecentStores] = useState([]);
	const [recentUsers, setRecentUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [storeRatings, setStoreRatings] = useState([]);
	const [avgRating, setAvgRating] = useState(0);
	{
		console.log(avgRating);
	}

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				if (currentUser?.role === "admin") {
					const statsResponse = await axios.get(`${API_URL}/dashboard/stats`);
					const storesResponse = await axios.get(`${API_URL}/stores?limit=5`);
					const usersResponse = await axios.get(`${API_URL}/users?limit=5`);

					setStats(statsResponse.data);
					setRecentStores(storesResponse.data);
					setRecentUsers(usersResponse.data);
				} else if (currentUser?.role === "store_owner") {
					const ratingsResponse = await axios.get(`${API_URL}/stores/ratings`);
					const storeResponse = await axios.get(`${API_URL}/stores/me`);

					setStoreRatings(ratingsResponse.data.ratings);
					setAvgRating(storeResponse.data.avgRating || 0);
				}
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [currentUser]);

	if (loading) {
		return (
			<div className="min-h-[80vh] flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// Admin Dashboard
	if (currentUser?.role === "admin") {
		return (
			<div>
				<h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<StatCard
						title="Total Users"
						value={stats.userCount}
						icon={<Users className="h-6 w-6 text-white" />}
						color="bg-blue-500 text-white"
					/>
					<StatCard
						title="Total Stores"
						value={stats.storeCount}
						icon={<Store className="h-6 w-6 text-white" />}
						color="bg-teal-500 text-white"
					/>
					<StatCard
						title="Total Ratings"
						value={stats.ratingCount}
						icon={<Star className="h-6 w-6 text-white" />}
						color="bg-purple-500 text-white"
					/>
				</div>

				{/* Recent Data */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Recent Stores */}
					<div className="bg-white p-6 rounded-lg shadow-sm">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Recent Stores</h2>
							<Link to="/stores" className="text-blue-600 hover:text-blue-800 text-sm">
								View All
							</Link>
						</div>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Name
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Email
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Rating
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{recentStores.map((store) => (
										<tr key={store.id} className="hover:bg-gray-50">
											<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
												{store.name}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
												{store.email}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm">
												<div className="flex items-center">
													<Star className="h-4 w-4 text-yellow-500 mr-1" />
													<span>
														{typeof store.avgRating === "number"
															? store.avgRating.toFixed(1)
															: "N/A"}
													</span>{" "}
												</div>
											</td>
										</tr>
									))}
									{recentStores.length === 0 && (
										<tr>
											<td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">
												No stores found
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>

					{/* Recent Users */}
					<div className="bg-white p-6 rounded-lg shadow-sm">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Recent Users</h2>
							<Link to="/users" className="text-blue-600 hover:text-blue-800 text-sm">
								View All
							</Link>
						</div>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Name
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Email
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Role
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{recentUsers.map((user) => (
										<tr key={user.id} className="hover:bg-gray-50">
											<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
												{user.name}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
												{user.email}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
												{user.role.replace("_", " ")}
											</td>
										</tr>
									))}
									{recentUsers.length === 0 && (
										<tr>
											<td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">
												No users found
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Store Owner Dashboard
	if (currentUser?.role === "store_owner") {
		return (
			<div>
				<h1 className="text-2xl font-bold mb-6">Store Dashboard</h1>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<StatCard
						title="Average Rating"
						value={parseFloat(avgRating)?.toFixed(1) || "N/A"}
						icon={<Star className="h-6 w-6 text-white" />}
						color="bg-yellow-500 text-white"
					/>

					<StatCard
						title="Total Ratings"
						value={storeRatings.length}
						icon={<Users className="h-6 w-6 text-white" />}
						color="bg-blue-500 text-white"
					/>
				</div>

				{/* Recent Ratings */}
				<div className="bg-white p-6 rounded-lg shadow-sm">
					<h2 className="text-lg font-semibold mb-4">Recent Ratings</h2>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Rating
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Date
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{storeRatings.map((rating) => (
									<tr key={rating.id} className="hover:bg-gray-50">
										<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
											{rating.userName}
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-sm">
											<div className="flex items-center">
												<div className="flex">
													{Array.from({ length: 5 }).map((_, i) => (
														<Star
															key={i}
															className={`h-4 w-4 ${
																i < rating.rating
																	? "text-yellow-500 fill-yellow-500"
																	: "text-gray-300"
															}`}
														/>
													))}
												</div>
											</div>
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
											{new Date(rating.createdAt).toLocaleDateString()}
										</td>
									</tr>
								))}
								{storeRatings.length === 0 && (
									<tr>
										<td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">
											No ratings yet
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}

	// Normal User - Redirect handled in routing
	return null;
};

export default Dashboard;
