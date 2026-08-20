import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Loader, 
  Building, 
  DollarSign, 
  FileText, 
  Star, 
  Bed, 
  Users, 
  Wifi, 
  Coffee, 
  Car, 
  Shield, 
  Tv, 
  Waves, 
  Heart, 
  Phone, 
  Zap, 
  Clock, 
  Calendar,
  Plane,
  Activity,
  Dumbbell
} from 'lucide-react';
import servicesService from '../../services/servicesService';
import Swal from 'sweetalert2';
import LocationFields, { UBICACION_VACIA } from '../common/LocationFields';

const EditServiceModal = ({ isOpen, onClose, onServiceUpdated, service }) => {
  const [loading, setLoading] = useState(false);
  // La ubicacion vive aparte del resto del formulario: son ids del
  // catalogo, no texto. Al enviar se vuelca sobre el payload.
  const [ubicacion, setUbicacion] = useState(UBICACION_VACIA);

  const [formData, setFormData] = useState({
    // Datos básicos del servicio
    nombre: '',
    descripcion: '',
    precio: '',
    moneda: 'COP',
    ciudad: '',
    departamento: '',
    ubicacion: '',
    relevancia: 'MEDIA',
    activo: true,
    
    // Detalles específicos del hotel
    tipoAlojamiento: 'Hotel',
    habitacion: 'Estándar',
    capacidad: 2,
    
    // Servicios incluidos
    desayuno: false,
    wifi: false,
    aireAcondicionado: false,
    tv: false,
    cajaFuerte: false,
    piscina: false,
    parqueadero: false,
    petFriendly: false,
    roomService: false,
    ascensor: false,
    plantaEnergia: false,
    
    // Política de reservas
    checkIn: '15:00',
    checkOut: '12:00',
    cancelaciones: 'Cancelación gratuita hasta 24 horas antes',
    
    // Precios
    precioPorNoche: true,
    precioPorPersona: false,
    paquetesEspeciales: false,
    
    // Extras
    transporteAeropuerto: false,
    actividadesHotel: false,
    spa: false,
    gimnasio: false
  });

  // Cargar datos del servicio cuando se abre el modal
  useEffect(() => {
    if (isOpen && service) {
      // Parsear detalles del servicio
      const detalles = servicesService.parsearDetallesServicio(service.detalles_del_servicio);
      
      // Los registros anteriores al catalogo pueden no tener ids
      // resueltos: ahi los selects abren vacios y hay que reelegir.
      setUbicacion({
        paisId: service.pais_id ?? null,
        departamentoId: service.departamento_id ?? null,
        municipioId: service.municipio_id ?? null,
        direccion: service.ubicacion || '',
      });

      setFormData({
        // Datos básicos
        nombre: service.nombre || '',
        descripcion: service.descripcion || '',
        precio: service.precio?.toString() || '',
        moneda: service.moneda || 'COP',
        ciudad: service.ciudad || '',
        departamento: service.departamento || '',
        ubicacion: service.ubicacion || '',
        relevancia: service.relevancia || 'MEDIA',
        activo: service.activo !== undefined ? service.activo : true,
        
        // Detalles del alojamiento
        tipoAlojamiento: detalles.tipo_alojamiento || 'Hotel',
        habitacion: detalles.habitacion || 'Estándar',
        capacidad: detalles.capacidad || 2,
        
        // Servicios incluidos
        desayuno: detalles.servicios_incluidos?.desayuno || false,
        wifi: detalles.servicios_incluidos?.wifi || false,
        aireAcondicionado: detalles.servicios_incluidos?.aire_acondicionado || false,
        tv: detalles.servicios_incluidos?.tv || false,
        cajaFuerte: detalles.servicios_incluidos?.caja_fuerte || false,
        piscina: detalles.servicios_incluidos?.piscina || false,
        parqueadero: detalles.servicios_incluidos?.parqueadero || false,
        petFriendly: detalles.servicios_incluidos?.pet_friendly || false,
        roomService: detalles.servicios_incluidos?.room_service || false,
        ascensor: detalles.servicios_incluidos?.ascensor || false,
        plantaEnergia: detalles.servicios_incluidos?.planta_energia || false,
        
        // Política de reservas
        checkIn: detalles.politica_reservas?.check_in || '15:00',
        checkOut: detalles.politica_reservas?.check_out || '12:00',
        cancelaciones: detalles.politica_reservas?.cancelaciones || 'Cancelación gratuita hasta 24 horas antes',
        
        // Precios
        precioPorNoche: detalles.precios?.por_noche !== undefined ? detalles.precios.por_noche : true,
        precioPorPersona: detalles.precios?.por_persona || false,
        paquetesEspeciales: detalles.precios?.paquetes_especiales || false,
        
        // Extras
        transporteAeropuerto: detalles.extras?.transporte_aeropuerto || false,
        actividadesHotel: detalles.extras?.actividades_hotel || false,
        spa: detalles.extras?.spa || false,
        gimnasio: detalles.extras?.gimnasio || false
      });
    }
  }, [isOpen, service]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.descripcion || !formData.precio) {
      Swal.fire({
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos obligatorios',
        icon: 'warning',
        confirmButtonColor: '#263DBF'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Construir el objeto de servicio actualizado
      const serviceData = {
        id_servicio: service.id_servicio,
        proveedor_id: service.proveedor_id,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo_servicio: service.tipo_servicio, // Mantener el tipo original
        precio: parseInt(formData.precio),
        moneda: formData.moneda,
        activo: formData.activo,
        fecha_creacion: service.fecha_creacion,
        fecha_actualizacion: new Date().toISOString(),
        relevancia: formData.relevancia,
        // ciudad, departamento y pais los resuelve el backend desde
        // municipio_id: el cliente ya no manda ubicacion en texto.
        municipio_id: ubicacion.municipioId,
        ubicacion: ubicacion.direccion,
        detalles_del_servicio: servicesService.construirDetallesServicio(formData)
      };

      await servicesService.actualizarServicio(service.id_servicio, serviceData);
      
      Swal.fire({
        title: '¡Servicio actualizado!',
        text: 'El servicio ha sido actualizado exitosamente',
        icon: 'success',
        confirmButtonColor: '#263DBF'
      });
      
      onServiceUpdated();
      onClose();
      
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el servicio. Por favor, intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: '#263DBF'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Editar Servicio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4" />
                  <span>Nombre del Servicio *</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Ej: Habitación Estándar"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Precio *</span>
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="input flex-1"
                    placeholder="150000"
                    required
                  />
                  <select
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                    className="input ml-2 w-20"
                  >
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4" />
                <span>Descripción *</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="input w-full"
                placeholder="Describe el servicio..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Star className="h-4 w-4" />
                  <span>Relevancia</span>
                </label>
                <select
                  name="relevancia"
                  value={formData.relevancia}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LocationFields
                value={ubicacion}
                onChange={setUbicacion}
                required
                direccionLabel="Dirección"
                direccionPlaceholder="Calle 100 # 15-20"
              />
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Servicio activo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Detalles del alojamiento */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Bed className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Detalles del Alojamiento</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4" />
                  <span>Tipo de Alojamiento</span>
                </label>
                <select
                  name="tipoAlojamiento"
                  value={formData.tipoAlojamiento}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Hostal">Hostal</option>
                  <option value="Resort">Resort</option>
                  <option value="Glamping">Glamping</option>
                  <option value="Cabaña">Cabaña</option>
                  <option value="Aparta-hotel">Aparta-hotel</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Bed className="h-4 w-4" />
                  <span>Tipo de Habitación</span>
                </label>
                <select
                  name="habitacion"
                  value={formData.habitacion}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="Estándar">Estándar</option>
                  <option value="Suite">Suite</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4" />
                  <span>Capacidad (personas)</span>
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Servicios incluidos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Servicios Incluidos</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { key: 'desayuno', label: 'Desayuno', icon: Coffee },
                { key: 'wifi', label: 'WiFi', icon: Wifi },
                { key: 'aireAcondicionado', label: 'Aire Acondicionado', icon: Activity },
                { key: 'tv', label: 'TV', icon: Tv },
                { key: 'cajaFuerte', label: 'Caja Fuerte', icon: Shield },
                { key: 'piscina', label: 'Piscina', icon: Waves },
                { key: 'parqueadero', label: 'Parqueadero', icon: Car },
                { key: 'petFriendly', label: 'Pet Friendly', icon: Heart },
                { key: 'roomService', label: 'Room Service', icon: Phone },
                { key: 'ascensor', label: 'Ascensor', icon: Activity },
                { key: 'plantaEnergia', label: 'Planta Eléctrica', icon: Zap }
              ].map(service => {
                const IconComponent = service.icon;
                return (
                  <label key={service.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      name={service.key}
                      checked={formData[service.key]}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{service.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Política de reservas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Política de Reservas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4" />
                  <span>Check-in</span>
                </label>
                <input
                  type="time"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4" />
                  <span>Check-out</span>
                </label>
                <input
                  type="time"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Política de Cancelaciones
              </label>
              <textarea
                name="cancelaciones"
                value={formData.cancelaciones}
                onChange={handleInputChange}
                rows={2}
                className="input w-full"
                placeholder="Describe la política de cancelaciones..."
              />
            </div>
          </div>

          {/* Extras */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Servicios Extras</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'transporteAeropuerto', label: 'Transporte Aeropuerto' },
                { key: 'actividadesHotel', label: 'Actividades del Hotel' },
                { key: 'spa', label: 'Spa' },
                { key: 'gimnasio', label: 'Gimnasio' }
              ].map(extra => (
                <label key={extra.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={extra.key}
                    checked={formData[extra.key]}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{extra.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Actualizando...' : 'Actualizar Servicio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;
