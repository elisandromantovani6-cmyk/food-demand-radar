import { router } from "../trpc";
import { demandRouter } from "./demand";
import { alertsRouter } from "./alerts";
import { campaignsRouter } from "./campaigns";
import { trendsRouter } from "./trends";
import { expansionRouter } from "./expansion";
import { dataRouter } from "./data";
import { kpisRouter } from "./kpis";

export const appRouter = router({
  demand: demandRouter,
  alerts: alertsRouter,
  campaigns: campaignsRouter,
  trends: trendsRouter,
  expansion: expansionRouter,
  data: dataRouter,
  kpis: kpisRouter,
});

export type AppRouter = typeof appRouter;
