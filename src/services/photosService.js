import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8008/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const photosService = {
  async crearFoto({
    servicio_id,
    url,
    descripcion = "",
    orden = 0,
    es_portada = false,
    fecha_subida,
    eliminado = false,
  }) {
    try {
      const payload = {
        servicio_id,
        url,
        descripcion,
        orden,
        es_portada,
        fecha_subida: fecha_subida || new Date().toISOString(),
        eliminado,
      };
      const { data } = await apiClient.post("/fotos/crear/", payload);
      return data;
    } catch (error) {
      console.error("Error al crear foto:", error);
      console.error("Respuesta de error:", error.response?.data);
      throw error;
    }
  },
};

export default photosService;
