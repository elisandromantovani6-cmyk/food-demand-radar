"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UtensilsCrossed, Plus, X, Star, Sparkles, Package,
  Percent, Trash2, Check, DollarSign, TrendingUp,
  Upload, FileText, AlertCircle, Loader2, ChevronDown, ChevronUp, Eye,
  Pizza, Ruler, ImagePlus, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  { id: "pizzas", label: "Pizzas" },
  { id: "sanduiches", label: "Sanduíches" },
  { id: "acompanhamentos", label: "Acompanhamentos" },
  { id: "bebidas", label: "Bebidas" },
  { id: "sobremesas", label: "Sobremesas" },
  { id: "molhos", label: "Molhos" },
  { id: "borda_recheada", label: "Borda Recheada" },
  { id: "entradas", label: "Entradas" },
  { id: "extras", label: "Extras" },
];

export default function MenuPage() {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCreateCombo, setShowCreateCombo] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [comboForm, setComboForm] = useState({ name: "", description: "", price: "" });
  const [itemForm, setItemForm] = useState({
    name: "", description: "", category: "pizzas", subcategory: "", price: "", cost: "",
  });
  const [filter, setFilter] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string; description: string; category: string; subcategory: string; price: string; cost: string;
  }>({ name: "", description: "", category: "", subcategory: "", price: "", cost: "" });
  const [expandedPizza, setExpandedPizza] = useState<string | null>(null);

  // Pizza form states
  const [sizePricesForm, setSizePricesForm] = useState<Record<string, { price: string; cost: string }>>({});
  const [crustsForm, setCrustsForm] = useState<Set<string>>(new Set(["tradicional"]));
  const [editSizePricesForm, setEditSizePricesForm] = useState<Record<string, { price: string; cost: string }>>({});
  const [editCrustsForm, setEditCrustsForm] = useState<Set<string>>(new Set());

  // Inline size price editing (without full edit mode)
  const [inlineEditSize, setInlineEditSize] = useState<{ itemId: string; sizeId: string } | null>(null);
  const [inlineSizeForm, setInlineSizeForm] = useState<{ price: string; cost: string }>({ price: "", cost: "" });

  // Image upload states
  const [itemImage, setItemImage] = useState<string>("");
  const [editItemImage, setEditItemImage] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);

  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "parsed" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [parsedItems, setParsedItems] = useState<Array<{ name: string; description: string; category: string; price: number; selected: boolean }>>([]);
  const [rawPreview, setRawPreview] = useState("");
  const [showRawPreview, setShowRawPreview] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [importingCount, setImportingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (file: File, target: "add" | "edit") => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "add") setItemImage(data.url);
        else setEditItemImage(data.url);
      }
    } catch {
      // silently fail
    } finally {
      setImageUploading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadStatus("uploading");
    setUploadError("");
    setUploadFileName(file.name);
    setParsedItems([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/menu/parse", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadStatus("error");
        setUploadError(data.error || "Erro ao processar arquivo");
        return;
      }

      setParsedItems(data.items.map((i: { name: string; description: string; category: string; price: number }) => ({ ...i, selected: true })));
      setRawPreview(data.rawText || "");
      setUploadStatus("parsed");
    } catch {
      setUploadStatus("error");
      setUploadError("Erro de conexão ao processar arquivo");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleImportSelected = async () => {
    const toImport = parsedItems.filter(i => i.selected);
    setImportingCount(toImport.length);

    for (const item of toImport) {
      await addItem.mutateAsync({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        cost: 0,
      });
    }

    setImportingCount(0);
    setParsedItems([]);
    setUploadStatus("idle");
    setUploadFileName("");
  };

  const utils = trpc.useUtils();
  const { data } = trpc.menu.getItems.useQuery(
    filter ? { category: filter } : {},
    { refetchInterval: false }
  );
  const { data: combos } = trpc.menu.getCombos.useQuery(undefined, { refetchInterval: false });
  const { data: suggestions } = trpc.menu.suggestCombos.useQuery(undefined, { refetchInterval: false });
  const { data: pizzaConfig } = trpc.menu.getPizzaConfig.useQuery(undefined, { refetchInterval: false });

  const addItem = trpc.menu.addItem.useMutation({
    onSuccess: () => {
      utils.menu.getItems.invalidate();
      utils.menu.suggestCombos.invalidate();
      setItemForm({ name: "", description: "", category: "pizzas", subcategory: "", price: "", cost: "" });
      setShowAddItem(false);
    },
  });

  const deleteItem = trpc.menu.deleteItem.useMutation({
    onSuccess: () => {
      utils.menu.getItems.invalidate();
      utils.menu.suggestCombos.invalidate();
    },
  });

  const updateItem = trpc.menu.updateItem.useMutation({
    onSuccess: () => {
      utils.menu.getItems.invalidate();
      utils.menu.suggestCombos.invalidate();
      setEditingId(null);
    },
  });

  const createCombo = trpc.menu.createCombo.useMutation({
    onSuccess: () => {
      utils.menu.getCombos.invalidate();
      setSelectedItems(new Set());
      setComboForm({ name: "", description: "", price: "" });
      setShowCreateCombo(false);
    },
  });

  const deleteCombo = trpc.menu.deleteCombo.useMutation({
    onSuccess: () => utils.menu.getCombos.invalidate(),
  });

  const items = data?.items ?? [];
  const stats = data?.stats;

  const handleAddItem = () => {
    if (!itemForm.name || !itemForm.price) return;
    const isPizza = itemForm.category === "pizzas";
    const sizePrices = isPizza
      ? Object.entries(sizePricesForm)
          .filter(([, v]) => v.price && parseFloat(v.price) > 0)
          .map(([sizeId, v]) => ({ sizeId, price: parseFloat(v.price), cost: parseFloat(v.cost) || 0 }))
      : undefined;
    const crusts = isPizza && crustsForm.size > 0 ? Array.from(crustsForm) : undefined;

    addItem.mutate({
      name: itemForm.name,
      description: itemForm.description,
      category: itemForm.category,
      ...(isPizza && itemForm.subcategory ? { subcategory: itemForm.subcategory } : {}),
      price: parseFloat(itemForm.price),
      cost: parseFloat(itemForm.cost) || 0,
      ...(sizePrices && sizePrices.length > 0 ? { sizePrices } : {}),
      ...(crusts ? { crusts } : {}),
      ...(itemImage ? { image: itemImage } : {}),
    });
    setItemImage("");
  };

  const handleCreateCombo = () => {
    if (!comboForm.name || !comboForm.price || selectedItems.size < 2) return;
    createCombo.mutate({
      name: comboForm.name,
      description: comboForm.description,
      items: Array.from(selectedItems),
      comboPrice: parseFloat(comboForm.price),
    });
  };

  const startEditing = (item: { id: string; name: string; description: string; category: string; subcategory?: string; price: number; cost: number; image?: string; sizePrices?: Array<{ sizeId: string; price: number; cost: number }>; crusts?: string[] }) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory ?? "",
      price: item.price.toFixed(2),
      cost: item.cost.toFixed(2),
    });
    setEditItemImage(item.image ?? "");
    // Carregar dados de pizza no form de edição
    if (item.sizePrices) {
      const sp: Record<string, { price: string; cost: string }> = {};
      item.sizePrices.forEach(s => { sp[s.sizeId] = { price: s.price.toFixed(2), cost: s.cost.toFixed(2) }; });
      setEditSizePricesForm(sp);
    } else {
      setEditSizePricesForm({});
    }
    setEditCrustsForm(new Set(item.crusts ?? []));
  };

  const saveEdit = (id: string, currentActive: boolean) => {
    if (!editForm.name || !editForm.price) return;
    const isPizza = editForm.category === "pizzas";
    const sizePrices = isPizza
      ? Object.entries(editSizePricesForm)
          .filter(([, v]) => v.price && parseFloat(v.price) > 0)
          .map(([sizeId, v]) => ({ sizeId, price: parseFloat(v.price), cost: parseFloat(v.cost) || 0 }))
      : undefined;
    const crusts = isPizza && editCrustsForm.size > 0 ? Array.from(editCrustsForm) : undefined;

    updateItem.mutate({
      id,
      name: editForm.name,
      description: editForm.description,
      category: editForm.category,
      ...(editForm.subcategory ? { subcategory: editForm.subcategory } : {}),
      price: parseFloat(editForm.price),
      cost: parseFloat(editForm.cost) || 0,
      active: currentActive,
      ...(sizePrices && sizePrices.length > 0 ? { sizePrices } : {}),
      ...(crusts ? { crusts } : {}),
      ...(editItemImage !== undefined ? { image: editItemImage } : {}),
    });
    setEditItemImage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const startInlineSizeEdit = (itemId: string, sizeId: string, price: number, cost: number) => {
    setInlineEditSize({ itemId, sizeId });
    setInlineSizeForm({ price: price > 0 ? price.toFixed(2) : "", cost: cost > 0 ? cost.toFixed(2) : "" });
  };

  const saveInlineSizeEdit = (item: { id: string; name: string; description: string; category: string; subcategory?: string; price: number; cost: number; active: boolean; sizePrices?: Array<{ sizeId: string; price: number; cost: number }>; crusts?: string[] }) => {
    if (!inlineEditSize) return;
    const newPrice = parseFloat(inlineSizeForm.price) || 0;
    const newCost = parseFloat(inlineSizeForm.cost) || 0;
    const updatedSizePrices = (item.sizePrices ?? []).map(s =>
      s.sizeId === inlineEditSize.sizeId ? { ...s, price: newPrice, cost: newCost } : s
    );
    if (!updatedSizePrices.find(s => s.sizeId === inlineEditSize.sizeId) && newPrice > 0) {
      updatedSizePrices.push({ sizeId: inlineEditSize.sizeId, price: newPrice, cost: newCost });
    }
    updateItem.mutate({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      ...(item.subcategory ? { subcategory: item.subcategory } : {}),
      price: item.price,
      cost: item.cost,
      active: item.active,
      sizePrices: updatedSizePrices.filter(s => s.price > 0),
      ...(item.crusts ? { crusts: item.crusts } : {}),
    });
    setInlineEditSize(null);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTotal = Array.from(selectedItems).reduce((sum, id) => {
    const item = items.find(i => i.id === id);
    return sum + (item?.price ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Cardápio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie seus itens e crie combos e promoções
          </p>
        </div>
        <button
          onClick={() => setShowAddItem(!showAddItem)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
            showAddItem
              ? "bg-secondary text-foreground hover:bg-accent"
              : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          {showAddItem ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Novo Item</>}
        </button>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Itens</span>
                <UtensilsCrossed className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <span className="text-2xl font-bold tabular-nums">{stats.total}</span>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} ativos</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Preço Médio</span>
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <span className="text-2xl font-bold tabular-nums text-emerald-400">R$ {stats.avgPrice.toFixed(2)}</span>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Margem Média</span>
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <span className="text-2xl font-bold tabular-nums">{stats.avgMargin}%</span>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Combos</span>
                <Package className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <span className="text-2xl font-bold tabular-nums">{combos?.length ?? 0}</span>
              <p className="text-xs text-muted-foreground mt-1">ativos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Item Form */}
      {showAddItem && (
        <Card className="border-border/50 border-l-2 border-l-primary animate-fade-up">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Adicionar Item ao Cardápio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Nome do Item</Label>
                  <Input
                    placeholder="Ex: Pizza Pepperoni"
                    value={itemForm.name}
                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    placeholder="Ingredientes ou detalhes"
                    value={itemForm.description}
                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setItemForm({ ...itemForm, category: cat.id })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          itemForm.category === cat.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-border/80 text-muted-foreground"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  {itemForm.category === "pizzas" && pizzaConfig?.subcategories && (
                    <div className="mt-2">
                      <Label className="text-xs">Subcategoria da Pizza</Label>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {pizzaConfig.subcategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setItemForm({ ...itemForm, subcategory: sub.id })}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                              itemForm.subcategory === sub.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-border/80 text-muted-foreground"
                            )}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Preço de Venda (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="39.90"
                    value={itemForm.price}
                    onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs">Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="12.50"
                    value={itemForm.cost}
                    onChange={e => setItemForm({ ...itemForm, cost: e.target.value })}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                {itemForm.price && itemForm.cost && (
                  <div className="p-3 bg-accent/30 rounded-lg border border-border/30">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Margem de lucro</span>
                      <span className="font-semibold text-emerald-400">
                        {Math.round(((parseFloat(itemForm.price) - parseFloat(itemForm.cost)) / parseFloat(itemForm.price)) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Lucro por unidade</span>
                      <span className="font-semibold">
                        R$ {(parseFloat(itemForm.price) - parseFloat(itemForm.cost)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Foto do item */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <Label className="text-xs flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5" /> Foto do Produto
              </Label>
              <div className="flex items-center gap-3">
                {itemImage ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50">
                    <img src={itemImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setItemImage("")}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-colors bg-secondary/30">
                    {imageUploading ? (
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5 text-muted-foreground mb-1" />
                        <span className="text-[9px] text-muted-foreground">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "add");
                      }}
                    />
                  </label>
                )}
                <p className="text-[10px] text-muted-foreground">
                  JPG, PNG ou WebP. Max 5MB.
                </p>
              </div>
            </div>

            {/* Seção de tamanhos e massas (apenas para pizzas) */}
            {itemForm.category === "pizzas" && pizzaConfig && (
              <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5" /> Preços por Tamanho
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pizzaConfig.sizes.map(size => (
                    <div key={size.id} className="p-3 bg-secondary/50 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">{size.label}</span>
                        <span className="text-[10px] text-muted-foreground">{size.cm}cm</span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <label className="text-[10px] text-muted-foreground">Preço</label>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={sizePricesForm[size.id]?.price ?? ""}
                              onChange={e => setSizePricesForm(prev => ({ ...prev, [size.id]: { ...prev[size.id], price: e.target.value, cost: prev[size.id]?.cost ?? "" } }))}
                              className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Custo</label>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={sizePricesForm[size.id]?.cost ?? ""}
                              onChange={e => setSizePricesForm(prev => ({ ...prev, [size.id]: { ...prev[size.id], cost: e.target.value, price: prev[size.id]?.price ?? "" } }))}
                              className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Pizza className="w-3.5 h-3.5" /> Tipos de Massa
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pizzaConfig.crusts.map(crust => (
                    <button
                      key={crust.id}
                      onClick={() => {
                        setCrustsForm(prev => {
                          const next = new Set(prev);
                          if (next.has(crust.id)) next.delete(crust.id);
                          else next.add(crust.id);
                          return next;
                        });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        crustsForm.has(crust.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-border/80 text-muted-foreground"
                      )}
                    >
                      {crust.label}
                      <span className="ml-1.5 text-[10px] text-muted-foreground/70">
                        ({crust.allowedSizes.map(s => pizzaConfig.sizes.find(sz => sz.id === s)?.label).join(", ")})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <p className="text-[11px] text-amber-400 font-medium mb-1">Borda Recheada (adicional)</p>
                  <div className="flex flex-wrap gap-3">
                    {pizzaConfig.stuffedCrust.map(sc => (
                      <span key={sc.id} className="text-[11px] text-muted-foreground">
                        {sc.label}: <span className="font-semibold text-foreground">+R$ {sc.price.toFixed(2)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/30">
              <button
                onClick={() => setShowAddItem(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                disabled={!itemForm.name || !itemForm.price || addItem.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {addItem.isPending ? "Salvando..." : "Adicionar Item"}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="items">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="items">
            <UtensilsCrossed className="w-3 h-3 mr-1.5" />
            Cardápio ({items.length})
          </TabsTrigger>
          <TabsTrigger value="combos">
            <Package className="w-3 h-3 mr-1.5" />
            Combos ({combos?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="w-3 h-3 mr-1.5" />
            Importar Arquivo
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Sugestões IA
          </TabsTrigger>
        </TabsList>

        {/* Items List */}
        <TabsContent value="items" className="mt-4 space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                !filter
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-border/80 text-muted-foreground"
              )}
            >
              Todos
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  filter === cat.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-border/80 text-muted-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Combo builder bar */}
          {selectedItems.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-up">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {selectedItems.size} itens selecionados
                </span>
                <span className="text-xs text-muted-foreground">
                  Total: R$ {selectedTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-accent transition-all"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setShowCreateCombo(true)}
                  disabled={selectedItems.size < 2}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Criar Combo
                </button>
              </div>
            </div>
          )}

          {/* Create combo modal inline */}
          {showCreateCombo && (
            <Card className="border-border/50 border-l-2 border-l-purple-500 animate-fade-up">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  Criar Combo com {selectedItems.size} Itens
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Array.from(selectedItems).map(id => {
                    const item = items.find(i => i.id === id);
                    return item ? (
                      <span key={id} className="px-2 py-1 rounded-md bg-accent/50 text-xs">
                        {item.name} — R$ {item.price.toFixed(2)}
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Nome do Combo</Label>
                    <Input
                      placeholder="Ex: Combo Família"
                      value={comboForm.name}
                      onChange={e => setComboForm({ ...comboForm, name: e.target.value })}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Input
                      placeholder="Descrição curta"
                      value={comboForm.description}
                      onChange={e => setComboForm({ ...comboForm, description: e.target.value })}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Preço do Combo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={`Sugestão: ${(selectedTotal * 0.85).toFixed(2)}`}
                      value={comboForm.price}
                      onChange={e => setComboForm({ ...comboForm, price: e.target.value })}
                      className="mt-1 bg-secondary border-border"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Preço individual: R$ {selectedTotal.toFixed(2)} — Desconto: {comboForm.price ? Math.round((1 - parseFloat(comboForm.price) / selectedTotal) * 100) : 15}%
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-border/30">
                  <button
                    onClick={() => setShowCreateCombo(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-all active:scale-[0.98]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateCombo}
                    disabled={!comboForm.name || !comboForm.price || createCombo.isPending}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {createCombo.isPending ? "Criando..." : "Criar Combo"}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items table */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-8"></th>
                      <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
                      <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Categoria</th>
                      <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preço</th>
                      <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Custo</th>
                      <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Margem</th>
                      <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-right py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Agrupar pizzas por subcategoria
                      const isPizzaView = filter === "pizzas" || (!filter && items.some(i => i.category === "pizzas"));
                      const subcats = pizzaConfig?.subcategories ?? [];

                      const renderItem = (item: typeof items[number]) => {
                      const isEditing = editingId === item.id;
                      const editPrice = isEditing ? parseFloat(editForm.price) || 0 : item.price;
                      const editCost = isEditing ? parseFloat(editForm.cost) || 0 : item.cost;
                      const margin = editPrice > 0 ? Math.round(((editPrice - editCost) / editPrice) * 100) : 0;
                      const isSelected = selectedItems.has(item.id);
                      return (
                        <React.Fragment key={item.id}>
                        <tr
                          onDoubleClick={() => !isEditing && startEditing(item)}
                          className={cn(
                            "border-b border-border/30 last:border-0 transition-colors group/row",
                            isEditing ? "bg-primary/5" : isSelected ? "bg-primary/5" : "hover:bg-accent/30"
                          )}
                        >
                          <td className="py-2.5">
                            <button
                              onClick={() => toggleSelectItem(item.id)}
                              className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-border hover:border-muted-foreground"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </button>
                          </td>
                          <td className="py-2.5">
                            {isEditing ? (
                              <div className="flex items-start gap-2.5">
                                {/* Thumbnail upload no edit */}
                                <label className="shrink-0 cursor-pointer">
                                  {editItemImage ? (
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border/50">
                                      <img src={editItemImage} alt="Foto" className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setEditItemImage(""); }}
                                        className="absolute top-0 right-0 p-0.5 rounded-full bg-black/60 text-white"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg border border-dashed border-border/50 hover:border-primary/50 flex items-center justify-center bg-secondary/30 transition-colors">
                                      {imageUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> : <Camera className="w-3.5 h-3.5 text-muted-foreground" />}
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    className="hidden"
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageUpload(file, "edit");
                                    }}
                                  />
                                </label>
                                <div className="flex-1 space-y-1">
                                  <input
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                  />
                                  <input
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Descrição"
                                    className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-[11px] text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => startEditing(item)}>
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-border/30 shrink-0" />
                                )}
                                <div>
                                  <p className="font-medium flex items-center gap-1.5">
                                    {item.name}
                                    {item.popular && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5">
                            {isEditing ? (
                              <div>
                                <select
                                  value={editForm.category}
                                  onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                  className="bg-secondary border border-border rounded-md text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                  {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                  ))}
                                </select>
                                {editForm.category === "pizzas" && pizzaConfig?.subcategories && (
                                  <select
                                    value={editForm.subcategory}
                                    onChange={e => setEditForm({ ...editForm, subcategory: e.target.value })}
                                    className="bg-secondary border border-border rounded-md text-[10px] px-1.5 py-1 mt-1 block focus:outline-none focus:ring-1 focus:ring-primary"
                                  >
                                    <option value="">Subcategoria...</option>
                                    {pizzaConfig.subcategories.map(sub => (
                                      <option key={sub.id} value={sub.id}>{sub.label}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            ) : (
                              <div className="cursor-pointer" onClick={() => startEditing(item)}>
                                <span className="px-2 py-0.5 rounded-md bg-accent/50 text-xs capitalize">{item.category}</span>
                                {item.subcategory && pizzaConfig?.subcategories && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5 px-1">
                                    {pizzaConfig.subcategories.find(s => s.id === item.subcategory)?.label ?? item.subcategory}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.price}
                                  onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                  className="w-20 bg-secondary border border-border rounded-md px-2 py-1 text-sm font-semibold tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            ) : (
                              <div className="cursor-pointer" onClick={() => startEditing(item)}>
                                <span className="font-semibold tabular-nums">R$ {item.price.toFixed(2)}</span>
                                {item.sizePrices && item.sizePrices.length > 0 && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {item.sizePrices.length} {item.sizePrices.length === 1 ? "tamanho" : "tamanhos"}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.cost}
                                  onChange={e => setEditForm({ ...editForm, cost: e.target.value })}
                                  className="w-20 bg-secondary border border-border rounded-md px-2 py-1 text-sm text-muted-foreground tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            ) : (
                              <span className="text-muted-foreground tabular-nums cursor-pointer" onClick={() => startEditing(item)}>R$ {item.cost.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-2.5">
                            <span className={cn(
                              "font-medium tabular-nums",
                              margin >= 60 ? "text-emerald-400" : margin >= 40 ? "text-amber-400" : "text-red-400"
                            )}>
                              {margin}%
                            </span>
                          </td>
                          <td className="py-2.5">
                            {isEditing ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    updateItem.mutate({ id: item.id, active: true, name: editForm.name, description: editForm.description, category: editForm.category, price: parseFloat(editForm.price), cost: parseFloat(editForm.cost) || 0 });
                                  }}
                                  className={cn(
                                    "text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                                    item.active ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"
                                  )}
                                >
                                  ativo
                                </button>
                                <button
                                  onClick={() => {
                                    updateItem.mutate({ id: item.id, active: false, name: editForm.name, description: editForm.description, category: editForm.category, price: parseFloat(editForm.price), cost: parseFloat(editForm.cost) || 0 });
                                  }}
                                  className={cn(
                                    "text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                                    !item.active ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/30" : "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                                  )}
                                >
                                  inativo
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => updateItem.mutate({ id: item.id, active: !item.active })}
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                                  item.active
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {item.active ? "ativo" : "inativo"}
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => saveEdit(item.id, item.active)}
                                  disabled={updateItem.isPending}
                                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                  title="Salvar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent/50 transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {item.sizePrices && item.sizePrices.length > 0 && (
                                  <button
                                    onClick={() => setExpandedPizza(expandedPizza === item.id ? null : item.id)}
                                    className={cn(
                                      "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all",
                                      expandedPizza === item.id ? "text-primary bg-primary/10" : "opacity-0 group-hover/row:opacity-100"
                                    )}
                                    title="Ver tamanhos"
                                  >
                                    <Ruler className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => startEditing(item)}
                                  className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover/row:opacity-100 hover:text-foreground hover:bg-accent/50 transition-all"
                                  title="Editar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </button>
                                <button
                                  onClick={() => deleteItem.mutate({ id: item.id })}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {/* Linha expandida com tamanhos da pizza */}
                        {(item.sizePrices || item.category === "pizzas") && (expandedPizza === item.id || isEditing) && pizzaConfig && (
                          <tr className="bg-accent/10">
                            <td colSpan={8} className="py-3 px-4">
                              <div className="space-y-3">
                                {/* Grid de tamanhos */}
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Ruler className="w-3 h-3" /> Preços por Tamanho
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {(item.category === "pizzas" || isEditing
                                      ? pizzaConfig.sizes
                                      : pizzaConfig.sizes.filter(s => item.sizePrices?.some(sp => sp.sizeId === s.id))
                                    ).map(size => {
                                      const sp = isEditing
                                        ? editSizePricesForm[size.id]
                                        : item.sizePrices?.find(s => s.sizeId === size.id);
                                      const sPrice = isEditing ? parseFloat((sp as { price: string; cost: string } | undefined)?.price ?? "0") : (sp as { price: number; cost: number } | undefined)?.price ?? 0;
                                      const sCost = isEditing ? parseFloat((sp as { price: string; cost: string } | undefined)?.cost ?? "0") : (sp as { price: number; cost: number } | undefined)?.cost ?? 0;
                                      const sMargin = sPrice > 0 ? Math.round(((sPrice - sCost) / sPrice) * 100) : 0;

                                      return (
                                        <div key={size.id} className="p-2.5 bg-secondary/50 rounded-lg border border-border/30">
                                          <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-semibold">{size.label}</span>
                                            <span className="text-[10px] text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded">{size.cm}cm</span>
                                          </div>
                                          {isEditing ? (
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground w-7">R$</span>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  value={(editSizePricesForm[size.id]?.price) ?? ""}
                                                  onChange={e => setEditSizePricesForm(prev => ({ ...prev, [size.id]: { ...prev[size.id], price: e.target.value, cost: prev[size.id]?.cost ?? "" } }))}
                                                  className="w-full bg-secondary border border-border rounded px-1.5 py-0.5 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                                  placeholder="Preço"
                                                />
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground w-7">C$</span>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  value={(editSizePricesForm[size.id]?.cost) ?? ""}
                                                  onChange={e => setEditSizePricesForm(prev => ({ ...prev, [size.id]: { ...prev[size.id], cost: e.target.value, price: prev[size.id]?.price ?? "" } }))}
                                                  className="w-full bg-secondary border border-border rounded px-1.5 py-0.5 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                                  placeholder="Custo"
                                                />
                                              </div>
                                            </div>
                                          ) : inlineEditSize?.itemId === item.id && inlineEditSize?.sizeId === size.id ? (
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground w-7">R$</span>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  autoFocus
                                                  value={inlineSizeForm.price}
                                                  onChange={e => setInlineSizeForm(prev => ({ ...prev, price: e.target.value }))}
                                                  onKeyDown={e => { if (e.key === "Enter") saveInlineSizeEdit(item); if (e.key === "Escape") setInlineEditSize(null); }}
                                                  className="w-full bg-secondary border border-primary/50 rounded px-1.5 py-0.5 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                                  placeholder="Preço"
                                                />
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground w-7">C$</span>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  value={inlineSizeForm.cost}
                                                  onChange={e => setInlineSizeForm(prev => ({ ...prev, cost: e.target.value }))}
                                                  onKeyDown={e => { if (e.key === "Enter") saveInlineSizeEdit(item); if (e.key === "Escape") setInlineEditSize(null); }}
                                                  className="w-full bg-secondary border border-border rounded px-1.5 py-0.5 text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                                                  placeholder="Custo"
                                                />
                                              </div>
                                              <div className="flex items-center gap-1 pt-0.5">
                                                <button
                                                  onClick={() => saveInlineSizeEdit(item)}
                                                  className="text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                                >
                                                  Salvar
                                                </button>
                                                <button
                                                  onClick={() => setInlineEditSize(null)}
                                                  className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:bg-accent transition-colors"
                                                >
                                                  Cancelar
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div
                                              className="space-y-0.5 cursor-pointer group/size hover:bg-accent/30 rounded -m-1 p-1 transition-colors"
                                              onClick={() => startInlineSizeEdit(item.id, size.id, sPrice, sCost)}
                                              title="Clique para editar preço"
                                            >
                                              <p className="text-sm font-bold tabular-nums text-emerald-400">
                                                {sPrice > 0 ? `R$ ${sPrice.toFixed(2)}` : "—"}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1 opacity-0 group-hover/size:opacity-60 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                              </p>
                                              {sPrice > 0 && (
                                                <p className="text-[10px] text-muted-foreground">
                                                  Custo: R$ {sCost.toFixed(2)} · Margem: <span className={sMargin >= 50 ? "text-emerald-400" : "text-amber-400"}>{sMargin}%</span>
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Tipos de massa */}
                                <div className="flex flex-wrap items-center gap-3">
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Pizza className="w-3 h-3" /> Massas:
                                  </p>
                                  {isEditing ? (
                                    pizzaConfig.crusts.map(crust => (
                                      <button
                                        key={crust.id}
                                        onClick={() => {
                                          setEditCrustsForm(prev => {
                                            const next = new Set(prev);
                                            if (next.has(crust.id)) next.delete(crust.id);
                                            else next.add(crust.id);
                                            return next;
                                          });
                                        }}
                                        className={cn(
                                          "px-2 py-1 rounded text-[11px] font-medium border transition-all",
                                          editCrustsForm.has(crust.id)
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border text-muted-foreground hover:border-border/80"
                                        )}
                                      >
                                        {crust.label}
                                        <span className="ml-1 text-[9px] text-muted-foreground/60">
                                          ({crust.allowedSizes.map(s => pizzaConfig.sizes.find(sz => sz.id === s)?.label?.[0]).join("/")})
                                        </span>
                                      </button>
                                    ))
                                  ) : (
                                    (item.crusts ?? []).map(crustId => {
                                      const crust = pizzaConfig.crusts.find(c => c.id === crustId);
                                      return crust ? (
                                        <span key={crustId} className="px-2 py-1 rounded bg-accent/50 text-[11px] font-medium">
                                          {crust.label}
                                          <span className="ml-1 text-[9px] text-muted-foreground">
                                            ({crust.allowedSizes.map(s => pizzaConfig.sizes.find(sz => sz.id === s)?.label).join(", ")})
                                          </span>
                                        </span>
                                      ) : null;
                                    })
                                  )}
                                </div>

                                {/* Borda recheada info */}
                                <div className="flex flex-wrap items-center gap-3">
                                  <p className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">Borda Recheada:</p>
                                  {pizzaConfig.stuffedCrust.map(sc => (
                                    <span key={sc.id} className="text-[11px] text-muted-foreground">
                                      {sc.label} <span className="font-semibold text-amber-400">+R$ {sc.price.toFixed(2)}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                      };

                      // Se está em view de pizzas, agrupar por subcategoria
                      if (isPizzaView && subcats.length > 0) {
                        const pizzas = items.filter(i => i.category === "pizzas");
                        const nonPizzas = items.filter(i => i.category !== "pizzas");

                        return (
                          <>
                            {subcats.map(sub => {
                              const subItems = pizzas.filter(i => i.subcategory === sub.id);
                              if (subItems.length === 0) return null;
                              return (
                                <React.Fragment key={sub.id}>
                                  <tr>
                                    <td colSpan={8} className="pt-4 pb-2 px-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                          {sub.label}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded">
                                          {subItems.length} {subItems.length === 1 ? "pizza" : "pizzas"}
                                        </span>
                                        <div className="flex-1 h-px bg-border/30" />
                                      </div>
                                    </td>
                                  </tr>
                                  {subItems.map(renderItem)}
                                </React.Fragment>
                              );
                            })}
                            {/* Pizzas sem subcategoria */}
                            {pizzas.filter(i => !i.subcategory).length > 0 && (
                              <>
                                <tr>
                                  <td colSpan={8} className="pt-4 pb-2 px-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Outras
                                      </span>
                                      <div className="flex-1 h-px bg-border/30" />
                                    </div>
                                  </td>
                                </tr>
                                {pizzas.filter(i => !i.subcategory).map(renderItem)}
                              </>
                            )}
                            {/* Itens não-pizza (quando filter é null) */}
                            {nonPizzas.map(renderItem)}
                          </>
                        );
                      }

                      return items.map(renderItem);
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import */}
        <TabsContent value="import" className="mt-4 space-y-4">
          {/* Drop zone */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.csv,.tsv,.jpg,.jpeg,.png,.webp,image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = "";
                }}
              />

              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border/50 hover:border-border hover:bg-accent/20"
                )}
              >
                {uploadStatus === "uploading" ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-sm font-medium">Analisando cardápio...</p>
                    <p className="text-xs text-muted-foreground mt-1">Extraindo itens e preços de {uploadFileName}</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1">Arraste seu arquivo de cardápio aqui</p>
                    <p className="text-xs text-muted-foreground mb-4">ou clique para selecionar</p>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/50 text-[11px] text-muted-foreground">
                        <FileText className="w-3 h-3" /> PDF
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/50 text-[11px] text-muted-foreground">
                        <ImagePlus className="w-3 h-3" /> Foto
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/50 text-[11px] text-muted-foreground">
                        <FileText className="w-3 h-3" /> TXT
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/50 text-[11px] text-muted-foreground">
                        <FileText className="w-3 h-3" /> CSV
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-3">
                      IA analisa PDFs, fotos e scans automaticamente
                    </p>
                  </>
                )}
              </div>

              {/* Error */}
              {uploadStatus === "error" && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{uploadError}</p>
                </div>
              )}

              {/* Tips */}
              <div className="mt-4 p-3 bg-accent/20 rounded-lg border border-border/30">
                <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">DICAS PARA MELHOR LEITURA</p>
                <ul className="text-[11px] text-muted-foreground space-y-0.5">
                  <li>Cada item em uma linha com o nome e preço (ex: Pizza Margherita R$39,90)</li>
                  <li>Use títulos de seção como &ldquo;PIZZAS&rdquo;, &ldquo;BEBIDAS&rdquo;, &ldquo;SOBREMESAS&rdquo;</li>
                  <li>CSV: colunas nome, descrição, categoria, preço (separados por ; ou ,)</li>
                  <li>PDF: funciona melhor com texto selecionável (não imagem escaneada)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Parsed results */}
          {uploadStatus === "parsed" && parsedItems.length > 0 && (
            <Card className="border-border/50 border-l-2 border-l-emerald-500 animate-fade-up">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      {parsedItems.length} itens encontrados em {uploadFileName}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Revise e desmarque o que não quiser importar. Categorias detectadas automaticamente.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRawPreview(!showRawPreview)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {showRawPreview ? "Ocultar" : "Ver"} texto bruto
                    {showRawPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Raw text preview */}
                {showRawPreview && rawPreview && (
                  <div className="mb-4 p-3 bg-secondary/50 rounded-lg border border-border/30 max-h-40 overflow-y-auto">
                    <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono">{rawPreview}</pre>
                  </div>
                )}

                {/* Items table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 w-8">
                          <button
                            onClick={() => {
                              const allSelected = parsedItems.every(i => i.selected);
                              setParsedItems(parsedItems.map(i => ({ ...i, selected: !allSelected })));
                            }}
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all",
                              parsedItems.every(i => i.selected)
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border"
                            )}
                          >
                            {parsedItems.every(i => i.selected) && <Check className="w-3 h-3" />}
                          </button>
                        </th>
                        <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Item</th>
                        <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Descrição</th>
                        <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Categoria</th>
                        <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedItems.map((item, idx) => (
                        <tr key={idx} className={cn(
                          "border-b border-border/30 last:border-0 transition-colors",
                          item.selected ? "hover:bg-accent/30" : "opacity-40"
                        )}>
                          <td className="py-2">
                            <button
                              onClick={() => {
                                const updated = [...parsedItems];
                                updated[idx] = { ...updated[idx], selected: !updated[idx].selected };
                                setParsedItems(updated);
                              }}
                              className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                item.selected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-border hover:border-muted-foreground"
                              )}
                            >
                              {item.selected && <Check className="w-3 h-3" />}
                            </button>
                          </td>
                          <td className="py-2 font-medium">{item.name}</td>
                          <td className="py-2 text-muted-foreground text-xs">{item.description || "—"}</td>
                          <td className="py-2">
                            <select
                              value={item.category}
                              onChange={e => {
                                const updated = [...parsedItems];
                                updated[idx] = { ...updated[idx], category: e.target.value };
                                setParsedItems(updated);
                              }}
                              className="bg-accent/50 border-none rounded-md text-xs px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 font-semibold tabular-nums text-emerald-400">R$ {item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                  <div className="text-xs text-muted-foreground">
                    {parsedItems.filter(i => i.selected).length} de {parsedItems.length} selecionados
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setParsedItems([]); setUploadStatus("idle"); setUploadFileName(""); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-all active:scale-[0.98]"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={handleImportSelected}
                      disabled={!parsedItems.some(i => i.selected) || importingCount > 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {importingCount > 0 ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importando...</>
                      ) : (
                        <><Check className="w-3.5 h-3.5" /> Importar {parsedItems.filter(i => i.selected).length} Itens</>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parsed but empty */}
          {uploadStatus === "parsed" && parsedItems.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Nenhum item detectado</p>
                <p className="text-xs text-muted-foreground mb-3">
                  O arquivo foi lido, mas não conseguimos identificar itens com preço.
                </p>
                {rawPreview && (
                  <div className="text-left p-3 bg-secondary/50 rounded-lg border border-border/30 max-h-32 overflow-y-auto mb-3">
                    <p className="text-[10px] text-muted-foreground mb-1 font-semibold">CONTEÚDO EXTRAÍDO:</p>
                    <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono">{rawPreview.slice(0, 500)}</pre>
                  </div>
                )}
                <button
                  onClick={() => { setUploadStatus("idle"); setUploadFileName(""); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-accent transition-all"
                >
                  Tentar outro arquivo
                </button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Combos */}
        <TabsContent value="combos" className="mt-4">
          {!combos?.length ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Nenhum combo criado</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Selecione itens no cardápio e clique em &ldquo;Criar Combo&rdquo;, ou use as sugestões da IA.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combos.map(combo => (
                <Card key={combo.id} className="border-border/50 border-l-2 border-l-purple-500">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{combo.name}</h3>
                          {combo.description && (
                            <p className="text-[11px] text-muted-foreground">{combo.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCombo.mutate({ id: combo.id })}
                        className="p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 mb-3">
                      {combo.itemDetails?.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="tabular-nums">R$ {item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border/30">
                      <div>
                        <p className="text-xs text-muted-foreground line-through">R$ {combo.originalPrice.toFixed(2)}</p>
                        <p className="text-lg font-bold text-emerald-400 tabular-nums">R$ {combo.comboPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10">
                        <Percent className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">{combo.discount}% off</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Suggestions */}
        <TabsContent value="suggestions" className="mt-4">
          {!suggestions?.length ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center text-muted-foreground">
                Adicione mais itens ao cardápio para receber sugestões de combos.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Sugestões baseadas nos seus itens, preços e margens de lucro.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((sug, idx) => (
                  <Card key={idx} className="border-border/50 border-l-2 border-l-amber-500 group hover:border-border transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{sug.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{sug.description}</p>
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        {sug.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="tabular-nums">R$ {item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border/30 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground line-through">R$ {sug.originalPrice.toFixed(2)}</p>
                          <p className="text-lg font-bold text-emerald-400 tabular-nums">R$ {sug.suggestedPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Margem</p>
                          <p className={cn(
                            "text-sm font-semibold",
                            sug.margin >= 50 ? "text-emerald-400" : sug.margin >= 30 ? "text-amber-400" : "text-red-400"
                          )}>
                            {sug.margin}%
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          createCombo.mutate({
                            name: sug.name,
                            description: sug.description,
                            items: sug.items.map((i) => i.id),
                            comboPrice: sug.suggestedPrice,
                          });
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98]"
                      >
                        <Check className="w-3.5 h-3.5" /> Usar esta Sugestão
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
