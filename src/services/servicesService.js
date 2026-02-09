import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8016/api/v1";

// Configurar axios con interceptor para incluir el token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token JWT a todas las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      Cookies.remove("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const servicesService = {
  // Listar todos los servicios con paginación
  async listarServicios(pagina = 0, limite = 100) {
    try {
      const response = await apiClient.get("/servicios/listar/", {
        params: { pagina, limite },
      });
      return response.data;
    } catch (error) {
      console.error("Error al listar servicios:", error);
      throw error;
    }
  },

  // Listar servicios por proveedor (hotel)
  async listarServiciosPorProveedor(idProveedor, pagina = 0, limite = 100) {
    console.log("🔧 servicesService.listarServiciosPorProveedor llamado con:", {
      idProveedor,
      pagina,
      limite,
    });
    try {
      const url = `/servicios/proveedor/${idProveedor}`;
      console.log("🔧 URL completa:", `${API_BASE_URL}${url}`);
      console.log("🔧 Parámetros:", { pagina, limite });

      const response = await apiClient.get(url, {
        params: { pagina, limite },
      });

      console.log("🔧 Respuesta exitosa del servicio:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "🔧 Error en servicesService.listarServiciosPorProveedor:",
        error,
      );
      console.error("🔧 Error response:", error.response?.data);
      console.error("🔧 Error status:", error.response?.status);
      throw error;
    }
  },

  // Consultar un servicio específico
  async consultarServicio(idServicio) {
    try {
      const response = await apiClient.get(
        `/servicios/consultar/${idServicio}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al consultar servicio:", error);
      throw error;
    }
  },

  // Crear un nuevo servicio
  async crearServicio(datosServicio) {
    try {
      const response = await apiClient.post("/servicios/crear/", datosServicio);
      return response.data;
    } catch (error) {
      console.error("Error al crear servicio:", error);
      throw error;
    }
  },

  // Actualizar un servicio existente
  async actualizarServicio(idServicio, datosServicio) {
    try {
      const response = await apiClient.put(
        `/servicios/editar/${idServicio}`,
        datosServicio,
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      throw error;
    }
  },

  // Eliminar un servicio
  async eliminarServicio(idServicio) {
    try {
      const response = await apiClient.delete(
        `/servicios/eliminar/${idServicio}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      throw error;
    }
  },

  // Obtener fotos de un servicio
  async obtenerFotosServicio(idServicio) {
    try {
      const response = await apiClient.get(`/fotos/servicios/${idServicio}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener fotos del servicio:", error);
      throw error;
    }
  },

  // Construir el JSON de detalles del servicio para hoteles
  construirDetallesServicio(detalles) {
    return JSON.stringify({
      tipo_alojamiento: detalles.tipoAlojamiento || "Hotel",
      habitacion: detalles.habitacion || "Estándar",
      capacidad: detalles.capacidad || 2,
      servicios_incluidos: {
        desayuno: detalles.desayuno || false,
        wifi: detalles.wifi || false,
        aire_acondicionado: detalles.aireAcondicionado || false,
        tv: detalles.tv || false,
        caja_fuerte: detalles.cajaFuerte || false,
        piscina: detalles.piscina || false,
        parqueadero: detalles.parqueadero || false,
        pet_friendly: detalles.petFriendly || false,
        room_service: detalles.roomService || false,
        ascensor: detalles.ascensor || false,
        planta_energia: detalles.plantaEnergia || false,
      },
      politica_reservas: {
        check_in: detalles.checkIn || "15:00",
        check_out: detalles.checkOut || "12:00",
        cancelaciones:
          detalles.cancelaciones || "Cancelación gratuita hasta 24 horas antes",
      },
      precios: {
        por_noche: detalles.precioPorNoche || true,
        por_persona: detalles.precioPorPersona || false,
        paquetes_especiales: detalles.paquetesEspeciales || false,
      },
      extras: {
        transporte_aeropuerto: detalles.transporteAeropuerto || false,
        actividades_hotel: detalles.actividadesHotel || false,
        spa: detalles.spa || false,
        gimnasio: detalles.gimnasio || false,
      },
    });
  },

  // Parsear el JSON de detalles del servicio
  parsearDetallesServicio(detallesJson) {
    try {
      if (typeof detallesJson === "string") {
        return JSON.parse(detallesJson);
      }
      return detallesJson;
    } catch (error) {
      console.error("Error al parsear detalles del servicio:", error);
      return {};
    }
  },
};

export default servicesService;
