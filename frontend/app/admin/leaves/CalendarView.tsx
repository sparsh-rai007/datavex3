'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  X, 
  Trash2, 
  MoreVertical, 
  AlignLeft, 
  Calendar as CalendarIcon, 
  Lock,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaveRequest } from './page';

interface CalendarViewProps {
  leaves: LeaveRequest[];
  loading: boolean;
}

export default function CalendarView({ leaves, loading }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Default to May 2026 based on mock data
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [activeLeave, setActiveLeave] = useState<{ leave: LeaveRequest, x: number, y: number, width: number } | null>(null);

  // Extract unique employees from leaves
  const allEmployees = useMemo(() => {
    const map = new Map<string, { id: string, name: string }>();
    leaves.forEach(l => {
      const name = `${l.first_name} ${l.last_name}`;
      if (!map.has(name)) {
        map.set(name, { id: l.employee_id, name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [leaves]);

  // Sync selected employees with all employees when the list changes
  useEffect(() => {
    if (allEmployees.length > 0) {
      setSelectedEmployees(prev => {
        // If nothing is selected yet, select all
        if (prev.length === 0) return allEmployees.map(e => e.name);
        // Otherwise, keep valid selections
        return prev.filter(name => allEmployees.some(e => e.name === name));
      });
    }
  }, [allEmployees]);

  const toggleEmployee = (name: string) => {
    setSelectedEmployees(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const name = `${l.first_name} ${l.last_name}`;
      const matchesSearch = name.toLowerCase().includes(employeeSearch.toLowerCase());
      const isSelected = selectedEmployees.includes(name);
      
      // If user is searching, filter by search term. 
      // If not, use the checkboxes.
      if (employeeSearch.trim()) return matchesSearch;
      return isSelected;
    });
  }, [leaves, selectedEmployees, employeeSearch]);

  const getLeavesForDay = (day: Date) => {
    return filteredLeaves.filter(leave => {
      const start = startOfDay(parseISO(leave.start_date));
      const end = endOfDay(parseISO(leave.end_date));
      return isWithinInterval(day, { start, end });
    });
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleEntryClick = (e: React.MouseEvent, leave: LeaveRequest) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveLeave({ 
      leave, 
      x: rect.left, 
      y: rect.top,
      width: rect.width
    });
  };

  const filteredSidebarEmployees = useMemo(() => {
    return allEmployees.filter(e => e.name.toLowerCase().includes(employeeSearch.toLowerCase()));
  }, [allEmployees, employeeSearch]);

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-[10px] font-bold text-[#020617]/20 uppercase tracking-[0.4em] animate-pulse">Computing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative min-h-[800px]">
      <AnimatePresence>
        {activeLeave && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLeave(null)}
              className="fixed inset-0 z-[110] bg-black/5 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                left: Math.min(window.innerWidth - 420, Math.max(20, activeLeave.x - 200 + (activeLeave.width/2))),
                top: Math.min(window.innerHeight - 500, Math.max(20, activeLeave.y - 150))
              }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed z-[120] w-[400px] bg-white rounded-2xl shadow-[0_24px_54px_rgba(0,0,0,0.18)] border border-[#EEF2FF] overflow-hidden"
            >
              <div className="p-4 flex items-center justify-end gap-2 border-b border-[#FBF9F7]">
                <button className="p-2 hover:bg-[#FBF9F7] rounded-full text-[#020617]/30 transition-colors">
                  <Trash2 size={16} />
                </button>
                <button className="p-2 hover:bg-[#FBF9F7] rounded-full text-[#020617]/30 transition-colors">
                  <MoreVertical size={16} />
                </button>
                <button 
                  onClick={() => setActiveLeave(null)}
                  className="p-2 hover:bg-[#FBF9F7] rounded-full text-[#020617]/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-start gap-5">
                  <div className={`w-4 h-4 rounded-sm mt-1.5 shrink-0 ${
                    activeLeave.leave.status === 'approved' ? 'bg-[#4F46E5]' :
                    activeLeave.leave.status === 'rejected' ? 'bg-[#F43F5E]' :
                    'bg-[#020617]/10'
                  }`} />
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-[#020617]">
                      {activeLeave.leave.first_name} {activeLeave.leave.last_name}
                    </h3>
                    <p className="text-sm font-serif italic text-[#020617]/40 mt-1">
                      {format(parseISO(activeLeave.leave.start_date), 'EEEE, d MMMM')}
                      {activeLeave.leave.start_date !== activeLeave.leave.end_date && ` — ${format(parseISO(activeLeave.leave.end_date), 'EEEE, d MMMM')}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-5 text-sm text-[#020617]/60">
                    <AlignLeft size={18} className="shrink-0 text-[#020617]/20" />
                    <p className="font-serif italic leading-relaxed">
                      {activeLeave.leave.reason || "No specified justification protocol."}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-5 text-sm text-[#020617]/60">
                    <CalendarIcon size={18} className="shrink-0 text-[#020617]/20" />
                    <span className="font-serif italic">{activeLeave.leave.department} Protocol</span>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-[#020617]/60">
                    <Clock size={18} className="shrink-0 text-[#020617]/20" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#4F46E5]">
                      Registry ID: {activeLeave.leave.employee_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-[#020617]/60">
                    <Lock size={18} className="shrink-0 text-[#020617]/20" />
                    <span className="font-serif italic">Organizational Visibility: Internal Matrix</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Google Calendar Style */}
      <aside className="w-full lg:w-72 shrink-0 space-y-10 order-2 lg:order-1">
        <div className="space-y-6">
          <p className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.4em]">Node Registry</p>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#020617]/20" size={14} />
            <input 
              type="text"
              placeholder="Search for people"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#EEF2FF] rounded-sm text-xs font-serif italic focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredSidebarEmployees.map(emp => (
              <label 
                key={emp.id}
                className="flex items-center gap-3 p-2 hover:bg-white rounded-sm cursor-pointer transition-colors group"
              >
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.name)}
                    onChange={() => toggleEmployee(emp.name)}
                    className="appearance-none w-4 h-4 border border-[#EEF2FF] rounded-sm checked:bg-[#4F46E5] checked:border-[#4F46E5] transition-all cursor-pointer"
                  />
                  {selectedEmployees.includes(emp.name) && (
                    <div className="absolute w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
                  )}
                </div>
                <span className={`text-[11px] font-medium transition-colors ${selectedEmployees.includes(emp.name) ? 'text-[#020617]' : 'text-[#020617]/30'}`}>
                  {emp.name}
                </span>
                <span className="ml-auto text-[8px] font-bold text-[#020617]/10 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  {emp.id}
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Calendar Grid */}
      <div className="flex-1 w-full order-1 lg:order-2 bg-white rounded-[4px] border border-[#EEF2FF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Calendar Header */}
        <div className="px-8 py-6 border-b border-[#EEF2FF] flex items-center justify-between bg-[#FBF9F7]/30">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-serif font-medium text-[#020617]">
              {format(currentDate, 'MMMM')} <span className="text-[#4F46E5] italic">{format(currentDate, 'yyyy')}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-[#EEF2FF] rounded-full transition-colors text-[#020617]/40 hover:text-[#4F46E5]"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-[#EEF2FF] rounded-full transition-colors text-[#020617]/40 hover:text-[#4F46E5]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 border-b border-[#EEF2FF]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-bold text-[#020617]/30 uppercase tracking-[0.2em] bg-[#FBF9F7]/10">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 grid-rows-5 h-[700px]">
          {calendarDays.map((day, idx) => {
            const dayLeaves = getLeavesForDay(day);
            const isToday = isSameDay(day, new Date());
            const isInMonth = isSameMonth(day, monthStart);

            return (
              <div 
                key={day.toString()} 
                className={`border-r border-b border-[#EEF2FF] p-2 relative group hover:bg-[#FBF9F7]/50 transition-colors ${!isInMonth ? 'bg-[#FBF9F7]/20 opacity-40' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-mono font-bold tracking-tighter ${isToday ? 'bg-[#4F46E5] text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-[#020617]/30'}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                  {dayLeaves.map((leave, lIdx) => {
                    const isStart = isSameDay(day, parseISO(leave.start_date));
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`${leave.id}-${day.toString()}`}
                        onClick={(e) => handleEntryClick(e, leave)}
                        className={`
                          text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm truncate cursor-pointer hover:brightness-95 transition-all
                          ${leave.status === 'approved' ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF]' : 
                            leave.status === 'rejected' ? 'bg-[#FFF1F2] text-[#F43F5E] border border-[#FFE4E6]' : 
                            'bg-[#F8F7F4] text-[#020617]/50 border border-[#F1F1EF]'}
                        `}
                      >
                        <span className="flex items-center gap-1">
                          {isStart && <div className="w-1 h-1 rounded-full bg-current shrink-0" />}
                          {leave.first_name[0]}{leave.last_name[0]}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
