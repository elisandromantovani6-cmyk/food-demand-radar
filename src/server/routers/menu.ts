import { z } from "zod";
import { router, publicProcedure, supabaseAdmin } from "../trpc";

/** Tamanhos de pizza disponíveis */
export const PIZZA_SIZES = [
  { id: "brotinho", label: "Brotinho", cm: 18 },
  { id: "media", label: "Média", cm: 30 },
  { id: "grande", label: "Grande", cm: 35 },
  { id: "gigante", label: "Gigante", cm: 40 },
] as const;

/** Tipos de massa com restrições de tamanho */
export const CRUST_TYPES = [
  { id: "tradicional", label: "Tradicional", allowedSizes: ["brotinho", "media", "grande", "gigante"] },
  { id: "fina", label: "Fina", allowedSizes: ["media", "grande", "gigante"] },
  { id: "superfina", label: "Superfina", allowedSizes: ["grande", "gigante"] },
  { id: "pan", label: "Pan", allowedSizes: ["media"] },
] as const;

/** Subcategorias de pizza */
export const PIZZA_SUBCATEGORIES = [
  { id: "mais_pedidas", label: "Mais Pedidas" },
  { id: "classicas", label: "Clássicas" },
  { id: "especiais", label: "Especiais" },
] as const;

/** Preços padrão por subcategoria de pizza */
export const PIZZA_DEFAULT_PRICES: Record<string, Array<{ sizeId: string; price: number }>> = {
  mais_pedidas: [
    { sizeId: "brotinho", price: 36.90 },
    { sizeId: "media", price: 76.90 },
    { sizeId: "grande", price: 87.90 },
    { sizeId: "gigante", price: 98.90 },
  ],
  classicas: [
    { sizeId: "brotinho", price: 39.90 },
    { sizeId: "media", price: 81.90 },
    { sizeId: "grande", price: 93.90 },
    { sizeId: "gigante", price: 105.90 },
  ],
  especiais: [
    { sizeId: "brotinho", price: 42.90 },
    { sizeId: "media", price: 93.90 },
    { sizeId: "grande", price: 105.90 },
    { sizeId: "gigante", price: 118.90 },
  ],
};

const CATEGORIES = [
  { id: "pizzas", label: "Pizzas" },
  { id: "sanduiches", label: "Sanduíches" },
  { id: "bebidas", label: "Bebidas" },
  { id: "sobremesas", label: "Sobremesas" },
  { id: "molhos", label: "Molhos" },
  { id: "acompanhamentos", label: "Acompanhamentos" },
  { id: "borda_recheada", label: "Borda Recheada" },
];

