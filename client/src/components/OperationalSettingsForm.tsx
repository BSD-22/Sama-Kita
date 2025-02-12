import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { baseUrl } from '@/constants/baseUrl';
import { useNavigate } from 'react-router';

type OperationalExpenseType = 'PREPAID' | 'POSTPAID';

interface UtilitySetting {
  type: OperationalExpenseType;
  cost: number | null;
  dueDay: number;
}

interface Settings {
  [key: string]: UtilitySetting;
}

interface OperationalSettingsResponse {
  electricityType: OperationalExpenseType;
  waterType: OperationalExpenseType;
  internetType: OperationalExpenseType;
  electricityCost: number | null;
  waterCost: number | null;
  internetCost: number | null;
  electricityDueDay: number;
  waterDueDay: number;
  internetDueDay: number;
}

interface OperationalSettingsFormProps {
  propertyId: number;
  initialSettings: OperationalSettingsResponse | null;
  onSettingsUpdated: () => Promise<void>;
}

export default function OperationalSettingsForm({ propertyId, initialSettings, onSettingsUpdated }: OperationalSettingsFormProps) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({
    electricity: { type: 'POSTPAID', cost: 0, dueDay: 1 },
    water: { type: 'POSTPAID', cost: 0, dueDay: 1 },
    internet: { type: 'POSTPAID', cost: 0, dueDay: 1 },
  });

  useEffect(() => {
    console.log('Initial settings:', initialSettings);
    if (initialSettings) {
      setSettings({
        electricity: {
          type: initialSettings.electricityType,
          cost: initialSettings.electricityCost,
          dueDay: initialSettings.electricityDueDay,
        },
        water: {
          type: initialSettings.waterType,
          cost: initialSettings.waterCost,
          dueDay: initialSettings.waterDueDay,
        },
        internet: {
          type: initialSettings.internetType,
          cost: initialSettings.internetCost,
          dueDay: initialSettings.internetDueDay,
        },
      });
    }
  }, [initialSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting settings:', settings);
      const response = await fetch(baseUrl + `/properties/${propertyId}/operational-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.access_token}`
        },
        body: JSON.stringify({
          electricityType: settings.electricity.type,
          waterType: settings.water.type,
          internetType: settings.internet.type,
          electricityCost: Number(settings.electricity.cost),
          waterCost: Number(settings.water.cost),
          internetCost: Number(settings.internet.cost),
          electricityDueDay: Number(settings.electricity.dueDay),
          waterDueDay: Number(settings.water.dueDay),
          internetDueDay: Number(settings.internet.dueDay),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      console.log('Settings updated successfully:', data);
      await onSettingsUpdated();
      navigate(`/expenses/maintenance/operational`);
    } catch (error) {
      console.error('Error updating settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings. Please try again.';
      alert(errorMessage);
    }
  };

  const handleTypeChange = (utility: string, type: OperationalExpenseType) => {
    setSettings(prev => ({
      ...prev,
      [utility]: { ...prev[utility as keyof typeof prev], type }
    }));
  };

  const handleCostChange = (utility: string, value: string) => {
    const cost = value === '' ? null : Math.max(0, parseInt(value) || 0);
    setSettings(prev => ({
      ...prev,
      [utility]: { ...prev[utility as keyof typeof prev], cost }
    }));
  };

  const handleDueDayChange = (utility: string, value: string) => {
    const dueDay = Math.min(Math.max(1, parseInt(value) || 1), 28);
    setSettings(prev => ({
      ...prev,
      [utility]: { ...prev[utility as keyof typeof prev], dueDay }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(settings).map(([utility, setting]) => (
          <div key={utility} className="p-4 border rounded-lg">
            <h3 className="capitalize text-lg font-medium mb-3">{utility}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Payment Type</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={setting.type}
                  onChange={(e) => handleTypeChange(utility, e.target.value as OperationalExpenseType)}
                >
                  <option value="PREPAID">Owner Pays</option>
                  <option value="POSTPAID">Renter Pays</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Monthly Cost</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  min="0"
                  value={setting.cost ?? ''}
                  onChange={(e) => handleCostChange(utility, e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Due Day</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={setting.dueDay}
                  onChange={(e) => handleDueDayChange(utility, e.target.value)}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>Day {day}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Settings</Button>
      </div>
    </form>
  );
}