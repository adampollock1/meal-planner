import { useState, useRef, useEffect } from 'react';
import { CaretLeft, CaretRight, Calendar } from '@phosphor-icons/react';
import { getCalendarMonth, formatMonthYear, formatWeekRange, isToday, isSameWeek, getWeekStartDate } from '../../utils/dateUtils';

interface CalendarPickerProps {
  selectedDate: Date;
  onSelectWeek: (date: Date) => void;
  weekStartsOn: 'Sunday' | 'Monday';
}

const DAY_LABELS_SUNDAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_LABELS_MONDAY = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function CalendarPicker({ selectedDate, onSelectWeek, weekStartsOn }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dayLabels = weekStartsOn === 'Sunday' ? DAY_LABELS_SUNDAY : DAY_LABELS_MONDAY;
  const weeks = getCalendarMonth(viewDate.getFullYear(), viewDate.getMonth(), weekStartsOn);
  
  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Update view date when selected date changes
  useEffect(() => {
    setViewDate(new Date(selectedDate));
  }, [selectedDate]);
  
  const goToPreviousMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleWeekClick = (weekStartDate: Date) => {
    onSelectWeek(weekStartDate);
    setIsOpen(false);
  };
  
  const currentMonth = viewDate.getMonth();
  
  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200 group"
      >
        <Calendar size={16} weight="duotone" className="text-orange-500" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
          {formatWeekRange(weekStartsOn, selectedDate)}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-4 min-w-[300px] animate-scale-in">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <span className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
              {formatMonthYear(viewDate)}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>
          
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayLabels.map(label => (
              <div key={label} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">
                {label}
              </div>
            ))}
          </div>
          
          {/* Calendar grid - click on week rows */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => {
              const weekStart = getWeekStartDate(weekStartsOn, week[0]);
              const isSelectedWeek = isSameWeek(week[0], selectedDate, weekStartsOn);
              const hasCurrentMonth = week.some(d => d.getMonth() === currentMonth);
              
              if (!hasCurrentMonth && weekIndex > 3) return null;
              
              return (
                <button
                  key={weekIndex}
                  onClick={() => handleWeekClick(weekStart)}
                  className={`grid grid-cols-7 gap-1 w-full rounded-lg transition-all duration-200 ${
                    isSelectedWeek
                      ? 'bg-orange-100/80 dark:bg-orange-900/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {week.map((date, dayIndex) => {
                    const isCurrentMonth = date.getMonth() === currentMonth;
                    const isTodayDate = isToday(date);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`py-2 text-center text-sm rounded-lg transition-all duration-200 ${
                          isTodayDate
                            ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/30'
                            : isCurrentMonth
                              ? 'text-slate-900 dark:text-slate-100'
                              : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </button>
              );
            })}
          </div>
          
          {/* Quick actions */}
          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => {
                onSelectWeek(new Date());
                setIsOpen(false);
              }}
              className="w-full text-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
            >
              Go to Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
