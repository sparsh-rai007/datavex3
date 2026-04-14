'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XCircle,
  CalendarDays
} from 'lucide-react';

interface Leave {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PersonnelCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  leaves: Leave[];
}

export default function PersonnelCalendarModal({ 
  isOpen, 
  onClose, 
  employeeName, 
  leaves 
}: PersonnelCalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 border-r border-b border-indigo-50/50 bg-slate-50/30" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      const dayLeaves = leaves.filter(l => {
        const start = l.start_date.split('T')[0];
        const end = l.end_date.split('T')[0];
        return start <= dateString && end >= dateString;
      });

      const isToday = todayString === dateString;
      const isPast = date < today;

      // Currently on Leave: Approved and date is TODAY
      const isOnLeave = dayLeaves.some(l => l.status === 'approved' && isToday);
      // Previously taken: Approved and in the past
      const hasTaken = dayLeaves.some(l => l.status === 'approved' && isPast);
      // Upcoming: Pending or Approved and in the future
      const hasUpcoming = dayLeaves.some(l => (l.status === 'approved' || l.status === 'pending') && !isPast && !isOnLeave);

      days.push(
        <div
          key={day}
          className={`h-14 p-2 border-r border-b border-indigo-50/50 relative group transition-colors ${
            isOnLeave ? 'bg-indigo-600 ring-2 ring-inset ring-indigo-400/30' :
            hasUpcoming ? 'bg-indigo-50/40' :
            hasTaken ? 'bg-slate-50' :
            isToday ? 'bg-indigo-600/5' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-[10px] font-serif ${
              isOnLeave ? 'text-white font-bold' :
              hasUpcoming ? 'text-indigo-600 font-bold' :
              hasTaken ? 'text-slate-400 font-medium' :
              isToday ? 'text-indigo-600 font-bold underline decoration-indigo-200 underline-offset-4' : 'text-slate-900/20'
            }`}>
              {day.toString().padStart(2, '0')}
            </span>
            
            {isOnLeave && <div className="px-1 py-0.5 bg-white/20 rounded text-[5px] font-black text-white uppercase tracking-tighter">Current</div>}
            {hasTaken && <CheckCircle2 size={10} className="text-slate-300" />}
            {hasUpcoming && <div className="w-1 h-1 rounded-full bg-indigo-600 animate-pulse" />}
          </div>
          
          <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
            {dayLeaves.map(l => (
              <div 
                key={l.id} 
                className={`text-[7px] px-1.5 py-0.5 rounded-sm truncate font-black uppercase tracking-tighter ${
                  isOnLeave ? 'bg-white/20 text-white' :
                  l.status === 'approved' ? 'bg-indigo-100 text-indigo-700' : 
                  l.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}
                title={l.reason}
              >
                {l.status}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-indigo-50"
          >
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-indigo-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-medium text-slate-950 tracking-tight">
                    <span className="italic text-indigo-600">{employeeName}'s</span> Schedule
                  </h2>
                  <p className="text-[9px] font-black text-slate-950/30 uppercase tracking-[0.3em] mt-1">Personnel Activity Archive</p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-indigo-50 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Calendar UI */}
            <div className="p-0">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between p-6 border-b border-indigo-50 bg-white">
                <h3 className="text-xl font-serif italic text-slate-950">
                  {currentMonth.toLocaleString('default', { month: 'long' })} <span className="not-italic font-light text-slate-900/20">{currentMonth.getFullYear()}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"></button>
                  <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 bg-slate-50/30">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-950/20 border-r border-b border-indigo-50/50 last:border-r-0">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            {/* Footer / Legend */}
            <div className="p-8 bg-slate-50/80 flex flex-wrap items-center justify-center gap-10">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-indigo-600 shadow-sm" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-950/40">On Leave (Today)</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-950/40">Upcoming Leave</span>
               </div>
               <div className="flex items-center gap-3">
                  <CheckCircle2 size={14} className="text-slate-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-950/40">Previously Taken</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-950/40">Pending Review</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
