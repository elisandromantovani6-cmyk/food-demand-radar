import { z } from "zod";
import { router, publicProcedure } from "../trpc";

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

/** Opções de borda recheada */
export const STUFFED_CRUST_OPTIONS = [
  { id: "catupiry", label: "Catupiry", price: 8.00 },
  { id: "cheddar", label: "Cheddar", price: 8.00 },
  { id: "chocolate", label: "Chocolate", price: 10.00 },
] as const;

export interface PizzaSizePrice {
  sizeId: string;
  price: number;
  cost: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  image?: string;
  active: boolean;
  popular: boolean;
  createdAt: string;
  // Campos específicos de pizza
  sizePrices?: PizzaSizePrice[];
  crusts?: string[];
}

export interface MenuCombo {
  id: string;
  name: string;
  description: string;
  items: string[]; // menu item ids
  originalPrice: number;
  comboPrice: number;
  active: boolean;
  createdAt: string;
}

// In-memory store (será persistido no Supabase depois)
const menuItems: MenuItem[] = [
  {
    id: "item-1",
    name: "Pizza Margherita",
    description: "Molho de tomate, mussarela, manjericão fresco",
    category: "pizzas",
    price: 39.90,
    cost: 12.50,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 25.90, cost: 8.00 },
      { sizeId: "media", price: 39.90, cost: 12.50 },
      { sizeId: "grande", price: 49.90, cost: 16.00 },
      { sizeId: "gigante", price: 59.90, cost: 19.00 },
    ],
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-2",
    name: "Pizza Calabresa",
    description: "Calabresa fatiada, cebola, mussarela, azeitonas",
    category: "pizzas",
    price: 42.90,
    cost: 14.00,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 27.90, cost: 9.00 },
      { sizeId: "media", price: 42.90, cost: 14.00 },
      { sizeId: "grande", price: 52.90, cost: 17.50 },
      { sizeId: "gigante", price: 62.90, cost: 21.00 },
    ],
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-3",
    name: "Pizza Quatro Queijos",
    description: "Mussarela, provolone, gorgonzola, parmesão",
    category: "pizzas",
    price: 46.90,
    cost: 16.00,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 29.90, cost: 10.00 },
      { sizeId: "media", price: 46.90, cost: 16.00 },
      { sizeId: "grande", price: 56.90, cost: 20.00 },
      { sizeId: "gigante", price: 66.90, cost: 24.00 },
    ],
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-4",
    name: "Pizza Frango com Catupiry",
    description: "Frango desfiado, catupiry, milho, mussarela",
    category: "pizzas",
    price: 44.90,
    cost: 15.00,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 28.90, cost: 9.50 },
      { sizeId: "media", price: 44.90, cost: 15.00 },
      { sizeId: "grande", price: 54.90, cost: 18.50 },
      { sizeId: "gigante", price: 64.90, cost: 22.00 },
    ],
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-5",
    name: "Pizza Portuguesa",
    description: "Presunto, ovos, cebola, ervilha, mussarela, azeitonas",
    category: "pizzas",
    price: 44.90,
    cost: 14.50,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 28.90, cost: 9.00 },
      { sizeId: "media", price: 44.90, cost: 14.50 },
      { sizeId: "grande", price: 54.90, cost: 18.00 },
      { sizeId: "gigante", price: 64.90, cost: 21.50 },
    ],
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-6",
    name: "Refrigerante 2L",
    description: "Coca-Cola, Guaraná ou Fanta",
    category: "bebidas",
    price: 12.90,
    cost: 5.00,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-7",
    name: "Suco Natural 500ml",
    description: "Laranja, limão, maracujá ou abacaxi",
    category: "bebidas",
    price: 9.90,
    cost: 3.50,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-9",
    name: "Petit Gâteau",
    description: "Bolo de chocolate com sorvete de baunilha",
    category: "sobremesas",
    price: 18.90,
    cost: 6.00,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
];

const menuCombos: MenuCombo[] = [];

const CATEGORIES = [
  { id: "pizzas", label: "Pizzas" },
  { id: "bebidas", label: "Bebidas" },
  { id: "extras", label: "Extras" },
  { id: "sobremesas", label: "Sobremesas" },
  { id: "entradas", label: "Entradas" },
];

