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
  subcategory?: string;
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

/** Subcategorias de pizza */
export const PIZZA_SUBCATEGORIES = [
  { id: "mais_pedidas", label: "Mais Pedidas" },
  { id: "classicas", label: "Clássicas" },
  { id: "especiais", label: "Especiais" },
] as const;

/** Preços padrão por subcategoria de pizza */
export const PIZZA_DEFAULT_PRICES: Record<string, PizzaSizePrice[]> = {
  mais_pedidas: [
    { sizeId: "brotinho", price: 36.90, cost: 0 },
    { sizeId: "media", price: 76.90, cost: 0 },
    { sizeId: "grande", price: 87.90, cost: 0 },
    { sizeId: "gigante", price: 98.90, cost: 0 },
  ],
  classicas: [
    { sizeId: "brotinho", price: 39.90, cost: 0 },
    { sizeId: "media", price: 81.90, cost: 0 },
    { sizeId: "grande", price: 93.90, cost: 0 },
    { sizeId: "gigante", price: 105.90, cost: 0 },
  ],
  especiais: [
    { sizeId: "brotinho", price: 42.90, cost: 0 },
    { sizeId: "media", price: 93.90, cost: 0 },
    { sizeId: "grande", price: 105.90, cost: 0 },
    { sizeId: "gigante", price: 118.90, cost: 0 },
  ],
};

