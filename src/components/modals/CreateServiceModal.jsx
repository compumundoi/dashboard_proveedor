import React, { useState } from 'react';
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
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import LocationFields, { UBICACION_VACIA } from '../common/LocationFields';

const CreateServiceModal = ({ isOpen, onClose, onServiceCreated }) => {
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
      
      // Obtener el ID del usuario actual
      const token = Cookies.get('access_token');
      const decoded = jwtDecode(token);
      
      // Construir el objeto de servicio
      const serviceData = {
        proveedor_id: decoded.id,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo_servicio: 'alojamiento',
        precio: parseInt(formData.precio),
        moneda: formData.moneda,
        activo: true,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        relevancia: formData.relevancia,
        // ciudad, departamento y pais los resuelve el backend desde
        // municipio_id: el cliente ya no manda ubicacion en texto.
        municipio_id: ubicacion.municipioId,
        ubicacion: ubicacion.direccion,
        detalles_del_servicio: servicesService.construirDetallesServicio(formData)
      };

      await servicesService.crearServicio(serviceData);
      
      Swal.fire({
        title: '¡Servicio creado!',
        text: 'El servicio ha sido creado exitosamente',
        icon: 'success',
        confirmButtonColor: '#263DBF'
      });
      
      onServiceCreated();
      onClose();
      
    } catch (error) {
      console.error('Error al crear servicio:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el servicio. Por favor, intenta de nuevo.',
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
          <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Servicio</h2>
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

            <LocationFields
              value={ubicacion}
              onChange={setUbicacion}
              required
              direccionLabel="Dirección"
              direccionPlaceholder="Calle 100 # 15-20"
            />
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
              <span>{loading ? 'Creando...' : 'Crear Servicio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceModal;
