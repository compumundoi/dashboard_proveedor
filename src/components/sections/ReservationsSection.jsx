import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Loader
} from 'lucide-react';
import reservationsService from '../../services/reservationsService';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';

const ReservationsSection = ({ userType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Obtener id del proveedor del token
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded?.id || decoded?.userId || decoded?.sub || null);
      } catch (e) {
        console.error('Error al decodificar token:', e);
      }
    }
  }, []);

  // Estados reales de una reserva: nace 'pendiente' y un administrador la
  // mueve a 'aprobada' o 'rechazada'. El proveedor solo los consulta.
  const mapStatus = (estadoRaw) => {
    const e = (estadoRaw || '').toString().toLowerCase();
    return ['pendiente', 'aprobada', 'rechazada'].includes(e) ? e : 'pendiente';
  };

  // Normalizar respuesta API a estructura de UI
  const normalizeReservations = (data) => {
    const items = Array.isArray(data) ? data : (data?.reservas || data?.data || []);
    return items.map((r, idx) => {
      const unitPrice = r.precio ? parseFloat(String(r.precio)) : (r.total || r.total_pago ? Number(r.total || r.total_pago) : 0);
      const qty = r.cantidad || r.personas || r.huespedes || 1;
      return {
        id: r.id_reserva ?? r.id ?? idx,
        // Campos del cliente (si existen)
        guestName: r.cliente_nombre || r.nombre_cliente || 'Cliente',
        email: r.cliente_email || '',
        phone: r.cliente_telefono || '',
        // Campos del servicio
        service: r.nombre_servicio || r.servicio_nombre || 'Servicio',
        description: r.descripcion || '',
        serviceType: r.tipo_servicio || '',
        city: r.ciudad || '',
        active: typeof r.activo === 'boolean' ? r.activo : undefined,
        // Fechas y cantidad
        createdAt: r.fecha_creacion || null,
        checkIn: r.fecha_inicio || r.check_in || null,
        checkOut: r.fecha_fin || r.check_out || null,
        guests: qty,
        // Estado
        status: mapStatus(r.estado || r.status),
        // Precios
        unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
        totalAmount: (isNaN(unitPrice) ? 0 : unitPrice) * qty,
        // Observaciones
        specialRequests: r.observaciones || '',
        // Motivo con el que el administrador rechazo la reserva
        rejectionReason: r.motivo_rechazo || '',
        // otros
        time: r.hora || null,
      };
    });
  };

  // Cargar reservas del proveedor
  useEffect(() => {
    const fetchReservations = async () => {
      if (!currentUserId) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await reservationsService.listarPorProveedor(currentUserId);
        const normalized = normalizeReservations(resp);
        setReservations(normalized);
      } catch (err) {
        console.error('Error al cargar reservas:', err);
        setError('No se pudieron cargar las reservas. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [currentUserId]);
  const onlyDate = (value) => {
    if (!value) return '';
    try {
      // Si viene en ISO u otro formato con tiempo, normalizamos a YYYY-MM-DD
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      // Si ya viene como YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      return '';
    } catch {
      return '';
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      reservation.guestName.toLowerCase().includes(q) ||
      reservation.service.toLowerCase().includes(q) ||
      (reservation.description || '').toLowerCase().includes(q) ||
      (reservation.city || '').toLowerCase().includes(q);
    const matchesFilter = filterStatus === 'all' || reservation.status === filterStatus;
    const resDate = onlyDate(reservation.checkIn);
    const matchesDate = !selectedDate || resDate === selectedDate;
    return matchesSearch && matchesFilter && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aprobada':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="h-3 w-3" />
            <span>Aprobada</span>
          </span>
        );
      case 'pendiente':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <AlertCircle className="h-3 w-3" />
            <span>Pendiente</span>
          </span>
        );
      case 'rechazada':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            <XCircle className="h-3 w-3" />
            <span>Rechazada</span>
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateLabel = () => {
    switch (userType) {
      case 'hotel':
        return 'Check-in';
      case 'restaurante':
        return 'Fecha';
      case 'tour':
        return 'Fecha del Tour';
      default:
        return 'Fecha';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar reservas</h3>
        <p className="text-gray-600 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Reservas</h2>
          <p className="text-sm text-gray-600">
            Administra todas las reservas y solicitudes
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nueva Reserva</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o servicio..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="input-field w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="input-field w-full"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900">{filteredReservations.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmadas</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredReservations.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredReservations.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-primary">
                ${filteredReservations.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {filteredReservations.map((r) => (
          <div key={r.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col gap-4">
              {/* Header de la card */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{r.service}</h3>
                    {r.serviceType && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {r.serviceType}
                      </span>
                    )}
                    {r.city && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                        {r.city}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{r.description}</p>
                  )}
                </div>
                <div className="shrink-0">{getStatusBadge(r.status)}</div>
              </div>

              {/* Contenido de la card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {getDateLabel()}: {r.checkIn ? formatDate(r.checkIn) : '—'}
                    {r.checkOut && ` • Fin: ${formatDate(r.checkOut)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{r.guests} {r.guests === 1 ? 'persona' : 'personas'}</span>
                </div>
                <div className="text-right md:text-left">
                  <p className="text-base font-semibold text-gray-900">
                    ${r.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.unitPrice ? `(${r.guests} × $${r.unitPrice.toLocaleString()})` : 'Total'}
                  </p>
                </div>
              </div>

              {r.specialRequests && (
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-700">Observaciones:</strong> {r.specialRequests}
                  </p>
                </div>
              )}

              {r.status === 'rechazada' && r.rejectionReason && (
                <div className="mt-1 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-red-700">
                    <strong>Motivo del rechazo:</strong> {r.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="card text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron reservas
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedDate ? 'Intenta ajustar los filtros de búsqueda' : 'Las reservas aparecerán aquí'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservationsSection;
