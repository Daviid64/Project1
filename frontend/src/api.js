import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.request.use(
  (config) => {
    console.log(`Requête: ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => {
    console.log(`${response.status}`);
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error("Erreur API:", error.response.status, error.response.data);
      
      if (error.response.status === 401 && window.location.pathname !== "/login") {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      
      return Promise.reject(error.response.data);
    }
    
    console.error("Pas de réponse");
    return Promise.reject({ message: "Backend non accessible" });
  }
);

export default API;