import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OperationalSettingsForm from './OperationalSettingsForm';
import { baseUrl } from '@/constants/baseUrl';

interface Property {
  id: number;
  propertyName: string;
}

export default function PropertyOperationalSettings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [currentSettings, setCurrentSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
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
      setProperties(data);
      if (data.length > 0) {
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
      const data = await response.json();
      setCurrentSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Property</label>
        <Select 
          onValueChange={(value) => setSelectedPropertyId(Number(value))}
          value={selectedPropertyId?.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.propertyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div>Loading settings...</div>
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