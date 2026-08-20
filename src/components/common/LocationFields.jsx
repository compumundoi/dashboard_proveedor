import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import ubicacionService from "../../services/ubicacionService";

export const UBICACION_VACIA = {
  paisId: null,
  departamentoId: null,
  municipioId: null,
  direccion: "",
};

/**
 * Campos de ubicación estandarizados: País, Departamento, Municipio y Dirección.
 *
 * País queda fijo en Colombia y deshabilitado — es el único país para el que
 * existe catálogo de departamentos y municipios.
 *
 * El componente sólo produce ids. Los nombres en texto los deriva el backend
 * desde el catálogo, para que nadie pueda guardar una ciudad inventada.
 */
const LocationFields = ({
  value,
  onChange,
  errors = {},
  required = false,
  direccionLabel = "Dirección",
  direccionPlaceholder = "Calle 123 #45-67",
  mostrarDireccion = true,
}) => {
  const [pais, setPais] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [cargandoMunicipios, setCargandoMunicipios] = useState(false);
  const [errorCatalogo, setErrorCatalogo] = useState(null);

  // País por defecto y departamentos: una sola vez, el catálogo es estático.
  useEffect(() => {
    let vigente = true;

    Promise.all([
      ubicacionService.obtenerPaisPorDefecto(),
      ubicacionService.obtenerDepartamentos(),
    ])
      .then(([paisPorDefecto, lista]) => {
        if (!vigente) return;
        setPais(paisPorDefecto);
        setDepartamentos(lista);
        setErrorCatalogo(null);

        // El país nunca lo elige el usuario: si el formulario abrió sin él
        // (alta nueva) se completa acá.
        if (value.paisId !== paisPorDefecto.id) {
          onChange({ ...value, paisId: paisPorDefecto.id });
        }
      })
      .catch(() => {
        if (vigente) setErrorCatalogo("No se pudo cargar el catálogo de ubicaciones");
      });

    return () => {
      vigente = false;
    };
    // Sólo al montar: recargar el catálogo en cada cambio de `value` haría
    // una petición por tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Municipios: dependen del departamento elegido.
  useEffect(() => {
    if (value.departamentoId === null) {
      setMunicipios([]);
      return undefined;
    }

    let vigente = true;
    setCargandoMunicipios(true);

    ubicacionService
      .obtenerMunicipios(value.departamentoId)
      .then((lista) => {
        if (!vigente) return;
        setMunicipios(lista);
        setErrorCatalogo(null);
      })
      .catch(() => {
        if (!vigente) return;
        setMunicipios([]);
        setErrorCatalogo("No se pudieron cargar los municipios");
      })
      .finally(() => {
        if (vigente) setCargandoMunicipios(false);
      });

    return () => {
      vigente = false;
    };
  }, [value.departamentoId]);

  const cambiarDepartamento = (crudo) => {
    const departamentoId = crudo === "" ? null : Number(crudo);
    // Cambiar de departamento invalida el municipio: dejarlo colgado
    // guardaría un municipio que no pertenece al departamento mostrado.
    onChange({ ...value, departamentoId, municipioId: null });
  };

  const marca = required ? " *" : "";
  const etiqueta =
    "flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2";

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={etiqueta}>
            <MapPin className="h-4 w-4" />
            <span>País</span>
          </label>
          <input
            type="text"
            value={pais?.nombre ?? "Colombia"}
            readOnly
            disabled
            title="Sólo se opera en Colombia"
            className="input w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className={etiqueta}>
            <MapPin className="h-4 w-4" />
            <span>{`Departamento${marca}`}</span>
          </label>
          <select
            value={value.departamentoId ?? ""}
            onChange={(e) => cambiarDepartamento(e.target.value)}
            required={required}
            className="input w-full"
          >
            <option value="">Seleccionar departamento...</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
          {errors.departamentoId && (
            <p className="mt-1 text-xs text-red-600">{errors.departamentoId}</p>
          )}
        </div>

        <div>
          <label className={etiqueta}>
            <MapPin className="h-4 w-4" />
            <span>{`Municipio${marca}`}</span>
          </label>
          <select
            value={value.municipioId ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                municipioId: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            required={required}
            disabled={value.departamentoId === null || cargandoMunicipios}
            className="input w-full"
          >
            <option value="">
              {value.departamentoId === null
                ? "Elegí un departamento primero"
                : cargandoMunicipios
                  ? "Cargando..."
                  : "Seleccionar municipio..."}
            </option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          {errors.municipioId && (
            <p className="mt-1 text-xs text-red-600">{errors.municipioId}</p>
          )}
        </div>
      </div>

      {mostrarDireccion && (
        <div className="mt-4">
          <label className={etiqueta}>
            <MapPin className="h-4 w-4" />
            <span>{`${direccionLabel}${marca}`}</span>
          </label>
          <input
            type="text"
            value={value.direccion}
            onChange={(e) => onChange({ ...value, direccion: e.target.value })}
            placeholder={direccionPlaceholder}
            required={required}
            className="input w-full"
          />
          {errors.direccion && (
            <p className="mt-1 text-xs text-red-600">{errors.direccion}</p>
          )}
        </div>
      )}

      {errorCatalogo && (
        <p className="mt-2 text-xs text-red-600">{errorCatalogo}</p>
      )}
    </div>
  );
};

export default LocationFields;