/** Retorna sizePrices padrão para uma subcategoria */
function getDefaultSizePrices(subcategory: string): PizzaSizePrice[] {
  return PIZZA_DEFAULT_PRICES[subcategory] ?? PIZZA_DEFAULT_PRICES.mais_pedidas;
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
  // === MAIS PEDIDAS ===
  {
    id: "item-1",
    name: "Margherita",
    description: "Queijo, tomate e manjericão",
    category: "pizzas",
    subcategory: "mais_pedidas",
    price: 76.90,
    cost: 0,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("mais_pedidas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-2",
    name: "Calabresa",
    description: "Queijo, calabresa e cebola",
    category: "pizzas",
    subcategory: "mais_pedidas",
    price: 76.90,
    cost: 0,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("mais_pedidas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-pepperoni",
    name: "Pepperoni",
    description: "Queijo e pepperoni",
    category: "pizzas",
    subcategory: "mais_pedidas",
    price: 76.90,
    cost: 0,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("mais_pedidas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-3queijos",
    name: "3 Queijos",
    description: "Queijo, requeijão e parmesão ralado",
    category: "pizzas",
    subcategory: "mais_pedidas",
    price: 76.90,
    cost: 0,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("mais_pedidas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-frango-req",
    name: "Frango c/ Requeijão Especial",
    description: "Frango desfiado, cebola e requeijão",
    category: "pizzas",
    subcategory: "mais_pedidas",
    price: 76.90,
    cost: 0,
    active: true,
    popular: true,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("mais_pedidas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-queijo",
    name: "Queijo",
    description: "Queijo e molho",
    category: "pizzas",
    subcategory: "mais_pedidas",
    price: 76.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("mais_pedidas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  // === CLÁSSICAS ===
  {
    id: "item-cheddar-bacon",
    name: "Cheddar e Bacon",
    description: "Queijo, molho sabor queijo cheddar, bacon e orégano",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-3",
    name: "4 Queijos",
    description: "Parmesão, molho sabor queijo cheddar, frango grelhado, bacon",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-cheddar-pepperoni",
    name: "Cheddar e Pepperoni",
    description: "Queijo, molho sabor queijo cheddar, pepperoni, azeite e orégano",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-napolitana",
    name: "Napolitana",
    description: "Queijo, tomate e parmesão ralado",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-corn-bacon",
    name: "Corn & Bacon",
    description: "Queijo, bacon e milho",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-catuperoni",
    name: "Catuperoni",
    description: "Queijo, pepperoni, requeijão e parmesão ralado",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-frango-caipira",
    name: "Frango Caipira",
    description: "Queijo, frango desfiado, milho e Catupiry",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-veggie",
    name: "Veggie",
    description: "Queijo, azeitona preta, champignon, cebola e pimentão verde",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-5",
    name: "Portuguesa",
    description: "Queijo, cebola, azeitona preta, pimentão verde, ovo de codorna e presunto",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-pao-alho",
    name: "Pão de Alho",
    description: "Queijo, pão ciabatta, pasta de alho e parmesão ralado",
    category: "pizzas",
    subcategory: "classicas",
    price: 81.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("classicas"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  // === ESPECIAIS ===
  {
    id: "item-carne-seca",
    name: "Carne Seca",
    description: "Queijo, carne seca, cream cheese e cebola",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-frango-grelhado",
    name: "Frango Grelhado",
    description: "Queijo, frango, requeijão, tomate, azeitona preta e manjericão",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-pepperrock",
    name: "Pepperrock",
    description: "Queijo, pepperoni, azeitona preta, parmesão ralado, alho granulado e cream cheese",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-extravaganzza",
    name: "Extravaganzza",
    description: "Queijo, azeitona preta, champignon, pepperoni, pimentão verde, cebola e presunto",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-meat-bacon",
    name: "Meat & Bacon",
    description: "Cream cheese, pepperoni, presunto, calabresa, bacon e azeite",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-la-bianca",
    name: "La Bianca",
    description: "Queijo de vaca e búfala, requeijão, parmesão ralado e manjericão",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-carne-seca-cc",
    name: "Carne Seca c/ Cream Cheese",
    description: "Cream cheese, carne seca, cebola, queijo e azeite",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-egg-bacon",
    name: "Egg & Bacon",
    description: "Queijo, bacon, cebola, cream cheese e ovo de codorna",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-calabresa-esp",
    name: "Calabresa Especial",
    description: "Queijo, calabresa, cebola, azeitona preta e cream cheese",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  {
    id: "item-frango-cc",
    name: "Frango c/ Cream Cheese",
    description: "Queijo, frango, cream cheese e parmesão ralado",
    category: "pizzas",
    subcategory: "especiais",
    price: 93.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: getDefaultSizePrices("especiais"),
    crusts: ["tradicional", "fina", "superfina", "pan"],
  },
  // === SANDUÍCHES ===
  {
    id: "item-sand-frango",
    name: "Sanduíche Frango, Cheddar & Bacon",
    description: "Parmesão, molho sabor queijo cheddar, frango grelhado, bacon e azeite",
    category: "sanduiches",
    price: 31.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sand-caprese",
    name: "Caprese",
    description: "Queijo de vaca e búfala, cebola, tomate, azeitona preta, manjericão e azeite",
    category: "sanduiches",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sand-carne-seca",
    name: "Carne Seca c/ Cream Cheese",
    description: "Cream cheese, carne seca, cebola, queijo e azeite",
    category: "sanduiches",
    price: 31.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sand-frango-4q",
    name: "Frango 4 Queijos",
    description: "Queijo, cream cheese, frango grelhado, gorgonzola, parmesão e azeite",
    category: "sanduiches",
    price: 29.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sand-meat-bacon",
    name: "Meat & Bacon",
    description: "Cream cheese, pepperoni, presunto, calabresa, bacon e azeite",
    category: "sanduiches",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-sand-chicken-bacon",
    name: "Chicken & Bacon",
    description: "Cream cheese, bacon, frango grelhado, tomate, cebola, parmesão ralado e azeite",
    category: "sanduiches",
    price: 28.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  // === BEBIDAS ===
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
  // === SOBREMESAS ===
  {
    id: "item-canela-bites",
    name: "Canela Bites",
    description: "Pedaços crocantes de massa pan, envoltos em açúcar e canela. Coberturas: Chocolate, Doce de Leite ou Ovomaltine",
    category: "sobremesas",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-pizza-churros",
    name: "Pizza de Churros",
    description: "Coberta com doce de leite, açúcar e canela",
    category: "sobremesas",
    price: 57.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 27.90, cost: 0 },
      { sizeId: "media", price: 57.90, cost: 0 },
    ],
  },
  {
    id: "item-pizza-mms",
    name: "Pizza de M&M's",
    description: "Coberta com creme de baunilha, brigadeiro de chocolate e M&M's",
    category: "sobremesas",
    price: 57.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 27.90, cost: 0 },
      { sizeId: "media", price: 57.90, cost: 0 },
    ],
  },
  {
    id: "item-pizza-brigadeiro",
    name: "Pizza de Brigadeiro",
    description: "Coberta com creme de baunilha, brigadeiro de chocolate e granulado",
    category: "sobremesas",
    price: 57.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 27.90, cost: 0 },
      { sizeId: "media", price: 57.90, cost: 0 },
    ],
  },
  {
    id: "item-pizza-ovomaltine",
    name: "Pizza de Ovomaltine",
    description: "Coberta com creme de baunilha e creme de Ovomaltine",
    category: "sobremesas",
    price: 57.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 27.90, cost: 0 },
      { sizeId: "media", price: 57.90, cost: 0 },
    ],
  },
  {
    id: "item-pizza-doce-leite",
    name: "Pizza de Doce de Leite",
    description: "Coberta com doce de leite",
    category: "sobremesas",
    price: 57.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 27.90, cost: 0 },
      { sizeId: "media", price: 57.90, cost: 0 },
    ],
  },
  {
    id: "item-chocobread",
    name: "Chocobread",
    description: "Massa recheada de brigadeiro de chocolate e cobertura de creme de baunilha com granulado",
    category: "sobremesas",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-churrosbread",
    name: "Churrosbread",
    description: "Massa recheada de doce de leite, coberta de açúcar e canela",
    category: "sobremesas",
    price: 27.90,
    cost: 0,
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
      image: z.string().optional(),
    }))
    .mutation(({ input }) => {
      // Auto-preencher sizePrices e crusts para pizzas se não fornecidos
      const isPizza = input.category === "pizzas";
      const sizePrices = input.sizePrices ?? (isPizza && input.subcategory ? getDefaultSizePrices(input.subcategory) : undefined);
      const crusts = input.crusts ?? (isPizza ? ["tradicional", "fina", "superfina", "pan"] : undefined);

      const item: MenuItem = {
        id: `item-${Date.now()}`,
        ...input,
        ...(sizePrices ? { sizePrices } : {}),
        ...(crusts ? { crusts } : {}),
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
