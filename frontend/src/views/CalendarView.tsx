'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function CalendarView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, deadlines, createPersonalDeadline } = context;

  // Default automatically to current month and year
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('personal');
  const [newEventUrgency, setNewEventUrgency] = useState('medium');
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const emptyDaysBefore = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Identify today
  const realToday = new Date();
  const isCurrentMonthView = realToday.getFullYear() === year && realToday.getMonth() === month;
  const todayDayNumber = isCurrentMonthView ? realToday.getDate() : null;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const formatDateString = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getEventsForDay = (day: number) => {
    const dateString = formatDateString(day);
    return deadlines.filter(d => d.date === dateString);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setNewEventTitle('');
    setError('');
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !user || !selectedDay) {
      setError('Please enter reminder details.');
      return;
    }

    const dateString = formatDateString(selectedDay);
    await createPersonalDeadline(newEventTitle, dateString, newEventType, newEventUrgency);
    setSelectedDay(null);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      <div className="glass-card p-5 flex flex-col gap-5">
        
        {/* Calendar Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight">{monthName} {year}</h2>
              <span className="text-xs text-[#94A3B8] font-medium uppercase mt-0.5">Municipal & Personal Scheduling Board</span>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1.5 ml-2">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors text-xs font-semibold"
                title="Previous Month"
              >
                ◀
              </button>
              <button 
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors text-xs font-semibold"
                title="Next Month"
              >
                ▶
              </button>
            </div>
          </div>

          <div className="flex gap-3 text-[9px] font-bold flex-wrap">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-red-500" /> High Urgency</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> Medium Urgency</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-blue-500" /> Low Urgency</span>
          </div>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
          {weekDays.map(wd => <div key={wd} className="py-2">{wd}</div>)}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2.5">
          {/* Empty cells before month start */}
          {Array.from({ length: emptyDaysBefore }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] p-2 bg-[#F8FAFC]/40 dark:bg-[#172033]/20 rounded-xl border border-transparent" />
          ))}

          {/* Actual days */}
          {daysArray.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === todayDayNumber;
            return (
              <div 
                key={day}
                onClick={() => handleDayClick(day)}
                className={`min-h-[85px] p-2 bg-white dark:bg-[#0F1626] border rounded-xl flex flex-col justify-between hover:border-blue-500 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-md ${
                  isToday 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20' 
                    : 'border-[#E2E8F0] dark:border-[#1E293B]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    isToday 
                      ? 'bg-blue-600 text-white h-5 w-5 rounded-full flex items-center justify-center' 
                      : 'text-[#475569] dark:text-[#94A3B8]'
                  }`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-tighter">Today</span>
                  )}
                </div>
                
                {/* Event stack */}
                <div className="flex flex-col gap-1 mt-1.5">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div 
                      key={ev.id}
                      className={`text-[8px] font-bold py-1 px-1.5 rounded truncate text-white ${
                        ev.urgency === 'high' ? 'bg-red-500' :
                        ev.urgency === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[7px] text-[#94A3B8] font-bold text-center">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* RENDER MODAL POPUP SCHEDULER */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#080D1A]/50 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
          
          <div className="glass rounded-2xl w-full max-w-sm shadow-2xl p-6 relative border border-[#E2E8F0]/30 dark:border-[#1E293B]/40 z-10 animate-scale-in flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-heading text-sm font-bold">Schedule Reminder: {monthName} {selectedDay}, {year}</h3>
              <button onClick={() => setSelectedDay(null)}>✕</button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-semibold text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Reminder Category</label>
                <select 
                  className="form-control text-xs"
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                >
                  <option value="personal">Personal Appointment</option>
                  <option value="license">License Renewal</option>
                  <option value="tax">Tax Deadline</option>
                  <option value="application">Application Milestone</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select 
                  className="form-control text-xs"
                  value={newEventUrgency}
                  onChange={(e) => setNewEventUrgency(e.target.value)}
                >
                  <option value="low">Low Urgency</option>
                  <option value="medium">Medium Urgency</option>
                  <option value="high">High Urgency</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reminder Details</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Tax return file deadline..."
                  value={newEventTitle}
                  onChange={(e) => { setNewEventTitle(e.target.value); setError(''); }}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
                Add to Calendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

