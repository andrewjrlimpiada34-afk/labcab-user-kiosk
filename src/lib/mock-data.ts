
import { InventoryItem } from './types';

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Beaker 250ml', category: 'Glassware', stock: 45, icon: 'Beaker' },
  { id: '2', name: 'Erlenmeyer Flask', category: 'Glassware', stock: 30, icon: 'FlaskConical' },
  { id: '3', name: 'Graduated Cylinder', category: 'Glassware', stock: 20, icon: 'Pipette' },
  { id: '4', name: 'Bunsen Burner', category: 'Heating', stock: 12, icon: 'Flame' },
  { id: '5', name: 'Microscope', category: 'Optical', stock: 8, icon: 'Microscope' },
  { id: '6', name: 'Test Tube Rack', category: 'Storage', stock: 25, icon: 'Box' },
  { id: '7', name: 'Stirring Rod', category: 'Tools', stock: 100, icon: 'Scissors' },
  { id: '8', name: 'Thermometer', category: 'Tools', stock: 15, icon: 'Thermometer' },
];

export const MOCK_USER = {
  id: 'USER123',
  name: 'Alex Johnson',
  role: 'student',
  qrCode: 'STUDENT_ALEX_123'
};
