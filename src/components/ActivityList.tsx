import React, { useState } from 'react';
import { ActivityLog, EmissionCategory } from '../types';
import { CATEGORY_CONFIG } from '../data/emissionPresets';
import {
  Car,
  Zap,
  Salad,
  ShoppingBag,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface ActivityListProps {
  activities: ActivityLog[];
  onDeleteActivity: (id: string) => void;
  onClearAll: () => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onDeleteActivity,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<EmissionCategory | 'all'>('all');

  const filteredActivities = activities.filter((act) => {
    const matchesCategory = filterCategory === 'all' || act.category === filterCategory;
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.details?.subType && act.details.subType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (act.details?.notes && act.details.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: EmissionCategory) => {
    switch (category) {
      case 'transport':
        return <Car className="w-4 h-4" />;
      case 'energy':
        return <Zap className="w-4 h-4" />;
      case 'food':
        return <Salad className="w-4 h-4" />;
      case 'consumption':
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const formatActivityDate = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    const [year, month, day] = dateStr.split('-');
    if (!month || !day) return dateStr;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf2ee]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#1b4332]">Activity Log History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f2] text-[#52796f] font-semibold">
              {filteredActivities.length} items
            </span>
          </div>
          <p className="text-xs text-[#52796f]">Tracked greenhouse gas activities and offsets</p>
        </div>

        {activities.length > 0 && (
          <button
            id="clear-all-activities-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all recorded carbon logs?')) {
                onClearAll();
              }
            }}
            className="text-[11px] font-medium text-[#b91c1c] hover:text-[#991b1b] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#839788]" />
          <input
            id="search-activities-input"
            type="text"
            placeholder="Search activities or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#ccd7cf] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#2d6a4f]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-[#1b4332] text-white'
                : 'bg-[#f4f7f5] text-[#52796f] hover:bg-[#e8efe9]'
            }`}
          >
            All
          </button>
          {(['transport', 'energy', 'food', 'consumption'] as EmissionCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filterCategory === cat
                  ? 'bg-[#1b4332] text-white'
                  : 'bg-[#f4f7f5] text-[#52796f] hover:bg-[#e8efe9]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_CONFIG[cat].color }}
              />
              <span>{CATEGORY_CONFIG[cat].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Items List */}
      <div className="mt-3 divide-y divide-[#f0f4f1] max-h-96 overflow-y-auto pr-1">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-[#52796f]">No carbon activities found matching your criteria.</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const config = CATEGORY_CONFIG[activity.category];
            return (
              <div
                key={activity.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-[#fafcfa] rounded-lg px-2 transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: config.bgLight,
                      color: config.color,
                      border: `1px solid ${config.borderColor}`,
                    }}
                  >
                    {getCategoryIcon(activity.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1b4332] truncate">
                        {activity.title}
                      </span>
                      {activity.isAiEstimated && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          <Sparkles className="w-2.5 h-2.5 text-[#10b981]" />
                          AI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#52796f] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#839788]" />
                        {formatActivityDate(activity.date)}
                      </span>
                      {activity.details?.subType && (
                        <>
                          <span>•</span>
                          <span>{activity.details.subType}</span>
                        </>
                      )}
                    </div>

                    {activity.details?.notes && (
                      <p className="text-[11px] text-[#52796f] italic mt-1 line-clamp-1">
                        "{activity.details.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#1b4332]">
                      {activity.co2Kg.toFixed(2)} kg
                    </div>
                    <div className="text-[10px] text-[#52796f]">CO₂e</div>
                  </div>

                  <button
                    onClick={() => onDeleteActivity(activity.id)}
                    className="p-1.5 text-[#a0af9f] hover:text-[#dc2626] hover:bg-[#fee2e2] rounded-md transition-colors"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
