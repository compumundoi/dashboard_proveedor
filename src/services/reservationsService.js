import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8018/api/v1";

// Cliente Axios con configuración e interceptores (igual a servicesService)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const reservationsService = {
  // Lista reservas por proveedor
  async listarPorProveedor(idProveedor, pagina = 0, limite = 100) {
    try {
      const url = `/reservas/listar/proveedor/${idProveedor}`;
      const response = await apiClient.get(url, { params: { pagina, limite } });
      return response.data;
    } catch (error) {
      console.error("Error al listar reservas por proveedor:", error);
      console.error("Respuesta de error:", error.response?.data);
      throw error;
    }
  },
};

export default reservationsService;
