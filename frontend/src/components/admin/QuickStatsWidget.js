import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const QuickStatsWidget = ({ stats, loading = false }) => {
  const [animatedStats, setAnimatedStats] = useState({});

  useEffect(() => {
    if (stats && !loading) {
      // Animate stats counting up
      Object.keys(stats).forEach(key => {
        const targetValue = stats[key];
        const duration = 1000; // 1 second
        const steps = 60;
        const increment = targetValue / steps;
        let currentValue = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          currentValue += increment;
          
          if (step >= steps) {
            currentValue = targetValue;
            clearInterval(timer);
          }

          setAnimatedStats(prev => ({
            ...prev,
            [key]: Math.floor(currentValue)
          }));
        }, duration / steps);

        return () => clearInterval(timer);
      });
    }
  }, [stats, loading]);

  const getStatIcon = (key) => {
    const iconClasses = "w-8 h-8";
    
    switch (key) {
      case 'totalApplications':
        return <DocumentTextIcon className={`${iconClasses} text-blue-600`} />;
      case 'pendingApplications':
        return <ClockIcon className={`${iconClasses} text-yellow-600`} />;
      case 'approvedApplications':
        return <AcademicCapIcon className={`${iconClasses} text-green-600`} />;
      case 'totalRevenue':
        return <CurrencyDollarIcon className={`${iconClasses} text-purple-600`} />;
      case 'totalApplicants':
        return <UserGroupIcon className={`${iconClasses} text-indigo-600`} />;
      default:
        return <DocumentTextIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const getTrendIndicator = (key) => {
    // Mock trend data - replace with real data from your API
    const trends = {
      totalApplications: { value: 12, direction: 'up' },
      pendingApplications: { value: 5, direction: 'down' },
      approvedApplications: { value: 8, direction: 'up' },
      totalRevenue: { value: 15, direction: 'up' },
      totalApplicants: { value: 3, direction: 'up' }
    };

    const trend = trends[key];
    if (!trend) return null;

    const iconClasses = "w-4 h-4";
    
    if (trend.direction === 'up') {
              return (
          <div className="flex items-center text-green-600 text-sm">
            <ArrowTrendingUpIcon className={iconClasses} />
            <span className="ml-1">+{trend.value}%</span>
          </div>
        );
    } else if (trend.direction === 'down') {
              return (
          <div className="flex items-center text-red-600 text-sm">
            <ArrowTrendingDownIcon className={iconClasses} />
            <span className="ml-1">-{trend.value}%</span>
          </div>
        );
    } else {
      return (
        <div className="flex items-center text-gray-600 text-sm">
          <MinusIcon className={iconClasses} />
          <span className="ml-1">0%</span>
        </div>
      );
    }
  };

  const formatValue = (key, value) => {
    if (key === 'totalRevenue') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const getStatLabel = (key) => {
    const labels = {
      totalApplications: 'Total Applications',
      pendingApplications: 'Pending Applications',
      approvedApplications: 'Approved Applications',
      totalRevenue: 'Total Revenue',
      totalApplicants: 'Total Applicants'
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-300 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statKeys = ['totalApplications', 'pendingApplications', 'approvedApplications', 'totalRevenue', 'totalApplicants'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {statKeys.map((key) => (
        <div 
          key={key}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            {getStatIcon(key)}
            {getTrendIndicator(key)}
          </div>
          
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(key, animatedStats[key] || 0)}
            </div>
          </div>
          
          <div className="text-sm text-gray-600 font-medium">
            {getStatLabel(key)}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min((animatedStats[key] || 0) / (stats[key] || 1) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsWidget;
