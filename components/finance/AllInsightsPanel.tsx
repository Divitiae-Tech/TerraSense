// components/finance/AIInsightsPanel.tsx
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AIInsightsPanel = () => {
  // 📌 AI integration placeholder — This will later use Gemini or GPT to provide insights
  // Example: "Your maize yield is below average due to low rainfall, consider irrigation"
  const insights = [
    {
      type: "optimization",
      icon: "💡",
      title: "Cost Optimization Opportunity",
      message: "Based on your current expenses, reducing fertilizer costs by 10% could increase your net profit by R2,500 next season.",
      priority: "medium"
    },
    {
      type: "warning",
      icon: "⚠️",
      title: "High Expense Alert",
      message: "Your fuel costs have increased by 25% this month. Consider optimizing equipment routes or maintenance.",
      priority: "high"
    },
    {
      type: "opportunity",
      icon: "🎯",
      title: "Market Opportunity",
      message: "Soybean prices are predicted to rise 15% next quarter. Consider expanding soybean cultivation.",
      priority: "medium"
    },
    {
      type: "seasonal",
      icon: "🌤️",
      title: "Seasonal Insight",
      message: "Based on weather patterns, optimal planting window for maize is in 2 weeks.",
      priority: "low"
    }
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          🤖 AI Financial Insights
          <Badge variant="outline" className="ml-2">Powered by AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.priority === 'high' ? 'border-red-500 bg-red-50' :
              insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-start space-x-2">
                <span className="text-xl">{insight.icon}</span>
                <div>
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{insight.message}</p>
                  <Badge
                    variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                    className="mt-2 text-xs"
                  >
                    {insight.priority} priority
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;