import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  Bus,
  Clock,
  Shield,
  Snowflake,
  Heart,
  UserCheck,
  Navigation,
  Milestone
} from 'lucide-react';

const ViewTransportServiceModal = ({ isOpen, onClose, service }) => {
  if (!isOpen || !service) return null;

  // Parsear detalles del servicio de transporte
  const parsearDetallesTransporte = (detallesString) => {
    try {
      return JSON.parse(detallesString);
    } catch (error) {
      console.error('Error al parsear detalles del transporte:', error);
      return {};
    }
  };

  const detalles = parsearDetallesTransporte(service.detalles_del_servicio || '{}');

  const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Etiquetas legibles de las casillas guardadas con nombre técnico.
  const ETIQUETAS = {
    aire_acondicionado: 'Aire acondicionado',
    wifi: 'WiFi',
    silla_bebe: 'Silla para bebé',
    equipaje_extra: 'Equipaje extra'
  };

  const etiquetaDe = (clave) =>
    ETIQUETAS[clave] || clave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{service.nombre}</h2>
              <p className="text-sm text-gray-600">{service.tipo_servicio}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(service.precio, service.moneda)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="font-semibold text-gray-900">
                        {service.ciudad}, {service.departamento}
                      </p>
                      {service.ubicacion && (
                        <p className="text-sm text-gray-600">{service.ubicacion}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Relevancia</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.relevancia === 'ALTA' ? 'bg-red-100 text-red-800' :
                        service.relevancia === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {service.relevancia}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`h-5 w-5 rounded-full ${service.activo ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className="font-semibold text-gray-900">
                        {service.activo ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Fechas</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha de creación</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(service.fecha_creacion)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Última actualización</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(service.fecha_actualizacion)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {service.descripcion}
            </p>
          </div>

          {/* Detalles del servicio */}
          {detalles && Object.keys(detalles).length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Detalles del Transporte</h3>

              {/* Vehículo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {detalles.tipo_vehiculo && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bus className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-600 font-medium">Tipo de Vehículo</p>
                    </div>
                    <p className="text-blue-900 font-semibold">{detalles.tipo_vehiculo}</p>
                  </div>
                )}

                {detalles.modelo && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bus className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">Modelo</p>
                    </div>
                    <p className="text-green-900 font-semibold">{detalles.modelo}</p>
                  </div>
                )}

                {detalles.placa && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <p className="text-sm text-purple-600 font-medium">Placa</p>
                    </div>
                    <p className="text-purple-900 font-semibold">{detalles.placa}</p>
                  </div>
                )}
              </div>

              {/* Capacidad y duración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detalles.capacidad > 0 && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm text-indigo-600 font-medium">Capacidad</p>
                    </div>
                    <p className="text-indigo-900 font-semibold">{detalles.capacidad} pasajeros</p>
                  </div>
                )}

                {detalles.duracion && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-orange-600 font-medium">Duración del Trayecto</p>
                    </div>
                    <p className="text-orange-900 font-semibold">{detalles.duracion}</p>
                  </div>
                )}
              </div>

              {/* Ruta */}
              {(detalles.origen || detalles.destino || detalles.punto_de_recogida) && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Milestone className="h-4 w-4 text-primary" />
                    <span>Ruta</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detalles.origen && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium mb-1">Origen</p>
                        <p className="text-blue-900">{detalles.origen}</p>
                      </div>
                    )}
                    {detalles.destino && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600 font-medium mb-1">Destino</p>
                        <p className="text-green-900">{detalles.destino}</p>
                      </div>
                    )}
                  </div>
                  {detalles.punto_de_recogida && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <Navigation className="h-4 w-4 text-gray-600" />
                        <p className="text-sm text-gray-600 font-medium">Punto de Recogida</p>
                      </div>
                      <p className="text-gray-900">{detalles.punto_de_recogida}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ¿Qué incluye? */}
              {detalles.incluye && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>¿Qué Incluye?</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(detalles.incluye).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${value ? 'text-green-700' : 'text-red-700'}`}>
                          {etiquetaDe(key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comodidades */}
              {detalles.comodidades && Object.values(detalles.comodidades).some(value => value) && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Snowflake className="h-4 w-4 text-primary" />
                    <span>Comodidades</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(detalles.comodidades).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-purple-700">{etiquetaDe(key)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Disponibilidad */}
              {detalles.disponibilidad && (detalles.disponibilidad.fechas || detalles.disponibilidad.horarios) && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Disponibilidad</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detalles.disponibilidad.fechas && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium mb-1">Fechas</p>
                        <p className="text-blue-900">{detalles.disponibilidad.fechas}</p>
                      </div>
                    )}
                    {detalles.disponibilidad.horarios && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600 font-medium mb-1">Horarios</p>
                        <p className="text-green-900">{detalles.disponibilidad.horarios}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pet friendly */}
              {detalles.pet_friendly && (
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-sm text-gray-700">Pet Friendly</span>
                </div>
              )}

              {/* Observaciones */}
              {detalles.observaciones && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span>Observaciones</span>
                  </h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{detalles.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
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

export default ViewTransportServiceModal;
