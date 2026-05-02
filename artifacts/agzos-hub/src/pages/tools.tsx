import { useListTools } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ExternalLink, Wrench, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Tools() {
  const { data: tools, isLoading } = useListTools();

  const totalMonthlyCost = tools?.reduce((acc, tool) => {
    return acc + (tool.status === 'active' ? (tool.monthlyCost || 0) : 0);
  }, 0) || 0;

  const activeToolsCount = tools?.filter(t => t.status === 'active').length || 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agency Tools</h1>
          <p className="text-muted-foreground text-sm">Manage software subscriptions and credentials.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-muted/30 px-4 py-2 rounded-lg border border-border/50 text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Monthly Spend</p>
            <p className="text-xl font-bold text-foreground">${totalMonthlyCost.toLocaleString()}</p>
          </div>
          <Button data-testid="btn-add-tool" className="gap-2 h-14 px-6">
            <Plus className="w-4 h-4" /> Add Tool
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)
        ) : tools?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No tools registered.</p>
          </div>
        ) : (
          tools?.map((tool) => (
            <Card key={tool.id} className={`border-border/50 backdrop-blur-xl transition-all relative overflow-hidden ${tool.status === 'inactive' ? 'bg-muted/10 opacity-70 grayscale-[0.5]' : 'bg-card/50 hover:border-primary/30'}`}>
              {tool.status === 'inactive' && <div className="absolute inset-0 bg-background/20 z-10 pointer-events-none" />}
              <CardContent className="p-5 flex flex-col h-full relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-lg leading-tight flex items-center gap-2">
                      {tool.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1.5 capitalize text-[10px] px-2 py-0">
                      {tool.category}
                    </Badge>
                  </div>
                  <Switch checked={tool.status === 'active'} className="scale-75 origin-right" />
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  {tool.loginEmail && (
                    <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/20 p-2 rounded-md border border-border/30">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="truncate">{tool.loginEmail}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <span className="font-bold text-sm">
                    {tool.monthlyCost ? `$${tool.monthlyCost}/mo` : 'Free'}
                  </span>
                  {tool.url && (
                    <a href={tool.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors p-2 -mr-2">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
