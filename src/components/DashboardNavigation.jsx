import React from 'react';
import { 
  Settings, 
  Calendar, 
  Users, 
  Building,
  UtensilsCrossed,
  Star,
  Bus
} from 'lucide-react';

const DashboardNavigation = ({ activeSection, onSectionChange, userType }) => {
  const getIcon = (section) => {
    switch (section) {
      case 'servicios':
        return <Settings className="h-5 w-5" />;
      case 'reservas':
        return <Calendar className="h-5 w-5" />;
      case 'clientes':
        return <Users className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getTypeIcon = () => {
    switch (userType) {
      case 'hotel':
        return <Building className="h-6 w-6 text-white" />;
      case 'restaurante':
        return <UtensilsCrossed className="h-6 w-6 text-white" />;
      case 'tour':
        return <Star className="h-6 w-6 text-white" />;
      case 'transporte':
        return <Bus className="h-6 w-6 text-white" />;
      default:
        return <Settings className="h-6 w-6 text-white" />;
    }
  };

  const getTypeColor = () => {
    switch (userType) {
      case 'hotel':
        return 'bg-primary';
      case 'restaurante':
        return 'bg-complementary-2';
      case 'tour':
        return 'bg-complementary-1';
      case 'transporte':
        return 'bg-complementary-2';
      default:
        return 'bg-primary';
    }
  };

  const getTypeName = () => {
    switch (userType) {
      case 'hotel':
        return 'Hotel';
      case 'restaurante':
        return 'Restaurante';
      case 'tour':
        return 'Experiencias';
      case 'transporte':
        return 'Transporte';
      default:
        return 'Dashboard';
    }
  };

  const sections = [
    { id: 'servicios', name: 'Servicios' },
    { id: 'reservas', name: 'Reservas' },
    { id: 'clientes', name: 'Mayoristas' }
  ];

  return (
    <div className="bg-white shadow-soft border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con tipo de dashboard */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${getTypeColor()} rounded-lg`}>
              {getTypeIcon()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard {getTypeName()}</h1>
              <p className="text-sm text-gray-600">Gestión integral de servicios</p>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex space-x-8 py-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {getIcon(section.id)}
              <span>{section.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
