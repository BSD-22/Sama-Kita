import { useState, useEffect } from 'react';
import OperationalSettingsForm from './OperationalSettingsForm';
import { baseUrl } from '@/constants/baseUrl';

interface Property {
  id: number;
  propertyName: string;
}

export default function PropertyOperationalSettings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [currentSettings, setCurrentSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      console.log('Selected Property ID:', selectedPropertyId);
      fetchSettings(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    try {
      const response = await fetch(baseUrl + '/properties', {
        headers: {
          'Authorization': `Bearer ${localStorage.access_token}`
        }
      });
      const data = await response.json();
      console.log('Properties loaded:', data);
      setProperties(data);
      if (data.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchSettings = async (propertyId: number) => {
    setLoading(true);
    try {
      const response = await fetch(baseUrl + `/properties/${propertyId}/operational-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw Settings from API:', data);
      
      // Transform the data to ensure all fields are present
      const settings = {
        propertyId: propertyId,
        electricityType: data?.electricityType || 'POSTPAID',
        waterType: data?.waterType || 'POSTPAID',
        internetType: data?.internetType || 'POSTPAID',
        electricityCost: data?.electricityCost ?? 0,
        waterCost: data?.waterCost ?? 0,
        internetCost: data?.internetCost ?? 0,
        electricityDueDay: data?.electricityDueDay ?? 1,
        waterDueDay: data?.waterDueDay ?? 1,
        internetDueDay: data?.internetDueDay ?? 1,
      };
      
      console.log('Transformed Settings:', settings);
      
      setCurrentSettings(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setCurrentSettings(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-6">
        <label className="text-sm font-medium">Select Property</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          value={selectedPropertyId || ''}
          onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.propertyName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        selectedPropertyId && (
          <OperationalSettingsForm 
            propertyId={selectedPropertyId}
            initialSettings={currentSettings}
            onSettingsUpdated={() => fetchSettings(selectedPropertyId)}
          />
        )
      )}
    </div>
  );
}