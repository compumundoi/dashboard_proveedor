import axios from "axios";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

class AuthService {
  constructor() {
    this.token = null;
    this.userInfo = null;
  }

  // Realizar login
  async login(email, contraseña) {
    try {
      const response = await axios.post(`${API_BASE_URL}/usuarios/login`, {
        email,
        contraseña,
      });
      // ... (omitted for brevity in replacement chunk but I will handle the whole block)

      const { access_token, token_type } = response.data;

      // Decodificar el JWT
      const decodedToken = jwtDecode(access_token);

      // Calcular la fecha de expiración para la cookie
      const expirationDate = new Date(decodedToken.exp * 1000);

      // Guardar el token en cookies con la fecha de expiración
      // En desarrollo (HTTP) no usar secure, en producción (HTTPS) sí
      const isProduction = window.location.protocol === "https:";
      Cookies.set("access_token", access_token, {
        expires: expirationDate,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
      });

      // Guardar información del usuario
      this.token = access_token;
      this.userInfo = decodedToken;

      return {
        success: true,
        user: decodedToken,
        token: access_token,
      };
    } catch (error) {
      let errorMessage = "Error interno del servidor";

      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "El usuario no existe";
            break;
          case 401:
            errorMessage = "Credenciales incorrectas";
            break;
          case 403:
            errorMessage =
              "El usuario no está activo, comunícate con el administrador";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            break;
          default:
            errorMessage = error.response.data?.detail || "Error desconocido";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = Cookies.get("access_token");

    if (!token) {
      return false;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token expirado, remover cookie
        this.logout();
        return false;
      }

      this.token = token;
      this.userInfo = decodedToken;
      return true;
    } catch (error) {
      // Token inválido, remover cookie
      this.logout();
      return false;
    }
  }

  // Obtener información del usuario actual
  getCurrentUser() {
    if (!this.userInfo && this.isAuthenticated()) {
      const token = Cookies.get("access_token");
      this.userInfo = jwtDecode(token);
    }
    return this.userInfo;
  }

  // Obtener token actual
  getToken() {
    if (!this.token) {
      this.token = Cookies.get("access_token");
    }
    return this.token;
  }

  // Cerrar sesión
  logout() {
    Cookies.remove("access_token");
    this.token = null;
    this.userInfo = null;
  }

  // Obtener datos específicos según tipo de usuario
  async getUserData(userId, userType) {
    try {
      const token = this.getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let endpoint = "";
      switch (userType) {
        case "hotel":
          endpoint = `${API_BASE_URL}/hoteles/consultar/${userId}`;
          break;
        case "restaurante":
          endpoint = `${API_BASE_URL}/restaurantes/consultar/${userId}`;
          break;
        case "tour":
          endpoint = `${API_BASE_URL}/experiencias/consultar/${userId}`;
          break;
        default:
          throw new Error("Tipo de usuario no válido");
      }

      const response = await axios.get(endpoint, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.detail || "Error al obtener datos del usuario",
      };
    }
  }
}

export default new AuthService();
