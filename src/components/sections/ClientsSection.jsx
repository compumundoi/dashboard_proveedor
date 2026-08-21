import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  DollarSign,
  Loader,
  AlertCircle
} from 'lucide-react';
import reservationsService from '../../services/reservationsService';
import mayoristasService from '../../services/mayoristasService';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';

/**
 * Mayoristas que han reservado los servicios de este proveedor.
 *
 * No hay un endpoint de "clientes del proveedor": la lista se deriva de sus
 * propias reservas agrupadas por mayorista, y el contacto se completa con una
 * consulta por mayorista distinto (suelen ser pocos, no uno por reserva).
 */
const ClientsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mayoristas, setMayoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Obtener id del proveedor del token
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded?.id || null);
      } catch (e) {
        console.error('Error al decodificar token:', e);
      }
    }
  }, []);

  useEffect(() => {
    const cargar = async () => {
      if (!currentUserId) return;
      setLoading(true);
      setError(null);

      try {
        const respuesta = await reservationsService.listarPorProveedor(currentUserId);
        const reservas = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.reservas || respuesta?.data || [];

        const agrupados = agruparPorMayorista(reservas);
        setMayoristas(agrupados);

        // El contacto llega en una segunda tanda: la lista ya se puede ver
        // mientras tanto, y si ms_mayoristas falla la ficha sigue en pie.
        const ids = agrupados.map((m) => m.id).filter(Boolean);
        if (ids.length > 0) {
          const contactos = await mayoristasService.consultarVarios(ids);
          setMayoristas((previos) =>
            previos.map((m) => ({ ...m, contacto: contactos[m.id] || null })),
          );
        }
      } catch (err) {
        console.error('Error al cargar los mayoristas:', err);
        setError('No se pudieron cargar los mayoristas. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [currentUserId]);

  // Noches entre dos fechas "YYYY-MM-DD", comparadas como fechas locales.
  const contarNoches = (inicio, fin) => {
    if (!inicio || !fin) return 1;
    const aFecha = (valor) => {
      const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
      return p ? new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3])) : new Date(valor);
    };
    const noches = Math.round((aFecha(fin) - aFecha(inicio)) / 86400000);
    return noches > 0 ? noches : 1;
  };

  // Total de una reserva con la misma regla que usa el resto del sistema:
  // el alojamiento se cobra por noche y todo lo demás por persona.
  const totalDeReserva = (r) => {
    const precio = Number(r.precio) || 0;
    const cantidad = r.cantidad || r.personas || 1;
    const porRango = ['alojamiento', 'hoteles', 'hotel'].includes(
      String(r.tipo_servicio || '').toLowerCase(),
    );
    const multiplicador = porRango ? contarNoches(r.fecha_inicio, r.fecha_fin) : cantidad;
    return precio * multiplicador;
  };

  const agruparPorMayorista = (reservas) => {
    const porId = new Map();

    reservas.forEach((r) => {
      const id = r.id_mayorista;
      if (!id) return;

      const acumulado = porId.get(id) || {
        id,
        nombre: r.nombre_mayorista || 'Mayorista',
        reservas: 0,
        aprobadas: 0,
        pendientes: 0,
        totalAprobado: 0,
        ultimaReserva: null,
        servicios: new Set(),
        contacto: null,
      };

      const estado = String(r.estado || '').toLowerCase();
      acumulado.reservas += 1;
      if (estado === 'aprobada') {
        acumulado.aprobadas += 1;
        acumulado.totalAprobado += totalDeReserva(r);
      }
      if (estado === 'pendiente') acumulado.pendientes += 1;
      if (r.nombre_servicio) acumulado.servicios.add(r.nombre_servicio);

      const fecha = r.fecha_creacion || r.fecha_inicio;
      if (fecha && (!acumulado.ultimaReserva || fecha > acumulado.ultimaReserva)) {
        acumulado.ultimaReserva = fecha;
      }

      porId.set(id, acumulado);
    });

    return [...porId.values()]
      .map((m) => ({ ...m, servicios: [...m.servicios] }))
      .sort((a, b) => b.reservas - a.reservas);
  };

  const formatearFecha = (valor) => {
    if (!valor) return '—';
    const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    const fecha = soloFecha
      ? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
      : new Date(valor);
    if (isNaN(fecha.getTime())) return '—';
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);

  const iniciales = (nombre) =>
    nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();

  const filtrados = mayoristas.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      m.nombre.toLowerCase().includes(q) ||
      (m.contacto?.email || '').toLowerCase().includes(q) ||
      (m.contacto?.ciudad || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando mayoristas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los mayoristas</h3>
        <p className="text-gray-600 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mayoristas</h2>
          <p className="text-sm text-gray-600">
            Agencias y mayoristas que han reservado tus servicios
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o ciudad..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mayoristas</p>
              <p className="text-2xl font-bold text-gray-900">{mayoristas.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reservas aprobadas</p>
              <p className="text-2xl font-bold text-green-600">
                {mayoristas.reduce((suma, m) => suma + m.aprobadas, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facturado (aprobadas)</p>
              <p className="text-2xl font-bold text-primary">
                {formatearMoneda(mayoristas.reduce((suma, m) => suma + m.totalAprobado, 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filtrados.map((m) => (
          <div key={m.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">{iniciales(m.nombre)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{m.nombre}</h3>
                    {m.contacto?.email && (
                      <p className="text-sm text-gray-600">{m.contacto.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  {m.contacto?.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{m.contacto.telefono}</span>
                    </div>
                  )}
                  {m.contacto?.ciudad && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {m.contacto.ciudad}
                        {m.contacto.departamento ? `, ${m.contacto.departamento}` : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Última reserva: {formatearFecha(m.ultimaReserva)}</span>
                  </div>
                </div>

                {m.servicios.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {m.servicios.map((servicio) => (
                      <span
                        key={servicio}
                        className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                      >
                        {servicio}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cifras del mayorista */}
              <div className="grid grid-cols-3 gap-4 lg:w-80 shrink-0 text-center">
                <div>
                  <p className="text-xs text-gray-500">Reservas</p>
                  <p className="text-lg font-bold text-gray-900">{m.reservas}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pendientes</p>
                  <p className="text-lg font-bold text-yellow-600">{m.pendientes}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Facturado</p>
                  <p className="text-lg font-bold text-primary">
                    {formatearMoneda(m.totalAprobado)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="card text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron mayoristas' : 'Todavía no hay mayoristas'}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Intenta ajustar la búsqueda'
              : 'Cuando un mayorista reserve alguno de tus servicios, aparecerá acá'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientsSection;
