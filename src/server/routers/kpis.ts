import { router, publicProcedure } from "../trpc";
import { demandEngine } from "../engines/demand-engine";

export const kpisRouter = router({
  getToday: publicProcedure.query(async () => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Base values com variação por hora/dia
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;
    const baseOrders = isWeekend ? 280 : isFriday ? 310 : 220;

    // Escala progressiva ao longo do dia
    const hourProgress = Math.min(hour / 23, 1);
    const ordersToday = Math.round(baseOrders * hourProgress * (0.9 + Math.random() * 0.2));
    const avgTicket = 34 + Math.round(Math.random() * 12);
    const revenue = ordersToday * avgTicket;
    const newCustomers = Math.round(ordersToday * 0.07);

    // Variação vs ontem (simulada mas consistente por hora)
    const seed = `${now.toDateString()}-${hour}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const variation = (Math.abs(hash) % 30) - 10; // -10 a +20

    // Hunger score da cidade
    const hungerScore = await demandEngine.getCityHungerScore();
    const peak = await demandEngine.getPeakForecast();

    return {
      ordersToday,
      revenue,
      avgTicket,
      newCustomers,
      changeOrders: variation,
      changeRevenue: variation + Math.round((Math.abs(hash >> 4) % 10) - 3),
      changeTicket: Math.round((Math.abs(hash >> 8) % 14) - 7),
      changeCustomers: Math.round((Math.abs(hash >> 12) % 40) - 5),
      hungerScore,
      peakHour: peak.hour,
    };
  }),
});
