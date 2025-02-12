import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { baseUrl } from '@/constants/baseUrl';

type OperationalExpenseType = 'PREPAID' | 'POSTPAID';

interface UtilitySetting {
  type: OperationalExpenseType;
  cost: number;
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

const DUE_DAY_OPTIONS = Array.from({ length: 28 }, (_, i) => i + 1);

export default function OperationalSettingsForm({ propertyId, initialSettings, onSettingsUpdated }: OperationalSettingsFormProps) {
  const [settings, setSettings] = useState<Settings>({
    electricity: { type: 'POSTPAID', cost: 0, dueDay: 1 },
    water: { type: 'POSTPAID', cost: 0, dueDay: 1 },
    internet: { type: 'POSTPAID', cost: 0, dueDay: 1 },
  });

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        electricity: {
          type: initialSettings.electricityType || 'POSTPAID',
          cost: initialSettings.electricityCost || 0,
          dueDay: initialSettings.electricityDueDay || 1,
        },
        water: {
          type: initialSettings.waterType || 'POSTPAID',
          cost: initialSettings.waterCost || 0,
          dueDay: initialSettings.waterDueDay || 1,
        },
        internet: {
          type: initialSettings.internetType || 'POSTPAID',
          cost: initialSettings.internetCost || 0,
          dueDay: initialSettings.internetDueDay || 1,
        },
      });
    }
  }, [initialSettings]);

  const handleTypeChange = (utility: string, type: OperationalExpenseType) => {
    setSettings((prev: Settings) => ({
      ...prev,
      [utility]: { ...prev[utility as keyof typeof prev], type }
    }));
  };

  const handleCostChange = (utility: string, cost: number) => {
    setSettings(prev => ({
      ...prev,
      [utility]: { ...prev[utility as keyof typeof prev], cost }
    }));
  };

  const handleDueDayChange = (utility: string, dueDay: number) => {
    setSettings(prev => ({
      ...prev,
      [utility]: { ...prev[utility as keyof typeof prev], dueDay: Math.min(Math.max(1, dueDay), 28) }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(baseUrl + `/properties/${propertyId}/operational-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.access_token}`
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        await onSettingsUpdated();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(settings).map(([utility, setting]) => (
        <div key={utility} className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="capitalize text-lg font-medium mb-4">{utility}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Type</label>
              <Select 
                value={setting.type}
                onValueChange={(value) => handleTypeChange(utility, value as OperationalExpenseType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREPAID">Owner Pays</SelectItem>
                  <SelectItem value="POSTPAID">Renter Pays</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Monthly Cost</label>
              <Input
                type="number"
                placeholder="Enter monthly cost"
                value={setting.cost}
                onChange={(e) => handleCostChange(utility, parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Due Day of Month</label>
              <Select 
                value={setting.dueDay?.toString() || "1"}
                onValueChange={(value) => handleDueDayChange(utility, parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due day" />
                </SelectTrigger>
                <SelectContent>
                  {DUE_DAY_OPTIONS.map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      Day {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}

      <div className="md:col-span-3 flex justify-end mt-4">
        <Button type="submit">Save Settings</Button>
      </div>
    </form>
  );
} 