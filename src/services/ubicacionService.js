import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8021/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// El catálogo es estático: 249 países, 33 departamentos y 1122 municipios que
// no cambian entre sesiones. Se cachea en memoria para que abrir varios
// modales seguidos no dispare varias veces la misma lista.
let cachePaisPorDefecto = null;
const cacheDepartamentos = new Map();
const cacheMunicipios = new Map();

/** País que los formularios dejan fijo y no editable (Colombia). */
export const obtenerPaisPorDefecto = () => {
  if (!cachePaisPorDefecto) {
    cachePaisPorDefecto = apiClient
      .get("/ubicaciones/paises/por-defecto")
      .then((res) => res.data)
      .catch((error) => {
        // Un fallo no debe dejar la caché envenenada: el próximo intento
        // tiene que volver a pedir.
        cachePaisPorDefecto = null;
        throw error;
      });
  }
  return cachePaisPorDefecto;
};

/** Departamentos de un país. Sin argumento devuelve los de Colombia. */
export const obtenerDepartamentos = (paisId) => {
  const clave = paisId === undefined ? "default" : String(paisId);

  if (!cacheDepartamentos.has(clave)) {
    const ruta =
      paisId === undefined
        ? "/ubicaciones/departamentos"
        : `/ubicaciones/departamentos?pais_id=${paisId}`;

    cacheDepartamentos.set(
      clave,
      apiClient
        .get(ruta)
        .then((res) => res.data.departamentos)
        .catch((error) => {
          cacheDepartamentos.delete(clave);
          throw error;
        }),
    );
  }

  return cacheDepartamentos.get(clave);
};

export const obtenerMunicipios = (departamentoId) => {
  if (!cacheMunicipios.has(departamentoId)) {
    cacheMunicipios.set(
      departamentoId,
      apiClient
        .get(`/ubicaciones/municipios?departamento_id=${departamentoId}`)
        .then((res) => res.data.municipios)
        .catch((error) => {
          cacheMunicipios.delete(departamentoId);
          throw error;
        }),
    );
  }

  return cacheMunicipios.get(departamentoId);
};

export const ubicacionService = {
  obtenerPaisPorDefecto,
  obtenerDepartamentos,
  obtenerMunicipios,
};

export default ubicacionService;
