// /components/waterusage/WaterUsageAlerts.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// Alert data structure from backend:
// - id: number (unique identifier)
// - alert_type: enum ('warning', 'info', 'success')
// - title: string (alert title)
// - description: string (detailed explanation)
// - severity: enum ('low', 'medium', 'high')
// - created_at: timestamp (when alert was generated)
// ========================================================================

// ====================== AI MODEL INTEGRATION NOTES ======================
// Alerts are valuable for:
// - Training anomaly detection models
// - Classification of alert types for automated response
// - Pattern recognition in recurring alerts
// - Predictive modeling for future alerts
// ========================================================================

/**
 * Water Usage Alerts Component
 * 
 * Displays system alerts and recommendations for water usage optimization.
 * Alerts are color-coded by severity level for quick identification.
 * 
 * @returns JSX element representing the alerts display
 */
export const WaterUsageAlerts = () => {
  // Sample alert data - in production, this would come from API
  const alerts = [
    { 
      id: 1, 
      type: 'warning', 
      title: 'High Water Usage', 
      description: 'Field 3 is using 25% more water than average', 
      severity: 'high' 
    },
    { 
      id: 2, 
      type: 'info', 
      title: 'Maintenance Required', 
      description: 'Sprinkler system needs cleaning', 
      severity: 'medium' 
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'Efficiency Improved', 
      description: 'Drip irrigation increased efficiency by 12%', 
      severity: 'low' 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Water Usage Alerts</CardTitle>
        <CardDescription>Notifications about potential issues or opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Each alert item */}
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'border-red-500 bg-red-50/50' :
              alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50/50' :
              'border-green-500 bg-green-50/50'
            }`}>
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                </div>
                
                {/* Severity badge with fixed variant mapping */}
                <Badge variant={alert.severity === 'high' ? 'destructive' : 
                         alert.severity === 'medium' ? 'secondary' : 'default'}>
                  {alert.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};