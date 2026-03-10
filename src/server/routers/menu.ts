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
  allowHalf?: boolean; // permite meio a meio
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
    allowHalf: true,
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
  { id: "item-refri-2l", name: "Refrigerante 2L", description: "Coca-Cola, Coca Zero, Fanta Uva, Fanta Laranja, Kuat, Sprite Zero, Sprite", category: "bebidas", price: 15.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-refri-500", name: "Refrigerante 500ml", description: "Coca-Cola, Coca Zero ou Fanta Laranja", category: "bebidas", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-refri-lata", name: "Refrigerante Lata", description: "Coca-Cola, Coca Zero, Fanta Laranja, Sprite, Kuat", category: "bebidas", price: 10.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-suco-dellvalle", name: "Suco Dell Valle", description: "Pêssego, Uva ou Maracujá", category: "bebidas", price: 10.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-heineken", name: "Heineken 330ml", description: "Cerveja Heineken long neck", category: "bebidas", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-amstel", name: "Amstel", description: "Cerveja Amstel", category: "bebidas", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-agua-gas", name: "Água com Gás", description: "Água mineral com gás", category: "bebidas", price: 6.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-agua-sem-gas", name: "Água sem Gás", description: "Água mineral sem gás", category: "bebidas", price: 6.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
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
  // === MOLHOS — Salgados R$ 12,90 ===
  { id: "item-molho-catupiry", name: "Catupiry", description: "Molho cremoso de Catupiry", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-cheddar", name: "Cheddar", description: "Molho sabor queijo cheddar", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-pizza", name: "Molho de Pizza", description: "Molho de tomate especial para pizza", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-sweet-chilli", name: "Sweet Chilli", description: "Molho agridoce de pimenta", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-maionese-grill", name: "Maionese Grill", description: "Maionese temperada para grill", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-chipotle", name: "Chipotle", description: "Molho defumado de chipotle", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-pasta-alho", name: "Pasta de Alho", description: "Pasta cremosa de alho", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-cream-cheese", name: "Cream Cheese", description: "Molho cremoso de cream cheese", category: "molhos", price: 12.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  // === MOLHOS — Doces R$ 9,90 ===
  { id: "item-molho-doce-leite", name: "Doce de Leite", description: "Molho de doce de leite", category: "molhos", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-pistache", name: "Pistache", description: "Creme de pistache", category: "molhos", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-brigadeiro", name: "Brigadeiro", description: "Molho de brigadeiro de chocolate", category: "molhos", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-ovomaltine", name: "Ovomaltine", description: "Creme de Ovomaltine", category: "molhos", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-nutella", name: "Nutella", description: "Creme de avelã Nutella", category: "molhos", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-molho-baunilha", name: "Baunilha", description: "Creme de baunilha", category: "molhos", price: 9.90, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  // === ACOMPANHAMENTOS ===
  {
    id: "item-cheddar-volcano",
    name: "Cheddar Volcano",
    description: "Queijo e molho sabor queijo cheddar",
    category: "acompanhamentos",
    price: 37.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-alho-roll",
    name: "Alho Roll",
    description: "Entrada crocante feita de massa pan, recheada com pasta de alho e parmesão ralado",
    category: "acompanhamentos",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 17.90, cost: 0 },
      { sizeId: "media", price: 27.90, cost: 0 },
    ],
  },
  {
    id: "item-chicken-roll",
    name: "Chicken Roll",
    description: "Massa crocante de massa pan, recheada de frango desfiado, queijo e molho de tomate, coberta de maionese grill, molho chipotle e parmesão ralado",
    category: "acompanhamentos",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
    sizePrices: [
      { sizeId: "brotinho", price: 17.90, cost: 0 },
      { sizeId: "media", price: 27.90, cost: 0 },
    ],
  },
  {
    id: "item-cheesebread-margherita",
    name: "Cheesebread Margherita",
    description: "Pão de queijo recheado sabor margherita",
    category: "acompanhamentos",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-cheesebread-4queijos",
    name: "Cheesebread 4 Queijos",
    description: "Pão de queijo recheado sabor 4 queijos",
    category: "acompanhamentos",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-cheesebread-calabresa",
    name: "Cheesebread Calabresa",
    description: "Pão de queijo recheado sabor calabresa",
    category: "acompanhamentos",
    price: 27.90,
    cost: 0,
    active: true,
    popular: false,
    createdAt: new Date().toISOString(),
  },
  // === BORDA RECHEADA ===
  { id: "item-borda-catupiry", name: "Borda de Catupiry", description: "Borda recheada com Catupiry", category: "borda_recheada", price: 12.00, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-borda-requeijao", name: "Borda de Requeijão", description: "Borda recheada com requeijão", category: "borda_recheada", price: 12.00, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-borda-cream-cheese", name: "Borda de Cream Cheese", description: "Borda recheada com cream cheese", category: "borda_recheada", price: 12.00, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
  { id: "item-borda-pasta-alho", name: "Borda de Pasta de Alho", description: "Borda recheada com pasta de alho", category: "borda_recheada", price: 12.00, cost: 0, active: true, popular: false, createdAt: new Date().toISOString() },
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
      allowHalf: z.boolean().optional(),
      image: z.string().optional(),
    }))
    .mutation(({ input }) => {
      // Auto-preencher sizePrices e crusts para pizzas se não fornecidos
      const isPizza = input.category === "pizzas";
      const sizePrices = input.sizePrices ?? (isPizza && input.subcategory ? getDefaultSizePrices(input.subcategory) : undefined);
      const crusts = input.crusts ?? (isPizza ? ["tradicional", "fina", "superfina", "pan"] : undefined);
      const allowHalf = input.allowHalf ?? (isPizza ? true : undefined);

      const item: MenuItem = {
        id: `item-${Date.now()}`,
        ...input,
        ...(sizePrices ? { sizePrices } : {}),
        ...(crusts ? { crusts } : {}),
        ...(allowHalf !== undefined ? { allowHalf } : {}),
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
      allowHalf: z.boolean().optional(),
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
