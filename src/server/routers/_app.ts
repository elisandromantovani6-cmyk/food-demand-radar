import { router } from "../trpc";
import { demandRouter } from "./demand";
import { alertsRouter } from "./alerts";
import { campaignsRouter } from "./campaigns";
import { trendsRouter } from "./trends";
import { expansionRouter } from "./expansion";
import { dataRouter } from "./data";
import { kpisRouter } from "./kpis";
import { menuRouter } from "./menu";
import { whatsappRouter } from "./whatsapp";

export const appRouter = router({
  demand: demandRouter,
  alerts: alertsRouter,
  campaigns: campaignsRouter,
  trends: trendsRouter,
  expansion: expansionRouter,
  data: dataRouter,
  kpis: kpisRouter,
  menu: menuRouter,
  whatsapp: whatsappRouter,
});

export type AppRouter = typeof appRouter;
