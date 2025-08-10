'use client';

import { AlertTriangle, CheckCircle, XCircle, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Suggestion } from '@/types/crops/cropHealth';

interface HealthAssessmentProps {
  diseasesSuggestions: Suggestion[] | undefined;
}

export default function HealthAssessment({ diseasesSuggestions }: HealthAssessmentProps) {
  const getHealthStatus = (suggestions: Suggestion[]) => {
    if (!suggestions || suggestions.length === 0) {
      return {
        status: 'healthy',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        message: 'No health issues detected',
        subMessage: 'Your crop appears to be healthy based on the analysis',
        severity: 0
      };
    }

    // Calculate overall severity based on highest probability diseases
    const maxProbability = Math.max(...suggestions.map(s => s.probability));
    const highConfidenceIssues = suggestions.filter(s => s.probability > 0.6).length;

    if (maxProbability > 0.8 || highConfidenceIssues >= 2) {
      return {
        status: 'critical',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        message: 'Serious issues detected',
        subMessage: 'Immediate attention required - multiple problems identified',
        severity: Math.round(maxProbability * 100)
      };
    }

    if (maxProbability > 0.5 || highConfidenceIssues >= 1) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        message: 'Potential issues found',
        subMessage: 'Monitor closely and consider treatment options',
        severity: Math.round(maxProbability * 100)
      };
    }

    return {
      status: 'minor',
      icon: Leaf,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      message: 'Minor concerns detected',
      subMessage: 'Low confidence issues - continue monitoring',
      severity: Math.round(maxProbability * 100)
    };
  };

  if (!diseasesSuggestions) {
    return null;
  }

  const healthStatus = getHealthStatus(diseasesSuggestions);
  const HealthIcon = healthStatus.icon;
  
  // Get top 3 most likely issues
  const topIssues = diseasesSuggestions
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return (
    <Card className={`${healthStatus.borderColor} ${healthStatus.bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HealthIcon className={`w-6 h-6 ${healthStatus.color}`} />
            <span>Crop Health Assessment</span>
          </div>
          {healthStatus.severity > 0 && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${healthStatus.color}`}>
                {healthStatus.severity}%
              </div>
              <div className="text-xs text-gray-500">
                Highest Match
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${healthStatus.color}`}>
              {healthStatus.message}
            </h3>
            <span className="text-sm text-gray-600">
              {diseasesSuggestions.length} issue{diseasesSuggestions.length !== 1 ? 's' : ''} analyzed
            </span>
          </div>
          <p className="text-gray-600">
            {healthStatus.subMessage}
          </p>
        </div>

        {/* Severity Progress Bar */}
        {healthStatus.severity > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Concern Level</span>
              <span className="text-sm text-gray-600">{healthStatus.severity}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  healthStatus.severity > 70 ? 'bg-red-500' :
                  healthStatus.severity > 40 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${healthStatus.severity}%` }}
              />
            </div>
          </div>
        )}

        {/* Top Issues Summary */}
        {topIssues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Primary Concerns:</h4>
            <div className="space-y-2">
              {topIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{issue.name}</span>
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      issue.probability > 0.7 ? 'text-red-600' :
                      issue.probability > 0.4 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {Math.round(issue.probability * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Recommendations */}
        <div className="bg-white p-4 rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">Recommended Actions:</h4>
          <div className="space-y-1 text-sm text-gray-700">
            {healthStatus.status === 'critical' && (
              <>
                <p>• 🚨 Take immediate action to prevent spread</p>
                <p>• 📞 Consider consulting an agricultural expert</p>
                <p>• 🧪 Apply appropriate treatments as soon as possible</p>
              </>
            )}
            {healthStatus.status === 'warning' && (
              <>
                <p>• 👀 Monitor affected areas closely</p>
                <p>• 📋 Prepare treatment options</p>
                <p>• 🔍 Check nearby plants for similar symptoms</p>
              </>
            )}
            {healthStatus.status === 'minor' && (
              <>
                <p>• 📅 Continue regular monitoring</p>
                <p>• 🌱 Maintain good plant hygiene</p>
                <p>• 📸 Take follow-up photos in a few days</p>
              </>
            )}
            {healthStatus.status === 'healthy' && (
              <>
                <p>• ✅ Continue current care routine</p>
                <p>• 🛡️ Maintain preventive measures</p>
                <p>• 📈 Monitor growth and development</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}