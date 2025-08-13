// /components/waterusage/WaterSummaryCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// These summary metrics are typically calculated from water usage records:
// - totalUsage: SUM(usage_m3) for specified time period
// - avgDailyUsage: AVG(daily_usage) over time period
// - efficiency: AVG(efficiency_percentage) over time period
// - alerts: COUNT(alerts) with severity >= threshold
// - savings: Potential savings calculated from efficiency improvements
// ========================================================================

// ====================== AI MODEL INTEGRATION NOTES ======================
// Summary metrics for ML model training:
// - Used as features for anomaly detection models
// - Baseline values for optimization algorithms
// - Target variables for predictive models
// ========================================================================

/**
 * Water Summary Cards Component
 * 
 * Displays key water usage metrics in card format for quick overview.
 * These cards provide at-a-glance insights into farm water consumption.
 * 
 * @param props - Component properties
 * @returns JSX element representing summary cards
 */
interface WaterUsageSummary {
  totalUsage: number;       // Total water usage in cubic meters
  avgDailyUsage: number;    // Average daily usage in cubic meters
  efficiency: number;       // Overall efficiency percentage (0-100)
  alerts: number;           // Number of active alerts
  savings: number;          // Potential water savings in cubic meters
}

interface WaterSummaryCardsProps {
  summary: WaterUsageSummary;  // Data to display in cards
}

export const WaterSummaryCards = ({ summary }: WaterSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Water Usage Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Water Usage</CardTitle>
          <Droplets className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalUsage} m³</div>
          <p className="text-xs text-muted-foreground">This week</p>
        </CardContent>
      </Card>

      {/* Average Daily Usage Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Daily Usage</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.avgDailyUsage} m³</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>

      {/* Efficiency Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.efficiency}%</div>
          <p className="text-xs text-muted-foreground">Optimal target: 90%</p>
        </CardContent>
      </Card>

      {/* Potential Savings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.savings} m³</div>
          <p className="text-xs text-muted-foreground">Per week</p>
        </CardContent>
      </Card>
    </div>
  );
};