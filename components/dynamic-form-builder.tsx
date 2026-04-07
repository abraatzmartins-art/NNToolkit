'use client';

import { useState } from 'react';
import { useApifyStore } from '@/lib/store';
import { type ActorParamField, type FieldType } from '@/lib/apify-catalog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function JsonValidator({ value }: { value: string }) {
  const [error, setError] = useState<string | null>(null);

  const validate = (val: string) => {
    if (!val.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(val);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => {
          validate(e.target.value);
        }}
        onBlur={() => validate(value)}
        className={cn('font-mono text-xs min-h-[80px]', error && 'border-destructive')}
      />
      {error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>JSON inválido</span>
        </div>
      )}
      {value.trim() && !error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          <span>JSON válido</span>
        </div>
      )}
    </div>
  );
}

function FormField({ field }: { field: ActorParamField }) {
  const { formValues, updateFormField } = useApifyStore();
  const value = formValues[field.key];

  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Input
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => updateFormField(field.key, e.target.value)}
            className="h-9 text-sm"
          />
          {field.description && (
            <p className="text-[10px] text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => updateFormField(field.key, e.target.value)}
            className="min-h-[80px] text-sm"
          />
          {field.description && (
            <p className="text-[10px] text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Input
            type="number"
            min={field.min}
            max={field.max}
            value={value ?? ''}
            onChange={(e) => updateFormField(field.key, e.target.value ? Number(e.target.value) : '')}
            className="h-9 text-sm"
          />
          {(field.min !== undefined || field.max !== undefined) && (
            <p className="text-[10px] text-muted-foreground">
              {field.min !== undefined && `Mín: ${field.min}`}
              {field.min !== undefined && field.max !== undefined && ' · '}
              {field.max !== undefined && `Máx: ${field.max}`}
            </p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Select
            value={value || field.default || ''}
            onValueChange={(v) => updateFormField(field.key, v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={field.placeholder || 'Selecionar...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'multiselect':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt) => {
              const selected = Array.isArray(value) && value.includes(opt.value);
              return (
                <Badge
                  key={opt.value}
                  variant={selected ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => {
                    const current = Array.isArray(value) ? value : [];
                    const newVal = selected
                      ? current.filter((v: string) => v !== opt.value)
                      : [...current, opt.value];
                    updateFormField(field.key, newVal);
                  }}
                >
                  {opt.label}
                </Badge>
              );
            })}
          </div>
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-between py-1">
          <Label className="text-xs">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => updateFormField(field.key, checked)}
          />
        </div>
      );

    case 'json':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <JsonValidator value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)} />
          {field.description && (
            <p className="text-[10px] text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}

export function DynamicFormBuilder() {
  const { selectedActor } = useApifyStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!selectedActor) return null;

  const basicFields = selectedActor.inputSchema.filter((f) => !f.advanced);
  const advancedFields = selectedActor.inputSchema.filter((f) => f.advanced);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: selectedActor.color + '18', color: selectedActor.color }}
          >
            <span className="text-xs font-bold">
              {selectedActor.name.charAt(0)}
            </span>
          </div>
          Parâmetros do {selectedActor.name}
        </h3>
        <div className="space-y-3">
          {basicFields.map((field) => (
            <FormField key={field.key} field={field} />
          ))}
        </div>
      </div>

      {advancedFields.length > 0 && (
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1">
                {showAdvanced ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Opções Avançadas
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {advancedFields.length}
              </Badge>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-3 mt-2 pt-2 border-t">
              {advancedFields.map((field) => (
                <FormField key={field.key} field={field} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
