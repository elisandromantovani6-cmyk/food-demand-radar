"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const platformColors: Record<string, string> = {
  whatsapp: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  instagram: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  google_ads: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  meta_ads: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
};

export function ActiveCampaigns() {
  const { data: campaigns } = trpc.campaigns.getSuggested.useQuery(
    {},
    { refetchInterval: 120000 }
  );

  const topCampaigns = (campaigns ?? []).slice(0, 3);

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Campanhas Sugeridas</h3>
          <Link href="/campaigns" className="text-[10px] text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {topCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center mb-2">
              <Megaphone className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Nenhuma campanha sugerida</p>
            <Link href="/campaigns" className="text-xs text-primary hover:underline mt-1">
              Ver campanhas
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {topCampaigns.map(campaign => (
              <div
                key={campaign.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{campaign.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{campaign.copyTitle}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {campaign.platforms.slice(0, 2).map(platform => (
                      <Badge key={platform} className={cn(
                        "text-[9px] border px-1.5",
                        platformColors[platform] ?? "bg-accent/50 text-muted-foreground border-border/50"
                      )}>
                        {platform}
                      </Badge>
                    ))}
                    <span className="text-[10px] text-muted-foreground">
                      ~{campaign.estimatedReach.toLocaleString()} alcance
                    </span>
                  </div>
                </div>
                <Badge className={cn(
                  "text-[9px] shrink-0 border",
                  campaign.priority === "alta" ? "bg-red-500/15 text-red-400 border-red-500/20" :
                  campaign.priority === "média" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" :
                  "bg-accent/50 text-muted-foreground border-border/50"
                )}>
                  {campaign.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
