import React from 'react';
import {
  DollarSign,
  FileText,
  Star,
  Bus,
  Clock,
  Users,
  Shield,
  Calendar,
  Snowflake,
  UserCheck,
  Navigation,
  Milestone
} from 'lucide-react';
import LocationFields from '../common/LocationFields';

/**
 * Campos del formulario de un servicio de transporte.
 *
 * Crear y editar comparten exactamente el mismo formulario, así que vive en un
 * solo lugar: los dos modales aportan el estado y el envío, esto sólo pinta.
 */
const TransportServiceFields = ({
  formData,
  onInputChange,
  ubicacion,
  onUbicacionChange,
}) => (
  <>
    {/* Información básica */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <FileText className="h-5 w-5 text-primary" />
        <span>Información Básica</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Bus className="h-4 w-4 inline mr-1" />
            Nombre del Servicio *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onInputChange}
            className="input w-full"
            placeholder="Ej: Traslado Aeropuerto - Centro"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Precio *
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={onInputChange}
              className="input flex-1"
              placeholder="150000"
              required
            />
            <select
              name="moneda"
              value={formData.moneda}
              onChange={onInputChange}
              className="input w-20"
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FileText className="h-4 w-4 inline mr-1" />
          Descripción *
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={onInputChange}
          rows={3}
          className="input w-full"
          placeholder="Describe el servicio de transporte que ofreces..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Star className="h-4 w-4 inline mr-1" />
            Relevancia
          </label>
          <select
            name="relevancia"
            value={formData.relevancia}
            onChange={onInputChange}
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
        onChange={onUbicacionChange}
        required
        direccionLabel="Dirección / Punto de Recogida"
        direccionPlaceholder="Calle 100 # 15-20"
      />
    </div>

    {/* Detalles del vehículo */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Bus className="h-5 w-5 text-primary" />
        <span>Detalles del Vehículo</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Bus className="h-4 w-4 inline mr-1" />
            Tipo de Vehículo
          </label>
          <select
            name="tipo_vehiculo"
            value={formData.tipo_vehiculo}
            onChange={onInputChange}
            className="input w-full"
          >
            <option value="">Seleccionar tipo</option>
            <option value="Automóvil">Automóvil</option>
            <option value="Camioneta">Camioneta</option>
            <option value="Van">Van</option>
            <option value="Microbús">Microbús</option>
            <option value="Bus">Bus</option>
            <option value="Lancha">Lancha</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="h-4 w-4 inline mr-1" />
            Modelo
          </label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={onInputChange}
            className="input w-full"
            placeholder="Ej: Toyota Hiace 2022"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Shield className="h-4 w-4 inline mr-1" />
            Placa
          </label>
          <input
            type="text"
            name="placa"
            value={formData.placa}
            onChange={onInputChange}
            className="input w-full"
            placeholder="ABC123"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="h-4 w-4 inline mr-1" />
            Capacidad (pasajeros)
          </label>
          <input
            type="number"
            name="capacidad"
            value={formData.capacidad}
            onChange={onInputChange}
            className="input w-full"
            placeholder="12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="h-4 w-4 inline mr-1" />
            Duración del Trayecto
          </label>
          <input
            type="text"
            name="duracion"
            value={formData.duracion}
            onChange={onInputChange}
            className="input w-full"
            placeholder="Ej: 45 minutos"
          />
        </div>
      </div>
    </div>

    {/* Ruta */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Milestone className="h-5 w-5 text-primary" />
        <span>Ruta</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Navigation className="h-4 w-4 inline mr-1" />
            Origen
          </label>
          <input
            type="text"
            name="origen"
            value={formData.origen}
            onChange={onInputChange}
            className="input w-full"
            placeholder="Aeropuerto El Dorado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Navigation className="h-4 w-4 inline mr-1" />
            Destino
          </label>
          <input
            type="text"
            name="destino"
            value={formData.destino}
            onChange={onInputChange}
            className="input w-full"
            placeholder="Centro Histórico"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Navigation className="h-4 w-4 inline mr-1" />
          Punto de Recogida
        </label>
        <input
          type="text"
          name="punto_de_recogida"
          value={formData.punto_de_recogida}
          onChange={onInputChange}
          className="input w-full"
          placeholder="Puerta 4, sala de llegadas nacionales"
        />
      </div>
    </div>

    {/* Incluye */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <span>¿Qué Incluye?</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="incluye.conductor"
            checked={formData.incluye.conductor}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Conductor</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="incluye.combustible"
            checked={formData.incluye.combustible}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Combustible</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="incluye.peajes"
            checked={formData.incluye.peajes}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Peajes</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="incluye.seguro"
            checked={formData.incluye.seguro}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Seguro</span>
        </label>
      </div>
    </div>

    {/* Comodidades */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Snowflake className="h-5 w-5 text-primary" />
        <span>Comodidades</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="comodidades.aire_acondicionado"
            checked={formData.comodidades.aire_acondicionado}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Aire acondicionado</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="comodidades.wifi"
            checked={formData.comodidades.wifi}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">WiFi</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="comodidades.silla_bebe"
            checked={formData.comodidades.silla_bebe}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Silla para bebé</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="comodidades.equipaje_extra"
            checked={formData.comodidades.equipaje_extra}
            onChange={onInputChange}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Equipaje extra</span>
        </label>
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="pet_friendly"
          checked={formData.pet_friendly}
          onChange={onInputChange}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-sm text-gray-700">Pet Friendly</span>
      </label>
    </div>

    {/* Disponibilidad */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-primary" />
        <span>Disponibilidad</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4 inline mr-1" />
            Fechas Disponibles
          </label>
          <input
            type="text"
            name="disponibilidad.fechas"
            value={formData.disponibilidad.fechas}
            onChange={onInputChange}
            className="input w-full"
            placeholder="Ej: Lunes a Viernes, Fines de semana"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="h-4 w-4 inline mr-1" />
            Horarios
          </label>
          <input
            type="text"
            name="disponibilidad.horarios"
            value={formData.disponibilidad.horarios}
            onChange={onInputChange}
            className="input w-full"
            placeholder="Ej: 5:00 AM - 10:00 PM"
          />
        </div>
      </div>
    </div>

    {/* Información adicional */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <UserCheck className="h-5 w-5 text-primary" />
        <span>Información Adicional</span>
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FileText className="h-4 w-4 inline mr-1" />
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={onInputChange}
          rows={2}
          className="input w-full"
          placeholder="Condiciones de equipaje, tiempos de espera, políticas de cancelación..."
        />
      </div>
    </div>

    {/* Estado */}
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        name="activo"
        checked={formData.activo}
        onChange={onInputChange}
        className="rounded border-gray-300 text-primary focus:ring-primary"
      />
      <label className="text-sm font-medium text-gray-700">
        Servicio activo (visible para los clientes)
      </label>
    </div>
  </>
);

// Estado inicial del formulario, compartido por crear y editar.
export const FORMULARIO_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  moneda: 'COP',
  relevancia: 'MEDIA',
  activo: true,

  tipo_vehiculo: '',
  modelo: '',
  placa: '',
  // La landing valida el número de pasajeros contra "capacidad": el nombre del
  // campo no es libre, tiene que ser exactamente ese.
  capacidad: '',
  duracion: '',
  origen: '',
  destino: '',
  incluye: {
    conductor: false,
    combustible: false,
    peajes: false,
    seguro: false
  },
  comodidades: {
    aire_acondicionado: false,
    wifi: false,
    silla_bebe: false,
    equipaje_extra: false
  },
  disponibilidad: {
    fechas: '',
    horarios: ''
  },
  pet_friendly: false,
  punto_de_recogida: '',
  observaciones: ''
};

// Vuelca el formulario al JSON que guarda `detalles_del_servicio`.
export const construirDetalles = (formData) => ({
  tipo_vehiculo: formData.tipo_vehiculo,
  modelo: formData.modelo,
  placa: formData.placa,
  capacidad: parseInt(formData.capacidad) || 0,
  duracion: formData.duracion,
  origen: formData.origen,
  destino: formData.destino,
  incluye: formData.incluye,
  comodidades: formData.comodidades,
  disponibilidad: formData.disponibilidad,
  pet_friendly: formData.pet_friendly,
  punto_de_recogida: formData.punto_de_recogida,
  observaciones: formData.observaciones
});

export default TransportServiceFields;
