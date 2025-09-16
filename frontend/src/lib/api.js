import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/';

const api = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});

const apiNoAuth = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("ACCESS_TOKEN");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	}, (error) => {
		return Promise.reject(error);
	}
);

const logout = () => {
	localStorage.removeItem("ACCESS_TOKEN");
	localStorage.removeItem("REFRESH_TOKEN");
	localStorage.removeItem("USER");
	window.location.href = "/";
};

export {
	api,
	apiNoAuth,
	logout
}