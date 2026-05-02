import { useListInvoices, useGetFinancialSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, DollarSign, TrendingUp, AlertCircle, Clock, FileText } from "lucide-react";

export default function Financial() {
  const { data: invoices, isLoading } = useListInvoices({});
  const { data: summary, isLoading: summaryLoading } = useGetFinancialSummary();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "sent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "overdue": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "draft": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground text-sm">Manage invoices, revenue, and agency expenses.</p>
        </div>
        <Button data-testid="btn-create-invoice" className="gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue (YTD)</p>
              {summaryLoading ? <Skeleton className="h-8 w-32 mt-1" /> : <p className="text-3xl font-bold tracking-tight">${summary?.totalRevenue?.toLocaleString() || "0"}</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Profit (YTD)</p>
              {summaryLoading ? <Skeleton className="h-8 w-32 mt-1" /> : <p className="text-3xl font-bold tracking-tight text-emerald-500">${summary?.profit?.toLocaleString() || "0"}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl border-destructive/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue Invoices</p>
              {summaryLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold tracking-tight text-destructive">{summary?.overdueInvoices || "0"}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
        </CardHeader>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/20 uppercase border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice</th>
                <th className="px-6 py-4 font-medium">Client / Project</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-5 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : invoices?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No invoices found.</p>
                  </td>
                </tr>
              ) : (
                invoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/10 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium font-mono text-xs">{invoice.number}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{invoice.clientName || '—'}</div>
                      {invoice.projectName && <div className="text-xs text-muted-foreground mt-0.5">{invoice.projectName}</div>}
                    </td>
                    <td className="px-6 py-4 font-semibold">${invoice.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize px-2.5 py-0.5 text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground flex items-center justify-end gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-50" />
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
