'use client';

import { useApifyStore, type OutputFormat } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { FileJson, FileSpreadsheet, FileText, File, Check } from 'lucide-react';

const formats: { value: OutputFormat; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: 'json', label: 'JSON', icon: FileJson, color: 'text-amber-500' },
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet, color: 'text-emerald-500' },
  { value: 'excel', label: 'Excel', icon: FileText, color: 'text-green-600' },
  { value: 'pdf', label: 'PDF', icon: File, color: 'text-red-500' },
];

export function OutputConfig() {
  const {
    selectedActor, outputFormat, setOutputFormat,
    selectedFields, toggleField, setSelectedFields,
    maxResults, setMaxResults,
  } = useApifyStore();

  if (!selectedActor) return null;

  const allSelected = selectedFields.length === selectedActor.outputFields.length;

  return (
    <div className="space-y-5">
      {/* Output Format */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Formato de Saída</Label>
        <div className="grid grid-cols-2 gap-2">
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            const isActive = outputFormat === fmt.value;
            return (
              <button
                key={fmt.value}
                onClick={() => setOutputFormat(fmt.value)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all duration-150',
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-border hover:border-muted-foreground/30 hover:bg-accent'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? fmt.color : 'text-muted-foreground')} />
                <span className="font-medium">{fmt.label}</span>
                {isActive && <Check className="h-3.5 w-3.5 ml-auto text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Field Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Campos a Incluir</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => {
              if (allSelected) {
                setSelectedFields([]);
              } else {
                setSelectedFields([...selectedActor.outputFields]);
              }
            }}
          >
            {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
          </Button>
        </div>
        <ScrollArea className="max-h-48">
          <div className="space-y-1.5 pr-3">
            {selectedActor.outputFields.map((field) => {
              const isSelected = selectedFields.includes(field);
              return (
                <label
                  key={field}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors',
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleField(field)}
                    className="h-3.5 w-3.5"
                  />
                  <code className="font-mono text-[11px]">{field}</code>
                </label>
              );
            })}
          </div>
        </ScrollArea>
        {selectedFields.length === 0 && (
          <p className="text-[10px] text-destructive">Selecione pelo menos um campo</p>
        )}
      </div>

      {/* Max Results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Máximo de Resultados</Label>
          <Badge variant="secondary" className="text-xs font-mono">
            {maxResults}
          </Badge>
        </div>
        <Slider
          value={[maxResults]}
          onValueChange={([v]) => setMaxResults(v)}
          min={1}
          max={200}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1</span>
          <span>200</span>
        </div>
      </div>
    </div>
  );
}
