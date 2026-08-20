import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Loader, 
  ChefHat, 
  DollarSign, 
  FileText, 
  Star, 
  Users, 
  Clock, 
  Utensils,
  Coffee,
  Car,
  Shield,
  Heart,
  Phone,
  Zap,
  Activity,
  Music,
  Wine,
  Gift,
  Accessibility
} from 'lucide-react';
import servicesService from '../../services/servicesService';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import LocationFields, { UBICACION_VACIA } from '../common/LocationFields';

const CreateRestaurantServiceModal = ({ isOpen, onClose, onServiceCreated }) => {
  const [loading, setLoading] = useState(false);
  // La ubicacion vive aparte del resto del formulario: son ids del
  // catalogo, no texto. Al enviar se vuelca sobre el payload.
  const [ubicacion, setUbicacion] = useState(UBICACION_VACIA);

  const [formData, setFormData] = useState({
    // Información básica
    nombre: '',
    descripcion: '',
    precio: '',
    moneda: 'COP',
    ciudad: '',
    departamento: '',
    ubicacion: '',
    relevancia: 'MEDIA',
    activo: true,
    
    // Detalles específicos del restaurante
    tipoEstablecimiento: 'Restaurante gourmet',
    estiloGastronomico: 'Internacional',
    capacidad: '',
    
    // Servicios
    comidaEnMesa: true,
    paraLlevar: false,
    domicilio: false,
    buffet: false,
    catering: false,
    
    // Horarios
    desayuno: false,
    almuerzo: true,
    cena: false,
    veinticuatroHoras: false,
    
    // Extras
    musicaEnVivo: false,
    catasDeVinos: false,
    maridajes: false,
    menuDegustacion: false,
    
    // Promociones
    happyHour: false,
    descuentosPorGrupo: false,
    menu: false,
    
    // Servicios adicionales
    piscina: false,
    parqueadero: false,
    petFriendly: false,
    roomService: false,
    ascensor: false,
    plantaEnergia: false,
    rampaDiscapacitados: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const construirDetallesRestaurante = (data) => {
    return JSON.stringify({
      tipo_establecimiento: data.tipoEstablecimiento,
      estilo_gastronomico: data.estiloGastronomico,
      capacidad: parseInt(data.capacidad) || 0,
      servicios: {
        comida_en_mesa: data.comidaEnMesa,
        para_llevar: data.paraLlevar,
        domicilio: data.domicilio,
        buffet: data.buffet,
        catering: data.catering
      },
      horarios: {
        desayuno: data.desayuno,
        almuerzo: data.almuerzo,
        cena: data.cena,
        veinticuatro_horas: data.veinticuatroHoras
      },
      extras: {
        musica_en_vivo: data.musicaEnVivo,
        catas_de_vinos: data.catasDeVinos,
        maridajes: data.maridajes,
        menu_degustacion: data.menuDegustacion
      },
      promociones: {
        happy_hour: data.happyHour,
        descuentos_por_grupo: data.descuentosPorGrupo,
        menu: data.menu
      },
      servicios_adicionales: {
        piscina: data.piscina,
        parqueadero: data.parqueadero,
        pet_friendly: data.petFriendly,
        room_service: data.roomService,
        ascensor: data.ascensor,
        planta_energia: data.plantaEnergia,
        rampa_discapacitados: data.rampaDiscapacitados
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        tipo_servicio: 'restaurante',
        precio: parseInt(formData.precio),
        moneda: formData.moneda,
        activo: formData.activo,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        relevancia: formData.relevancia,
        // ciudad, departamento y pais los resuelve el backend desde
        // municipio_id: el cliente ya no manda ubicacion en texto.
        municipio_id: ubicacion.municipioId,
        ubicacion: ubicacion.direccion,
        detalles_del_servicio: construirDetallesRestaurante(formData)
      };

      await servicesService.crearServicio(serviceData);
      
      Swal.fire({
        title: '¡Servicio creado!',
        text: 'El servicio del restaurante ha sido creado exitosamente',
        icon: 'success',
        confirmButtonColor: '#263DBF'
      });
      
      onServiceCreated();
      onClose();
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        moneda: 'COP',
        ciudad: '',
        departamento: '',
        ubicacion: '',
        relevancia: 'MEDIA',
        activo: true,
        tipoEstablecimiento: 'Restaurante gourmet',
        estiloGastronomico: 'Internacional',
        capacidad: '',
        comidaEnMesa: true,
        paraLlevar: false,
        domicilio: false,
        buffet: false,
        catering: false,
        desayuno: false,
        almuerzo: true,
        cena: false,
        veinticuatroHoras: false,
        musicaEnVivo: false,
        catasDeVinos: false,
        maridajes: false,
        menuDegustacion: false,
        happyHour: false,
        descuentosPorGrupo: false,
        menu: false,
        piscina: false,
        parqueadero: false,
        petFriendly: false,
        roomService: false,
        ascensor: false,
        plantaEnergia: false,
        rampaDiscapacitados: false
      });
      
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
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Servicio de Restaurante</h2>
          </div>
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
              <ChefHat className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Utensils className="h-4 w-4" />
                  <span>Nombre del Servicio *</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Ej: Fonda Paisa"
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
                placeholder="Describe el servicio gastronómico..."
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

          {/* Detalles del restaurante */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Utensils className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Detalles del Restaurante</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <ChefHat className="h-4 w-4" />
                  <span>Tipo de Establecimiento</span>
                </label>
                <select
                  name="tipoEstablecimiento"
                  value={formData.tipoEstablecimiento}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="Restaurante gourmet">Restaurante gourmet</option>
                  <option value="Comida rápida">Comida rápida</option>
                  <option value="Cafetería">Cafetería</option>
                  <option value="Bar">Bar</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Utensils className="h-4 w-4" />
                  <span>Estilo Gastronómico</span>
                </label>
                <select
                  name="estiloGastronomico"
                  value={formData.estiloGastronomico}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="Internacional">Internacional</option>
                  <option value="Típica/Regional">Típica/Regional</option>
                  <option value="Vegetariana/Vegana">Vegetariana/Vegana</option>
                  <option value="Fusión">Fusión</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4" />
                  <span>Capacidad (comensales)</span>
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="1"
                  max="500"
                />
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Servicios</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { key: 'comidaEnMesa', label: 'Comida en mesa', icon: Utensils },
                { key: 'paraLlevar', label: 'Para llevar', icon: Coffee },
                { key: 'domicilio', label: 'Domicilio', icon: Car },
                { key: 'buffet', label: 'Buffet', icon: Utensils },
                { key: 'catering', label: 'Catering', icon: ChefHat }
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

          {/* Horarios */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Horarios</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'desayuno', label: 'Desayuno', icon: Coffee },
                { key: 'almuerzo', label: 'Almuerzo', icon: Utensils },
                { key: 'cena', label: 'Cena', icon: ChefHat },
                { key: 'veinticuatroHoras', label: '24 horas', icon: Clock }
              ].map(horario => {
                const IconComponent = horario.icon;
                return (
                  <label key={horario.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      name={horario.key}
                      checked={formData[horario.key]}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{horario.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Extras */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Extras</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'musicaEnVivo', label: 'Música en vivo', icon: Music },
                { key: 'catasDeVinos', label: 'Catas de vinos', icon: Wine },
                { key: 'maridajes', label: 'Maridajes', icon: Wine },
                { key: 'menuDegustacion', label: 'Menú degustación', icon: ChefHat }
              ].map(extra => {
                const IconComponent = extra.icon;
                return (
                  <label key={extra.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      name={extra.key}
                      checked={formData[extra.key]}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{extra.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Promociones */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Promociones</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'happyHour', label: 'Happy hour', icon: Clock },
                { key: 'descuentosPorGrupo', label: 'Descuentos por grupo', icon: Users },
                { key: 'menu', label: 'Menú especial', icon: FileText }
              ].map(promocion => {
                const IconComponent = promocion.icon;
                return (
                  <label key={promocion.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      name={promocion.key}
                      checked={formData[promocion.key]}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{promocion.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Servicios adicionales */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Servicios Adicionales</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'parqueadero', label: 'Parqueadero', icon: Car },
                { key: 'petFriendly', label: 'Pet Friendly', icon: Heart },
                { key: 'roomService', label: 'Room Service', icon: Phone },
                { key: 'ascensor', label: 'Ascensor', icon: Activity },
                { key: 'plantaEnergia', label: 'Planta eléctrica', icon: Zap },
                { key: 'rampaDiscapacitados', label: 'Rampa discapacitados', icon: Accessibility }
              ].map(servicio => {
                const IconComponent = servicio.icon;
                return (
                  <label key={servicio.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      name={servicio.key}
                      checked={formData[servicio.key]}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{servicio.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
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

export default CreateRestaurantServiceModal;
