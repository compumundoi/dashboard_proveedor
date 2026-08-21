import React, { useState } from 'react';
import { X, Save, Bus } from 'lucide-react';
import servicesService from '../../services/servicesService';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';
import { UBICACION_VACIA } from '../common/LocationFields';
import TransportServiceFields, {
  FORMULARIO_VACIO,
  construirDetalles,
} from './TransportServiceFields';

const CreateTransportServiceModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  // La ubicacion vive aparte del resto del formulario: son ids del
  // catalogo, no texto. Al enviar se vuelca sobre el payload.
  const [ubicacion, setUbicacion] = useState(UBICACION_VACIA);
  const [formData, setFormData] = useState(FORMULARIO_VACIO);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre || !formData.descripcion || !formData.precio) {
      Swal.fire({
        icon: 'error',
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos obligatorios',
        confirmButtonColor: '#263DBF'
      });
      return;
    }

    try {
      setLoading(true);

      // Obtener ID del proveedor del JWT
      const token = Cookies.get('access_token');
      const decodedToken = jwtDecode(token);
      const proveedorId = decodedToken.id;

      // Preparar datos para enviar a la API
      const serviceData = {
        proveedor_id: proveedorId,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo_servicio: 'transporte',
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
        detalles_del_servicio: JSON.stringify(construirDetalles(formData))
      };

      await servicesService.crearServicio(serviceData);

      Swal.fire({
        icon: 'success',
        title: 'Servicio creado',
        text: 'El servicio de transporte ha sido creado exitosamente',
        confirmButtonColor: '#263DBF'
      });

      onSuccess();
    } catch (error) {
      console.error('❌ Error al crear servicio de transporte:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al crear el servicio',
        text: error.response?.data?.message || 'Ocurrió un error inesperado',
        confirmButtonColor: '#263DBF'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Servicio de Transporte</h2>
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
          <TransportServiceFields
            formData={formData}
            onInputChange={handleInputChange}
            ubicacion={ubicacion}
            onUbicacionChange={setUbicacion}
          />

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

export default CreateTransportServiceModal;
