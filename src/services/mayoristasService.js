import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8004/api/v1";

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

const mayoristasService = {
  // Datos de contacto de un mayorista. El prefijo es "/mayorista" en singular:
  // ms_mayoristas expone las dos rutas y ésta es la que resuelve por id.
  async consultar(idMayorista) {
    const response = await apiClient.get(`/mayorista/consultar/${idMayorista}`);
    return response.data;
  },

  // Contacto de varios mayoristas a la vez. Un mayorista que falle no tumba al
  // resto: la ficha se muestra igual, sólo sin sus datos de contacto.
  async consultarVarios(ids) {
    const resultados = await Promise.all(
      ids.map((id) =>
        this.consultar(id)
          .then((datos) => [id, datos])
          .catch(() => [id, null]),
      ),
    );

    return Object.fromEntries(resultados);
  },
};

export default mayoristasService;
