import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';

interface DateRangePickerProps {
  label: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
  className?: string;
}

export function DateRangePicker({ 
  label, 
  fromDate, 
  toDate, 
  onFromChange, 
  onToChange,
  className
}: DateRangePickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 flex-1 justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {fromDate ? format(fromDate, "dd/MM/yy", { locale: it }) : "Da"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[100] bg-background shadow-lg border" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={onFromChange}
              initialFocus
              className="p-3 pointer-events-auto bg-background"
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 flex-1 justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {toDate ? format(toDate, "dd/MM/yy", { locale: it }) : "A"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[100] bg-background shadow-lg border" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={onToChange}
              initialFocus
              className="p-3 pointer-events-auto bg-background"
            />
          </PopoverContent>
        </Popover>
        {(fromDate || toDate) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => {
              onFromChange(undefined);
              onToChange(undefined);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
