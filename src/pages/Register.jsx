import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Check, X } from "lucide-react";

const Register = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		address: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formErrors, setFormErrors] = useState({});

	const { register } = useAuth();
	const navigate = useNavigate();

	const passwordRequirements = [
		{
			id: "length",
			text: "Between 8 and 16 characters",
			validator: (pass) => pass.length >= 8 && pass.length <= 16,
		},
		{
			id: "uppercase",
			text: "At least one uppercase letter",
			validator: (pass) => /[A-Z]/.test(pass),
		},
		{
			id: "special",
			text: "At least one special character",
			validator: (pass) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass),
		},
	];

	const validateForm = () => {
		const errors = {};

		// Name validation (20-60 characters)
		if (formData.name.length < 8 || formData.name.length > 60) {
			errors.name = "Name must be between 8 and 60 characters";
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			errors.email = "Please enter a valid email address";
		}

		// Address validation (max 400 characters)
		if (formData.address.length > 400) {
			errors.address = "Address must not exceed 400 characters";
		}

		// Password validation
		const passRequirementsFailed = passwordRequirements.filter((req) => !req.validator(formData.password));

		if (passRequirementsFailed.length > 0) {
			errors.password = "Password does not meet requirements";
		}

		// Confirm password
		if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			const { confirmPassword, ...userData } = formData;
			const result = await register(userData);

			if (result.success) {
				setSuccess("Registration successful! You can now log in.");
				setTimeout(() => {
					navigate("/login");
				}, 2000);
			} else {
				setError(result.message);
			}
		} catch (err) {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const checkPasswordRequirement = (requirement) => {
		return requirement.validator(formData.password);
	};

	return (
		<div>
			<h2 className="text-xl font-bold text-center text-gray-900 mb-6">Create your account</h2>

			{error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

			{success && (
				<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700">
						Full Name
					</label>
					<div className="mt-1">
						<input
							id="name"
							name="name"
							type="text"
							required
							value={formData.name}
							onChange={handleChange}
							className={`appearance-none block w-full px-3 py-2 border ${
								formErrors.name ? "border-red-300" : "border-gray-300"
							} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
							placeholder="John Doe"
						/>
						{formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
						<p className="mt-1 text-xs text-gray-500">Must be between 20 and 60 characters</p>
					</div>
				</div>

				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700">
						Email
					</label>
					<div className="mt-1">
						<input
							id="email"
							name="email"
							type="email"
							required
							value={formData.email}
							onChange={handleChange}
							className={`appearance-none block w-full px-3 py-2 border ${
								formErrors.email ? "border-red-300" : "border-gray-300"
							} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
							placeholder="you@example.com"
						/>
						{formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
					</div>
				</div>

				<div>
					<label htmlFor="address" className="block text-sm font-medium text-gray-700">
						Address
					</label>
					<div className="mt-1">
						<textarea
							id="address"
							name="address"
							rows="3"
							required
							value={formData.address}
							onChange={handleChange}
							className={`appearance-none block w-full px-3 py-2 border ${
								formErrors.address ? "border-red-300" : "border-gray-300"
							} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
							placeholder="Your address"
						/>
						{formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
						<p className="mt-1 text-xs text-gray-500">Maximum 400 characters</p>
					</div>
				</div>

				<div>
					<label htmlFor="password" className="block text-sm font-medium text-gray-700">
						Password
					</label>
					<div className="mt-1 relative">
						<input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							required
							value={formData.password}
							onChange={handleChange}
							className={`appearance-none block w-full px-3 py-2 border ${
								formErrors.password ? "border-red-300" : "border-gray-300"
							} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
							placeholder="••••••••"
						/>
						<button
							type="button"
							className="absolute inset-y-0 right-0 pr-3 flex items-center"
							onClick={toggleShowPassword}
						>
							{showPassword ? (
								<EyeOff className="h-5 w-5 text-gray-400" />
							) : (
								<Eye className="h-5 w-5 text-gray-400" />
							)}
						</button>
					</div>

					{/* Password requirements */}
					<div className="mt-2 space-y-2">
						{passwordRequirements.map((req) => (
							<div key={req.id} className="flex items-center">
								{checkPasswordRequirement(req) ? (
									<Check className="h-4 w-4 text-green-500 mr-2" />
								) : (
									<X className="h-4 w-4 text-gray-300 mr-2" />
								)}
								<span
									className={`text-xs ${
										checkPasswordRequirement(req) ? "text-green-700" : "text-gray-500"
									}`}
								>
									{req.text}
								</span>
							</div>
						))}
					</div>
				</div>

				<div>
					<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
						Confirm Password
					</label>
					<div className="mt-1">
						<input
							id="confirmPassword"
							name="confirmPassword"
							type={showPassword ? "text" : "password"}
							required
							value={formData.confirmPassword}
							onChange={handleChange}
							className={`appearance-none block w-full px-3 py-2 border ${
								formErrors.confirmPassword ? "border-red-300" : "border-gray-300"
							} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
							placeholder="••••••••"
						/>
						{formErrors.confirmPassword && (
							<p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
						)}
					</div>
				</div>

				<div>
					<button
						type="submit"
						disabled={loading}
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<span className="flex items-center">
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Creating account...
							</span>
						) : (
							"Create Account"
						)}
					</button>
				</div>
			</form>

			<div className="mt-6">
				<p className="text-center text-sm text-gray-600">
					Already have an account?{" "}
					<Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Register;
