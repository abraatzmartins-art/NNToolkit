'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useApifyStore } from '@/lib/store';
import {
  FileJson, FileSpreadsheet, Download, Table, BarChart3, Code2,
  ChevronLeft, ChevronRight, Search, ArrowUpDown, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const CHART_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function ResultsDashboard() {
  const { results, outputFormat, selectedFields, currentRun } = useApifyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const debouncedSearch = useCallback(
    (val: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => handleSearch(val), 300);
    },
    [handleSearch]
  );

  // Filter results
  const filteredResults = results.filter((item: any) => {
    if (!searchTerm) return true;
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a: any, b: any) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / pageSize);
  const paginatedResults = sortedResults.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  // Get display fields
  const displayFields = selectedFields.length > 0 ? selectedFields : (results[0] ? Object.keys(results[0]).slice(0, 8) : []);

  // Prepare chart data
  const getChartData = () => {
    if (!results || results.length === 0) return [];

    // Find numeric fields
    const numericFields = displayFields.filter((f) => {
      const vals = results.map((r: any) => r[f]).filter((v) => v != null);
      return vals.length > 0 && vals.every((v) => !isNaN(Number(v)));
    });

    if (numericFields.length === 0) return [];

    // Use first 2 numeric fields for bar chart
    const field = numericFields[0];
    return results.slice(0, 15).map((r: any, i: number) => ({
      name: r[displayFields[0]] || `#${i + 1}`,
      [field]: Number(r[field]) || 0,
    }));
  };

  // Pie chart data - distribution of a string field
  const getPieData = () => {
    if (!results || results.length === 0) return [];

    const stringField = displayFields.find((f) => {
      const vals = results.map((r: any) => r[f]).filter((v) => v != null);
      return vals.length > 0 && vals.every((v) => typeof v === 'string');
    });

    if (!stringField) return [];

    const counts: Record<string, number> = {};
    results.forEach((r: any) => {
      const val = r[stringField] as string;
      if (val) {
        const key = val.length > 20 ? val.substring(0, 20) + '...' : val;
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  };

  // Export handler - downloads file directly from API response
  const handleExport = async () => {
    try {
      const res = await fetch('/api/apify/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: results,
          format: outputFormat,
          fields: selectedFields.length > 0 ? selectedFields : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erro ao exportar' }));
        throw new Error(errData.error);
      }

      // Get filename from Content-Disposition header
      const disposition = res.headers.get('content-disposition');
      const filenameMatch = disposition?.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || `apify-results-${Date.now()}.${outputFormat === 'excel' ? 'xls' : outputFormat}`;

      // Download the file as blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${results.length} itens exportados como ${outputFormat.toUpperCase()}`, {
        description: `Arquivo: ${filename}`,
        action: {
          label: 'OK',
          onClick: () => {},
        },
      });
    } catch (err: any) {
      toast.error('Erro ao exportar', { description: err.message });
    }
  };

  const chartData = getChartData();
  const pieData = getPieData();

  if (currentRun.status === 'idle' && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">Nenhum resultado ainda</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Configure e execute um ator para ver os resultados aqui
        </p>
      </div>
    );
  }

  if (currentRun.status === 'running') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-4 animate-pulse">
          <BarChart3 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-medium">Executando ator...</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Os resultados aparecerão aqui quando a execução for concluída
        </p>
        <div className="mt-4 space-y-2 w-full max-w-xs">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Resultados
            <Badge variant="secondary" className="font-mono text-xs">
              {results.length} registros
            </Badge>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nos resultados..."
              value={searchTerm}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-8 h-9 text-sm w-48 sm:w-64"
            />
          </div>
          <Button onClick={handleExport} size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table" className="gap-1.5 text-xs">
            <Table className="h-3.5 w-3.5" />
            Tabela
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-1.5 text-xs">
            <Code2 className="h-3.5 w-3.5" />
            JSON
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="mt-3">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <TableUI>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center text-xs">#</TableHead>
                      {displayFields.map((field) => (
                        <TableHead
                          key={field}
                          className="text-xs cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                          onClick={() => handleSort(field)}
                        >
                          <span className="flex items-center gap-1">
                            {field}
                            {sortField === field && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((row: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-center text-xs text-muted-foreground font-mono">
                          {page * pageSize + i + 1}
                        </TableCell>
                        {displayFields.map((field) => (
                          <TableCell key={field} className="text-xs max-w-[200px] truncate">
                            {row[field] != null ? String(row[field]) : '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </TableUI>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                Mostrando {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sortedResults.length)} de {sortedResults.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Chart View */}
        <TabsContent value="charts" className="mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {chartData.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-4">Gráfico de Barras</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 8,
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                      <Bar dataKey={Object.keys(chartData[0])[1]} fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 flex items-center justify-center h-[300px]">
                  <p className="text-sm text-muted-foreground">Nenhum dado numérico disponível para gráfico de barras</p>
                </CardContent>
              </Card>
            )}
            {pieData.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-4">Distribuição</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 flex items-center justify-center h-[300px]">
                  <p className="text-sm text-muted-foreground">Nenhum dado categórico disponível para gráfico de pizza</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* JSON View */}
        <TabsContent value="json" className="mt-3">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto">
                  {JSON.stringify(results.slice(0, 50), null, 2)}
                  {results.length > 50 && (
                    <span className="text-muted-foreground block mt-2">
                      {'// ... e mais '}{results.length - 50}{' registros'}
                    </span>
                  )}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
