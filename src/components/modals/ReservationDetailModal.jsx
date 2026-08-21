import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';

/**
 * Ficha completa de una reserva, en sólo lectura.
 *
 * El proveedor consulta; aprobar o rechazar es del administrador, así que acá
 * no hay ninguna acción que cambie el estado.
 */
const ReservationDetailModal = ({ isOpen, onClose, reservation }) => {
  if (!isOpen || !reservation) return null;

  const r = reservation;

  const formatearFecha = (valor, conHora = false) => {
    if (!valor) return '—';
    // Las fechas "YYYY-MM-DD" no llevan hora: leerlas directo las corre un día
    // en Colombia (UTC-5), así que se arman con los componentes por separado.
    const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    const fecha = soloFecha
      ? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
      : new Date(valor);
    if (isNaN(fecha.getTime())) return '—';

    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(conHora && !soloFecha ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);

  const estados = {
    aprobada: {
      texto: 'Aprobada',
      icono: <CheckCircle className="h-4 w-4" />,
      clase: 'bg-green-100 text-green-800',
    },
    pendiente: {
      texto: 'Pendiente',
      icono: <AlertCircle className="h-4 w-4" />,
      clase: 'bg-yellow-100 text-yellow-800',
    },
    rechazada: {
      texto: 'Rechazada',
      icono: <XCircle className="h-4 w-4" />,
      clase: 'bg-red-100 text-red-800',
    },
  };

  const estado = estados[r.status] || estados.pendiente;

  const estadosDePago = {
    aprobado: 'Pagada por el mayorista',
    pendiente: 'Pendiente de pago',
    rechazado: 'Pago rechazado',
    no_aplica: 'Sin cobro asociado',
  };

  const Dato = ({ icono, etiqueta, children }) => (
    <div className="flex items-start space-x-3">
      <div className="text-gray-400 mt-0.5">{icono}</div>
      <div>
        <p className="text-sm text-gray-600">{etiqueta}</p>
        <p className="font-semibold text-gray-900">{children}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{r.service}</h2>
              <p className="text-sm text-gray-600">Detalle de la reserva</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${estado.clase}`}
            >
              {estado.icono}
              <span>{estado.texto}</span>
            </span>
            {r.serviceType && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {r.serviceType}
              </span>
            )}
            {r.city && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                {r.city}
              </span>
            )}
          </div>

          {/* Quién reservó y cuándo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Solicitante</h3>
              <Dato icono={<Users className="h-5 w-5" />} etiqueta="Mayorista">
                {r.guestName}
              </Dato>
              {r.email && (
                <Dato icono={<FileText className="h-5 w-5" />} etiqueta="Correo">
                  {r.email}
                </Dato>
              )}
              {r.phone && (
                <Dato icono={<FileText className="h-5 w-5" />} etiqueta="Teléfono">
                  {r.phone}
                </Dato>
              )}
              <Dato icono={<Users className="h-5 w-5" />} etiqueta="Personas">
                {r.guests} {r.guests === 1 ? 'persona' : 'personas'}
              </Dato>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Fechas</h3>
              <Dato icono={<Calendar className="h-5 w-5" />} etiqueta="Inicio">
                {formatearFecha(r.checkIn)}
              </Dato>
              <Dato icono={<Calendar className="h-5 w-5" />} etiqueta="Fin">
                {formatearFecha(r.checkOut)}
              </Dato>
              {r.time && (
                <Dato icono={<Clock className="h-5 w-5" />} etiqueta="Hora">
                  {r.time}
                </Dato>
              )}
              <Dato icono={<Clock className="h-5 w-5" />} etiqueta="Solicitada el">
                {formatearFecha(r.createdAt, true)}
              </Dato>
            </div>
          </div>

          {/* Servicio */}
          {(r.description || r.city) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Servicio</h3>
              {r.description && (
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{r.description}</p>
              )}
              {r.city && (
                <Dato icono={<MapPin className="h-5 w-5" />} etiqueta="Ubicación">
                  {r.city}
                </Dato>
              )}
            </div>
          )}

          {/* Importe */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Importe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Precio unitario</p>
                <p className="font-semibold text-gray-900">{formatearMoneda(r.unitPrice)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Se cobra por</p>
                <p className="font-semibold text-gray-900">{r.priceDetail}</p>
              </div>
              <div className="bg-primary bg-opacity-5 p-4 rounded-lg border border-primary border-opacity-20">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="font-bold text-primary text-lg">
                  {formatearMoneda(r.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Estado del cobro */}
          {r.paymentState && r.paymentState !== 'no_aplica' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pago</h3>
              <Dato icono={<CreditCard className="h-5 w-5" />} etiqueta="Estado del cobro">
                {estadosDePago[r.paymentState] || r.paymentState}
              </Dato>
            </div>
          )}

          {/* Observaciones del mayorista */}
          {r.specialRequests && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{r.specialRequests}</p>
            </div>
          )}

          {/* Motivo del rechazo */}
          {r.status === 'rechazada' && r.rejectionReason && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Motivo del rechazo</h3>
              <p className="text-red-700 bg-red-50 p-4 rounded-lg border border-red-100">
                {r.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Aprobar o rechazar la reserva le corresponde a un administrador.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;
