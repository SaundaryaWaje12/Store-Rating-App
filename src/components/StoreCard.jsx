// StoreCard.jsx
import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Star, Edit2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const StoreCard = ({ store, userRating, onRatingChange, refetchStores }) => {
	const { isAdmin, currentUser } = useAuth();
	const [isRating, setIsRating] = useState(false);
	const [rating, setRating] = useState(userRating || 0);
	const [hoverRating, setHoverRating] = useState(0);

	const handleRateClick = () => {
		setIsRating(true);
	};

	const handleRatingSubmit = async (selectedRating) => {
		try {
			await axios.post(`${API_URL}/ratings`, {
				storeId: store.id,
				rating: selectedRating,
			});

			setRating(selectedRating);
			setIsRating(false);

			if (onRatingChange) {
				onRatingChange(store.id, selectedRating);
			}

			if (refetchStores) {
				refetchStores();
			}
		} catch (error) {
			console.error("Error submitting rating:", error);
		}
	};

	const averageRating = !isNaN(store?.avgRating) ? parseFloat(store.avgRating) : null;

	return (
		<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
					<p className="text-sm text-gray-500 mt-1">{store.address}</p>
				</div>
				<div className="flex items-center bg-blue-50 px-2 py-1 rounded">
					<Star className="h-4 w-4 text-yellow-500 mr-1" />

					<span className="font-medium">{averageRating !== null ? averageRating.toFixed(1) : "N/A"}</span>
				</div>
			</div>

			{!isAdmin && !isRating && currentUser?.role === "user" && (
				<div className="mt-4 flex justify-between items-center">
					<div className="flex items-center">
						<span className="text-sm text-gray-700 mr-2">Your rating:</span>
						<div className="flex">
							{[1, 2, 3, 4, 5].map((star) => (
								<Star
									key={star}
									className={`h-5 w-5 ${
										star <= rating ? "text-black-500 fill-yellow-500" : "text-gray-300"
									}`}
								/>
							))}
						</div>
					</div>
					<button
						onClick={handleRateClick}
						className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
					>
						<Edit2 className="h-4 w-4 mr-1" />
						{rating > 0 ? "Edit Rating" : "Rate Store"}
					</button>
				</div>
			)}

			{isRating && (
				<div className="mt-4">
					<p className="text-sm text-gray-700 mb-2">Select your rating:</p>
					<div className="flex space-x-2">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								onClick={() => handleRatingSubmit(star)}
								className="transition-transform transform hover:scale-110"
							>
								<Star
									className={`h-8 w-8 ${
										star <= (hoverRating || rating)
											? "text-yellow-500 fill-yellow-500"
											: "text-gray-300"
									}`}
								/>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default StoreCard;
