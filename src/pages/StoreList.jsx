// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { API_URL } from '../config';
// import { useAuth } from '../context/AuthContext';
// import StoreCard from '../components/StoreCard';
// import { PlusCircle, Search } from 'lucide-react';

// const StoreList = () => {
//   const { currentUser, isAdmin } = useAuth();
//   const [stores, setStores] = useState([]);
//   const [userRatings, setUserRatings] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newStore, setNewStore] = useState({ name: '', email: '', address: '' });
//   const [formErrors, setFormErrors] = useState({});

//   useEffect(() => {
//     const fetchStores = async () => {
//       try {
//         const storesResponse = await axios.get(`${API_URL}/stores`);
//         setStores(storesResponse.data);

//         if (currentUser?.role === 'user') {
//           // Fetch user's ratings
//           const ratingsResponse = await axios.get(`${API_URL}/ratings/user`);
//           const ratingsMap = {};

//           ratingsResponse.data.forEach(rating => {
//             ratingsMap[rating.storeId] = rating.rating;
//           });

//           setUserRatings(ratingsMap);
//         }
//       } catch (error) {
//         console.error('Error fetching stores:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStores();
//   }, [currentUser]);

//   const handleRatingChange = (storeId, newRating) => {
//     setUserRatings(prev => ({ ...prev, [storeId]: newRating }));

//     // Update the store's average rating
//     setStores(prevStores =>
//       prevStores.map(store => {
//         if (store.id === storeId) {
//           // This is a simplified calculation, the backend would do a proper average
//           return { ...store, avgRating: (store.avgRating || 0) };
//         }
//         return store;
//       })
//     );
//   };

//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const handleAddStore = () => {
//     setShowAddForm(true);
//   };

//   const handleStoreFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewStore(prev => ({ ...prev, [name]: value }));
//   };

//   const validateStoreForm = () => {
//     const errors = {};

