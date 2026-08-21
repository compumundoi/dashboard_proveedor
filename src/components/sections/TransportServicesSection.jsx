import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Image,
  MapPin,
  DollarSign,
  Star,
  Bus
} from 'lucide-react';
import servicesService from '../../services/servicesService';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';
import CreateTransportServiceModal from '../modals/CreateTransportServiceModal';
import EditTransportServiceModal from '../modals/EditTransportServiceModal';
import ViewTransportServiceModal from '../modals/ViewTransportServiceModal';
import PhotoUploadModal from '../modals/PhotoUploadModal';

const TransportServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [currentUser, setCurrentUser] = useState(null);

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoServiceId, setPhotoServiceId] = useState(null);

  // Obtener usuario actual del JWT
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUser({
          id: decodedToken.id,
          email: decodedToken.email,
          tipo_usuario: decodedToken.tipo_usuario
        });
      } catch (error) {
        console.error('❌ Error al decodificar token:', error);
        setError('Error al obtener información del usuario');
      }
    }
  }, []);

  // Cargar servicios cuando se obtiene el usuario
  useEffect(() => {
    if (currentUser?.id) {
      loadServices();
    }
  }, [currentUser]);

  const loadServices = async () => {
    if (!currentUser?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await servicesService.listarServiciosPorProveedor(currentUser.id);

      // Filtrar solo servicios de tipo "transporte"
      const transportServices = (response.servicios || []).filter(
        service => service.tipo_servicio === 'transporte'
      );

      setServices(transportServices);
    } catch (error) {
      console.error('❌ Error al cargar servicios:', error);
      setError('Error al cargar los servicios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar servicios
  const filteredServices = services.filter(service => {
    const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.ciudad || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'todos' ||
                         (filterStatus === 'activo' && service.activo) ||
                         (filterStatus === 'inactivo' && !service.activo);

    return matchesSearch && matchesFilter;
  });

  // Manejar ver servicio
  const handleViewService = async (serviceId) => {
    try {
      const response = await servicesService.consultarServicio(serviceId);
      setSelectedService(response);
      setShowViewModal(true);
    } catch (error) {
      console.error('❌ Error al obtener servicio:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del servicio',
        confirmButtonColor: '#263DBF'
      });
    }
  };

  // Manejar editar servicio
  const handleEditService = async (serviceId) => {
    try {
      const response = await servicesService.consultarServicio(serviceId);
      setSelectedService(response);
      setShowEditModal(true);
    } catch (error) {
      console.error('❌ Error al obtener servicio para editar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del servicio',
        confirmButtonColor: '#263DBF'
      });
    }
  };

  // Manejar eliminar servicio
  const handleDeleteService = async (serviceId, serviceName) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el servicio "${serviceName}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await servicesService.eliminarServicio(serviceId);

        Swal.fire({
          icon: 'success',
          title: 'Servicio eliminado',
          text: 'El servicio ha sido eliminado exitosamente',
          confirmButtonColor: '#263DBF'
        });

        // Recargar servicios
        loadServices();
      } catch (error) {
        console.error('❌ Error al eliminar servicio:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el servicio. Por favor, intenta de nuevo.',
          confirmButtonColor: '#263DBF'
        });
      }
    }
  };

  // Manejar ver fotos
  const handleViewPhotos = (serviceId) => {
    setPhotoServiceId(serviceId);
    setShowPhotoModal(true);
  };

  // Formatear precio
  const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  // Estadísticas rápidas
  const stats = {
    total: services.length,
    activos: services.filter(s => s.activo).length,
    promedioPrecio: services.length > 0 ?
      Math.round(services.reduce((sum, s) => sum + s.precio, 0) / services.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={loadServices}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
            <Bus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Servicios de Transporte</h2>
            <p className="text-gray-600">Gestiona los traslados y rutas que ofreces</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar servicios de transporte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="todos">Todos los servicios</option>
              <option value="activo">Solo activos</option>
              <option value="inactivo">Solo inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de servicios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relevancia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Bus className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay servicios de transporte disponibles
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Comienza creando tu primer traslado o ruta
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Crear Primer Servicio</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id_servicio} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Bus className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {service.nombre}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {service.descripcion}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(service.precio, service.moneda)}
                      </div>
                      <div className="text-sm text-gray-500">{service.moneda}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <div>
                          <div>{service.ciudad}</div>
                          <div className="text-xs text-gray-500">{service.departamento}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.relevancia === 'ALTA' ? 'bg-red-100 text-red-800' :
                        service.relevancia === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {service.relevancia}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewService(service.id_servicio)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Ver servicio"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditService(service.id_servicio)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="Editar servicio"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewPhotos(service.id_servicio)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Ver fotos"
                        >
                          <Image className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id_servicio, service.nombre)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Servicios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Servicios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.promedioPrecio)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de creación */}
      <CreateTransportServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadServices();
        }}
      />

      {/* Modal de edición */}
      <EditTransportServiceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        service={selectedService}
        onSuccess={() => {
          setShowEditModal(false);
          loadServices();
        }}
      />

      {/* Modal de visualización */}
      <ViewTransportServiceModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        service={selectedService}
      />

      {/* Modal de fotos */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        serviceId={photoServiceId}
        onCreated={loadServices}
      />
    </div>
  );
};

export default TransportServicesSection;
