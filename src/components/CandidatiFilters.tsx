import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from './DateRangePicker';
import { RUOLI_AZIENDALI, FUNZIONI } from '@/types/database';

interface CandidatiFiltersProps {
  // Date preset
  datePreset: string;
  onDatePresetChange: (preset: string) => void;
  // Date filters - Registrazione
  filterDateFrom: Date | undefined;
  filterDateTo: Date | undefined;
  onFilterDateFromChange: (date: Date | undefined) => void;
  onFilterDateToChange: (date: Date | undefined) => void;
  // Date filters - Test
  filterTestDateFrom: Date | undefined;
  filterTestDateTo: Date | undefined;
  onFilterTestDateFromChange: (date: Date | undefined) => void;
  onFilterTestDateToChange: (date: Date | undefined) => void;
  // Other filters
  filterStato: string;
  onFilterStatoChange: (value: string) => void;
  filterSesso: string;
  onFilterSessoChange: (value: string) => void;
  filterEta: string;
  onFilterEtaChange: (value: string) => void;
  filterRuolo: string;
  onFilterRuoloChange: (value: string) => void;
  filterFunzione: string;
  onFilterFunzioneChange: (value: string) => void;
  filterFitVerdict: string;
  onFilterFitVerdictChange: (value: string) => void;
  // Reset
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function CandidatiFilters({
  datePreset,
  onDatePresetChange,
  filterDateFrom,
  filterDateTo,
  onFilterDateFromChange,
  onFilterDateToChange,
  filterTestDateFrom,
  filterTestDateTo,
  onFilterTestDateFromChange,
  onFilterTestDateToChange,
  filterStato,
  onFilterStatoChange,
  filterSesso,
  onFilterSessoChange,
  filterEta,
  onFilterEtaChange,
  filterRuolo,
  onFilterRuoloChange,
  filterFunzione,
  onFilterFunzioneChange,
  filterFitVerdict,
  onFilterFitVerdictChange,
  hasActiveFilters,
  onResetFilters,
}: CandidatiFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Date presets */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Periodo rapido</Label>
        <div className="flex flex-wrap gap-1">
          {[
            { value: 'all', label: 'Tutti' },
            { value: 'today', label: 'Oggi' },
            { value: 'week', label: '7 giorni' },
            { value: 'month', label: '30 giorni' },
            { value: '3months', label: '3 mesi' },
          ].map((preset) => (
            <Button
              key={preset.value}
              variant={datePreset === preset.value ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onDatePresetChange(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Date range - Registrazione */}
      <DateRangePicker
        label="Data Registrazione"
        fromDate={filterDateFrom}
        toDate={filterDateTo}
        onFromChange={onFilterDateFromChange}
        onToChange={onFilterDateToChange}
      />
      
      {/* Date range - Test */}
      <DateRangePicker
        label="Data Test"
        fromDate={filterTestDateFrom}
        toDate={filterTestDateTo}
        onFromChange={onFilterTestDateFromChange}
        onToChange={onFilterTestDateToChange}
      />
      
      <div className="space-y-2">
        <Label className="text-xs font-medium">Stato Test</Label>
        <Select value={filterStato} onValueChange={onFilterStatoChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="completato">Completato</SelectItem>
            <SelectItem value="da_fare">Da fare</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Sesso</Label>
        <Select value={filterSesso} onValueChange={onFilterSessoChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Sesso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="M">Maschio</SelectItem>
            <SelectItem value="F">Femmina</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Età</Label>
        <Select value={filterEta} onValueChange={onFilterEtaChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Età" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            <SelectItem value="18-30">18-30</SelectItem>
            <SelectItem value="31-45">31-45</SelectItem>
            <SelectItem value="46-60">46-60</SelectItem>
            <SelectItem value="60+">60+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Ruolo</Label>
        <Select value={filterRuolo} onValueChange={onFilterRuoloChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Ruolo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {RUOLI_AZIENDALI.map((ruolo) => (
              <SelectItem key={ruolo} value={ruolo}>{ruolo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Funzione</Label>
        <Select value={filterFunzione} onValueChange={onFilterFunzioneChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Funzione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            {FUNZIONI.map((funzione) => (
              <SelectItem key={funzione} value={funzione}>{funzione}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Fit Score</Label>
        <Select value={filterFitVerdict} onValueChange={onFilterFitVerdictChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Fit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="IDONEO">Idoneo</SelectItem>
            <SelectItem value="VALUTARE">Valutare</SelectItem>
            <SelectItem value="NON_IDONEO">Non Idoneo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onResetFilters} className="w-full">
          Resetta filtri
        </Button>
      )}
    </div>
  );
}