export const menuRouter = router({
  getItems: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(({ input }) => {
      const cat = input?.category;
      const items = cat ? menuItems.filter(i => i.category === cat) : menuItems;
      return {
        items: items.sort((a, b) => a.category.localeCompare(b.category)),
        categories: CATEGORIES,
        stats: {
          total: menuItems.length,
          active: menuItems.filter(i => i.active).length,
          avgPrice: Math.round(menuItems.reduce((s, i) => s + i.price, 0) / menuItems.length * 100) / 100,
          avgMargin: Math.round(
            menuItems.reduce((s, i) => s + ((i.price - i.cost) / i.price) * 100, 0) / menuItems.length
          ),
        },
      };
    }),

  // Dados de configuração de pizza (tamanhos, massas, bordas)
  getPizzaConfig: publicProcedure.query(() => ({
    sizes: PIZZA_SIZES,
    crusts: CRUST_TYPES,
    stuffedCrust: STUFFED_CRUST_OPTIONS,
  })),

  addItem: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      category: z.string(),
      price: z.number().positive(),
      cost: z.number().min(0),
      sizePrices: z.array(z.object({
        sizeId: z.string(),
        price: z.number().positive(),
        cost: z.number().min(0),
      })).optional(),
      crusts: z.array(z.string()).optional(),
      image: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const item: MenuItem = {
        id: `item-${Date.now()}`,
        ...input,
        active: true,
        popular: false,
        createdAt: new Date().toISOString(),
      };
      menuItems.push(item);
      return item;
    }),

  updateItem: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
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
      image: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const idx = menuItems.findIndex(i => i.id === input.id);
      if (idx === -1) throw new Error("Item não encontrado");
      const { id, ...updates } = input;
      Object.assign(menuItems[idx], updates);
      return menuItems[idx];
    }),

  deleteItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const idx = menuItems.findIndex(i => i.id === input.id);
      if (idx === -1) throw new Error("Item não encontrado");
      menuItems.splice(idx, 1);
      return { success: true };
    }),

  // Combos
  getCombos: publicProcedure.query(() => {
    return menuCombos.map(combo => ({
      ...combo,
      itemDetails: combo.items
        .map(id => menuItems.find(i => i.id === id))
        .filter((i): i is MenuItem => i !== undefined),
      discount: Math.round((1 - combo.comboPrice / combo.originalPrice) * 100),
    }));
  }),

  createCombo: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      items: z.array(z.string()).min(2),
      comboPrice: z.number().positive(),
    }))
    .mutation(({ input }) => {
      const originalPrice = input.items.reduce((sum, id) => {
        const item = menuItems.find(i => i.id === id);
        return sum + (item?.price ?? 0);
      }, 0);

      const combo: MenuCombo = {
        id: `combo-${Date.now()}`,
        name: input.name,
        description: input.description,
        items: input.items,
        originalPrice,
        comboPrice: input.comboPrice,
        active: true,
        createdAt: new Date().toISOString(),
      };
      menuCombos.push(combo);
      return combo;
    }),

  deleteCombo: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const idx = menuCombos.findIndex(c => c.id === input.id);
      if (idx === -1) throw new Error("Combo não encontrado");
      menuCombos.splice(idx, 1);
      return { success: true };
    }),

  // Sugestões de combos baseadas no cardápio
  suggestCombos: publicProcedure.query(() => {
    const pizzas = menuItems.filter(i => i.category === "pizzas" && i.active);
    const bebidas = menuItems.filter(i => i.category === "bebidas" && i.active);
    const sobremesas = menuItems.filter(i => i.category === "sobremesas" && i.active);

    const suggestions: Array<{
      name: string;
      description: string;
      items: MenuItem[];
      originalPrice: number;
      suggestedPrice: number;
      margin: number;
      type: string;
    }> = [];

    // Pizza + Bebida (combo simples)
    if (pizzas.length && bebidas.length) {
      const popular = pizzas.find(p => p.popular) ?? pizzas[0];
      const drink = bebidas.find(b => b.price <= 13) ?? bebidas[0];
      const original = popular.price + drink.price;
      const suggested = Math.round(original * 0.85 * 100) / 100;
      const totalCost = popular.cost + drink.cost;
      suggestions.push({
        name: `${popular.name} + ${drink.name}`,
        description: `Combo econômico: ${popular.name} com ${drink.name}`,
        items: [popular, drink],
        originalPrice: original,
        suggestedPrice: suggested,
        margin: Math.round(((suggested - totalCost) / suggested) * 100),
        type: "pizza_bebida",
      });
    }

    // 2 Pizzas + Bebida 2L (combo família)
    if (pizzas.length >= 2 && bebidas.length) {
      const p1 = pizzas[0];
      const p2 = pizzas[1];
      const drink = bebidas.find(b => b.description.includes("2L")) ?? bebidas[0];
      const original = p1.price + p2.price + drink.price;
      const suggested = Math.round(original * 0.80 * 100) / 100;
      const totalCost = p1.cost + p2.cost + drink.cost;
      suggestions.push({
        name: "Combo Família",
        description: `2 pizzas + ${drink.name} com 20% de desconto`,
        items: [p1, p2, drink],
        originalPrice: original,
        suggestedPrice: suggested,
        margin: Math.round(((suggested - totalCost) / suggested) * 100),
        type: "familia",
      });
    }

    // Pizza + Bebida + Sobremesa (combo completo)
    if (pizzas.length && bebidas.length && sobremesas.length) {
      const pizza = pizzas.find(p => p.popular) ?? pizzas[0];
      const drink = bebidas[0];
      const dessert = sobremesas[0];
      const original = pizza.price + drink.price + dessert.price;
      const suggested = Math.round(original * 0.82 * 100) / 100;
      const totalCost = pizza.cost + drink.cost + dessert.cost;
      suggestions.push({
        name: "Combo Completo",
        description: `${pizza.name} + ${drink.name} + ${dessert.name}`,
        items: [pizza, drink, dessert],
        originalPrice: original,
        suggestedPrice: suggested,
        margin: Math.round(((suggested - totalCost) / suggested) * 100),
        type: "completo",
      });
    }

    return suggestions;
  }),
});