export const menuRouter = router({
  getItems: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      if (!tenantId) {
        return { items: [], categories: CATEGORIES, stats: { total: 0, active: 0, avgPrice: 0, avgMargin: 0 } };
      }

      let query = supabaseAdmin
        .from("menu_items")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("category")
        .order("name");

      if (input?.category) {
        query = query.eq("category", input.category);
      }

      const { data: items, error } = await query;
      if (error) throw new Error(error.message);

      const allItems = items ?? [];

      // Para stats, buscar todos (sem filtro de categoria)
      let totalItems = allItems;
      if (input?.category) {
        const { data: all } = await supabaseAdmin
          .from("menu_items")
          .select("id, price, available")
          .eq("tenant_id", tenantId);
        totalItems = all ?? [];
      }

      return {
        items: allItems.map(i => ({
          id: i.id,
          name: i.name,
          description: i.description ?? "",
          category: i.category,
          subcategory: i.subcategory,
          price: Number(i.price),
          cost: 0,
          image: i.image,
          active: i.available ?? true,
          popular: false,
          createdAt: i.created_at,
          sizePrices: i.size_prices && typeof i.size_prices === "object" && Array.isArray(i.size_prices)
            ? (i.size_prices as Array<{ sizeId: string; price: number }>).map(sp => ({ ...sp, price: Number(sp.price), cost: 0 }))
            : undefined,
          crusts: i.category === "pizzas" ? ["tradicional", "fina", "superfina", "pan"] : undefined,
          allowHalf: i.allow_half ?? undefined,
        })),
        categories: CATEGORIES,
        stats: {
          total: totalItems.length,
          active: totalItems.filter(i => i.available !== false).length,
          avgPrice: totalItems.length > 0
            ? Math.round(totalItems.reduce((s, i) => s + Number(i.price), 0) / totalItems.length * 100) / 100
            : 0,
          avgMargin: 0,
        },
      };
    }),

  getPizzaConfig: publicProcedure.query(() => ({
    sizes: PIZZA_SIZES,
    crusts: CRUST_TYPES,
    subcategories: PIZZA_SUBCATEGORIES,
    defaultPrices: PIZZA_DEFAULT_PRICES,
  })),

  addItem: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      category: z.string(),
      subcategory: z.string().optional(),
      price: z.number().positive(),
      cost: z.number().min(0),
      sizePrices: z.array(z.object({
        sizeId: z.string(),
        price: z.number().positive(),
        cost: z.number().min(0),
      })).optional(),
      crusts: z.array(z.string()).optional(),
      allowHalf: z.boolean().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      if (!tenantId) throw new Error("Não autenticado");

      const isPizza = input.category === "pizzas";
      const sizePrices = input.sizePrices ?? (isPizza && input.subcategory
        ? PIZZA_DEFAULT_PRICES[input.subcategory] ?? PIZZA_DEFAULT_PRICES.mais_pedidas
        : undefined);

      const { data, error } = await supabaseAdmin
        .from("menu_items")
        .insert({
          tenant_id: tenantId,
          name: input.name,
          description: input.description,
          category: input.category,
          subcategory: input.subcategory,
          price: input.price,
          image: input.image,
          available: true,
          allow_half: input.allowHalf ?? (isPizza ? true : false),
          size_prices: sizePrices ?? {},
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? "",
        category: data.category,
        subcategory: data.subcategory,
        price: Number(data.price),
        cost: 0,
        active: true,
        popular: false,
        createdAt: data.created_at,
        sizePrices: sizePrices?.map(sp => ({ ...sp, cost: 0 })),
        crusts: isPizza ? ["tradicional", "fina", "superfina", "pan"] : undefined,
        allowHalf: data.allow_half,
      };
    }),

  updateItem: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      subcategory: z.string().optional(),
      price: z.number().positive().optional(),
      cost: z.number().min(0).optional(),
      active: z.boolean().optional(),
      popular: z.boolean().optional(),
      sizePrices: z.array(z.object({
        sizeId: z.string(),
        price: z.number().positive(),
        cost: z.number().min(0),
      })).optional(),
      crusts: z.array(z.string()).optional(),
      allowHalf: z.boolean().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      if (!tenantId) throw new Error("Não autenticado");

      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.category !== undefined) updates.category = input.category;
      if (input.subcategory !== undefined) updates.subcategory = input.subcategory;
      if (input.price !== undefined) updates.price = input.price;
      if (input.active !== undefined) updates.available = input.active;
      if (input.allowHalf !== undefined) updates.allow_half = input.allowHalf;
      if (input.image !== undefined) updates.image = input.image;
      if (input.sizePrices !== undefined) updates.size_prices = input.sizePrices;

      const { data, error } = await supabaseAdmin
        .from("menu_items")
        .update(updates)
        .eq("id", input.id)
        .eq("tenant_id", tenantId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? "",
        category: data.category,
        subcategory: data.subcategory,
        price: Number(data.price),
        cost: 0,
        active: data.available,
        popular: false,
        createdAt: data.created_at,
      };
    }),

  deleteItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      if (!tenantId) throw new Error("Não autenticado");

      const { error } = await supabaseAdmin
        .from("menu_items")
        .delete()
        .eq("id", input.id)
        .eq("tenant_id", tenantId);

      if (error) throw new Error(error.message);
      return { success: true };
    }),

  // Combos
  getCombos: publicProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;
    if (!tenantId) return [];

    const { data: combos, error } = await supabaseAdmin
      .from("menu_combos")
      .select("*")
      .eq("tenant_id", tenantId);

    if (error) throw new Error(error.message);

    return (combos ?? []).map(combo => ({
      id: combo.id,
      name: combo.name,
      description: combo.description ?? "",
      items: (combo.items as string[]) ?? [],
      originalPrice: Number(combo.original_price),
      comboPrice: Number(combo.combo_price),
      active: combo.active ?? true,
      createdAt: combo.created_at,
      discount: Math.round((1 - Number(combo.combo_price) / Number(combo.original_price)) * 100),
      itemDetails: [] as Array<{ id: string; name: string; price: number }>,
    }));
  }),

  createCombo: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      items: z.array(z.string()).min(2),
      comboPrice: z.number().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      if (!tenantId) throw new Error("Não autenticado");

      // Calcular preço original
      const { data: menuData } = await supabaseAdmin
        .from("menu_items")
        .select("id, price")
        .eq("tenant_id", tenantId)
        .in("id", input.items);

      const originalPrice = (menuData ?? []).reduce((sum, i) => sum + Number(i.price), 0);

      const { data, error } = await supabaseAdmin
        .from("menu_combos")
        .insert({
          tenant_id: tenantId,
          name: input.name,
          description: input.description,
          items: input.items,
          original_price: originalPrice,
          combo_price: input.comboPrice,
          active: true,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? "",
        items: data.items as string[],
        originalPrice: Number(data.original_price),
        comboPrice: Number(data.combo_price),
        active: true,
        createdAt: data.created_at,
      };
    }),

  deleteCombo: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId;
      if (!tenantId) throw new Error("Não autenticado");

      const { error } = await supabaseAdmin
        .from("menu_combos")
        .delete()
        .eq("id", input.id)
        .eq("tenant_id", tenantId);

      if (error) throw new Error(error.message);
      return { success: true };
    }),

  suggestCombos: publicProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;
    if (!tenantId) return [];

    const { data: items } = await supabaseAdmin
      .from("menu_items")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("available", true);

    if (!items?.length) return [];

    const pizzas = items.filter(i => i.category === "pizzas");
    const bebidas = items.filter(i => i.category === "bebidas");
    const sobremesas = items.filter(i => i.category === "sobremesas");

    const suggestions: Array<{
      name: string;
      description: string;
      items: Array<{ id: string; name: string; price: number }>;
      originalPrice: number;
      suggestedPrice: number;
      margin: number;
      type: string;
    }> = [];

    if (pizzas.length && bebidas.length) {
      const pizza = pizzas[0];
      const drink = bebidas.find(b => Number(b.price) <= 13) ?? bebidas[0];
      const original = Number(pizza.price) + Number(drink.price);
      const suggested = Math.round(original * 0.85 * 100) / 100;
      suggestions.push({
        name: `${pizza.name} + ${drink.name}`,
        description: `Combo econômico: ${pizza.name} com ${drink.name}`,
        items: [
          { id: pizza.id, name: pizza.name, price: Number(pizza.price) },
          { id: drink.id, name: drink.name, price: Number(drink.price) },
        ],
        originalPrice: original,
        suggestedPrice: suggested,
        margin: 0,
        type: "pizza_bebida",
      });
    }

    if (pizzas.length >= 2 && bebidas.length) {
      const p1 = pizzas[0];
      const p2 = pizzas[1];
      const drink = bebidas.find(b => (b.description ?? "").includes("2L")) ?? bebidas[0];
      const original = Number(p1.price) + Number(p2.price) + Number(drink.price);
      const suggested = Math.round(original * 0.80 * 100) / 100;
      suggestions.push({
        name: "Combo Família",
        description: `2 pizzas + ${drink.name} com 20% de desconto`,
        items: [
          { id: p1.id, name: p1.name, price: Number(p1.price) },
          { id: p2.id, name: p2.name, price: Number(p2.price) },
          { id: drink.id, name: drink.name, price: Number(drink.price) },
        ],
        originalPrice: original,
        suggestedPrice: suggested,
        margin: 0,
        type: "familia",
      });
    }

    if (pizzas.length && bebidas.length && sobremesas.length) {
      const pizza = pizzas[0];
      const drink = bebidas[0];
      const dessert = sobremesas[0];
      const original = Number(pizza.price) + Number(drink.price) + Number(dessert.price);
      const suggested = Math.round(original * 0.82 * 100) / 100;
      suggestions.push({
        name: "Combo Completo",
        description: `${pizza.name} + ${drink.name} + ${dessert.name}`,
        items: [
          { id: pizza.id, name: pizza.name, price: Number(pizza.price) },
          { id: drink.id, name: drink.name, price: Number(drink.price) },
          { id: dessert.id, name: dessert.name, price: Number(dessert.price) },
        ],
        originalPrice: original,
        suggestedPrice: suggested,
        margin: 0,
        type: "completo",
      });
    }

    return suggestions;
  }),
});
