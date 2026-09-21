import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface TalentSearchFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedDept: string;
  onDeptChange: (dept: string) => void;
  departments: string[];
  totalResults: number;
}

export const TalentSearchFilter: React.FC<TalentSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedDept,
  onDeptChange,
  departments,
  totalResults
}) => {
  const popularKeywords = ["Python", "Machine Learning", "Cloud", "Leadership", "SQL", "Docker", "Agile"];

  return (
    <div className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employees by skills, title, or transferable traits (e.g. Python, Leadership)..."
            className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => onDeptChange(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Popular Search Quick Filters */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
        <span className="text-[11px] text-slate-400 mr-1">Quick Skill Filters:</span>
        {popularKeywords.map((kw) => (
          <button
            key={kw}
            onClick={() => onSearchChange(kw)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              searchQuery.toLowerCase() === kw.toLowerCase()
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {kw}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-slate-400 font-mono">
          {totalResults} matches found
        </span>
      </div>
    </div>
  );
};