//     // Name validation (20-60 characters)
//     if (newStore.name.length < 20 || newStore.name.length > 60) {
//       errors.name = 'Name must be between 20 and 60 characters';
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(newStore.email)) {
//       errors.email = 'Please enter a valid email address';
//     }

//     // Address validation (max 400 characters)
//     if (newStore.address.length > 400) {
//       errors.address = 'Address must not exceed 400 characters';
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmitStore = async (e) => {
//     e.preventDefault();

//     if (!validateStoreForm()) {
//       return;
//     }

//     try {
//       const response = await axios.post(`${API_URL}/stores`, newStore);

//       // Add the new store to the list
//       setStores([...stores, response.data]);

//       // Reset form and close it
//       setNewStore({ name: '', email: '', address: '' });
//       setShowAddForm(false);
//     } catch (error) {
//       console.error('Error adding store:', error);
//     }
//   };

//   const filteredStores = stores.filter(store => {
//     if (!searchQuery) return true;

//     const query = searchQuery.toLowerCase();
//     return (
//       store.name.toLowerCase().includes(query) ||
//       store.address.toLowerCase().includes(query)
//     );
//   });

//   if (loading) {
//     return (
//       <div className="min-h-[80vh] flex justify-center items-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
//         <h1 className="text-2xl font-bold mb-4 sm:mb-0">Stores</h1>

//         <div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
//           {/* Search */}
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by name or address..."
//               value={searchQuery}
//               onChange={handleSearch}
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64"
//             />
//           </div>

//           {/* Add Store Button (Admin only) */}
//           {isAdmin && (
//             <button
//               onClick={handleAddStore}
//               className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               <PlusCircle className="h-5 w-5 mr-2" />
//               Add Store
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Add Store Form */}
//       {showAddForm && (
//         <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
//           <h2 className="text-lg font-semibold mb-4">Add New Store</h2>

//           <form onSubmit={handleSubmitStore} className="space-y-4">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                 Store Name
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 required
//                 value={newStore.name}
//                 onChange={handleStoreFormChange}
//                 className={`appearance-none block w-full px-3 py-2 border ${
//                   formErrors.name ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//               />
//               {formErrors.name && (
//                 <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
//               )}
//               <p className="mt-1 text-xs text-gray-500">
//                 Must be between 20 and 60 characters
//               </p>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 value={newStore.email}
//                 onChange={handleStoreFormChange}
//                 className={`appearance-none block w-full px-3 py-2 border ${
//                   formErrors.email ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//               />
//               {formErrors.email && (
//                 <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
//                 Address
//               </label>
//               <textarea
//                 id="address"
//                 name="address"
//                 rows="3"
//                 required
//                 value={newStore.address}
//                 onChange={handleStoreFormChange}
//                 className={`appearance-none block w-full px-3 py-2 border ${
//                   formErrors.address ? 'border-red-300' : 'border-gray-300'
//                 } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//               />
//               {formErrors.address && (
//                 <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
//               )}
//               <p className="mt-1 text-xs text-gray-500">
//                 Maximum 400 characters
//               </p>
//             </div>

//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={() => setShowAddForm(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Add Store
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {filteredStores.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredStores.map((store) => (
//             <StoreCard
//               key={store.id}
//               store={store}
//               userRating={userRatings[store.id]}
//               onRatingChange={handleRatingChange}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white p-12 rounded-lg shadow-sm text-center">
//           <p className="text-gray-500 text-lg">No stores found</p>
//           {searchQuery && (
//             <p className="text-gray-500 mt-2">
//               Try adjusting your search query
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default StoreList;

// StoreList.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import StoreCard from "../components/StoreCard";
import { PlusCircle, Search } from "lucide-react";

const StoreList = () => {
	const { currentUser, isAdmin } = useAuth();
	const [stores, setStores] = useState([]);
	const [userRatings, setUserRatings] = useState({});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showAddForm, setShowAddForm] = useState(false);
	const [newStore, setNewStore] = useState({ name: "", email: "", address: "" });
	const [formErrors, setFormErrors] = useState({});

	const fetchStores = useCallback(async () => {
		setLoading(true);
		try {
			const storesResponse = await axios.get(`${API_URL}/stores`);
			setStores(storesResponse.data);

			if (currentUser?.role === "user") {
				const ratingsResponse = await axios.get(`${API_URL}/ratings/user`);
				const ratingsMap = {};
				ratingsResponse.data.forEach((rating) => {
					ratingsMap[rating.storeId] = rating.rating;
				});
				setUserRatings(ratingsMap);
			}
		} catch (error) {
			console.error("Error fetching stores:", error);
		} finally {
			setLoading(false);
		}
	}, [currentUser]);

	useEffect(() => {
		fetchStores();
	}, [fetchStores]);

	const handleRatingChange = (storeId, newRating) => {
		setUserRatings((prev) => ({ ...prev, [storeId]: newRating }));
		// The average rating update should happen on the backend
	};

	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleAddStore = () => {
		setShowAddForm(true);
	};

	const handleStoreFormChange = (e) => {
		const { name, value } = e.target;
		setNewStore((prev) => ({ ...prev, [name]: value }));
	};

	const validateStoreForm = () => {
		const errors = {};

		// Name validation (20-60 characters)
		if (newStore.name.length < 20 || newStore.name.length > 60) {
			errors.name = "Name must be between 20 and 60 characters";
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newStore.email)) {
			errors.email = "Please enter a valid email address";
		}

		// Address validation (max 400 characters)
		if (newStore.address.length > 400) {
			errors.address = "Address must not exceed 400 characters";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmitStore = async (e) => {
		e.preventDefault();

		if (!validateStoreForm()) {
			return;
		}

		try {
			const response = await axios.post(`${API_URL}/stores`, newStore);

			// Add the new store to the list
			setStores([...stores, response.data]);

			// Reset form and close it
			setNewStore({ name: "", email: "", address: "" });
			setShowAddForm(false);
		} catch (error) {
			console.error("Error adding store:", error);
		}
	};

	const filteredStores = stores.filter((store) => {
		if (!searchQuery) return true;

		const query = searchQuery.toLowerCase();
		return store.name.toLowerCase().includes(query) || store.address.toLowerCase().includes(query);
	});

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
				<h1 className="text-2xl font-bold mb-4 sm:mb-0">Stores</h1>

				<div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
					{/* Search */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search by name or address..."
							value={searchQuery}
							onChange={handleSearch}
							className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64"
						/>
					</div>

					{/* Add Store Button (Admin only) */}
					{isAdmin && (
						<button
							onClick={handleAddStore}
							className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<PlusCircle className="h-5 w-5 mr-2" />
							Add Store
						</button>
					)}
				</div>
			</div>

			{/* Add Store Form */}
			{showAddForm && (
				<div className="bg-white p-6 rounded-lg shadow-sm mb-6">
					<h2 className="text-lg font-semibold mb-4">Add New Store</h2>

					<form onSubmit={handleSubmitStore} className="space-y-4">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
								Store Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								value={newStore.name}
								onChange={handleStoreFormChange}
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
								value={newStore.email}
								onChange={handleStoreFormChange}
								className={`appearance-none block w-full px-3 py-2 border ${
									formErrors.email ? "border-red-300" : "border-gray-300"
								} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
							/>
							{formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
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
								value={newStore.address}
								onChange={handleStoreFormChange}
								className={`appearance-none block w-full px-3 py-2 border ${
									formErrors.address ? "border-red-300" : "border-gray-300"
								} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
							/>
							{formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
							<p className="mt-1 text-xs text-gray-500">Maximum 400 characters</p>
						</div>

						<div className="flex justify-end space-x-3">
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
								Add Store
							</button>
						</div>
					</form>
				</div>
			)}

			{filteredStores.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredStores.map((store) => (
						<StoreCard
							key={store.id}
							store={store}
							userRating={userRatings[store.id]}
							onRatingChange={handleRatingChange}
							refetchStores={fetchStores}
						/>
					))}
				</div>
			) : (
				<div className="bg-white p-12 rounded-lg shadow-sm text-center">
					<p className="text-gray-500 text-lg">No stores found</p>
					{searchQuery && <p className="text-gray-500 mt-2">Try adjusting your search query</p>}
				</div>
			)}
		</div>
	);
};

export default StoreList;
