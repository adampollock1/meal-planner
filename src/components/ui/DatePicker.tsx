import { useState, useRef, useEffect } from 'react';
import { CaretLeft, CaretRight, Calendar } from '@phosphor-icons/react';
import { getCalendarMonth, formatMonthYear, isToday, formatISODate, formatFullDate, parseISODate } from '../../utils/dateUtils';
import { useAccount } from '../../context/AccountContext';

interface DatePickerProps {
  selectedDate: string; // ISO date string YYYY-MM-DD
  onSelectDate: (date: string) => void;
  placeholder?: string;
}

const DAY_LABELS_SUNDAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_LABELS_MONDAY = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function DatePicker({ selectedDate, onSelectDate, placeholder = 'Select date' }: DatePickerProps) {
  const { settings } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => 
    selectedDate ? parseISODate(selectedDate) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  
  const weekStartsOn = settings.weekStartsOn;
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
    if (selectedDate) {
      setViewDate(parseISODate(selectedDate));
    }
  }, [selectedDate]);
  
  const goToPreviousMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
    onSelectDate(formatISODate(date));
    setIsOpen(false);
  };
  
  const currentMonth = viewDate.getMonth();
  const displayText = selectedDate 
    ? formatFullDate(parseISODate(selectedDate))
    : placeholder;
  
  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-left"
      >
        <Calendar size={16} weight="duotone" className="text-slate-400 dark:text-slate-500" />
        <span className={`text-sm ${selectedDate ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
          {displayText}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-4 min-w-[280px] animate-scale-in">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <span className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
              {formatMonthYear(viewDate)}
            </span>
            <button
              type="button"
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
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isTodayDate = isToday(date);
              const isSelected = selectedDate && formatISODate(date) === selectedDate;
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={`py-2 text-center text-sm rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/30'
                      : isTodayDate
                        ? 'bg-orange-100/80 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                        : isCurrentMonth
                          ? 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                          : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          
          {/* Quick actions */}
          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => handleDateClick(new Date())}
              className="w-full text-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
