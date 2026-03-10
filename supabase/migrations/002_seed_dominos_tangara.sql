-- =============================================
-- SEED: Domino's Tangará da Serra
-- Executar APÓS criar o primeiro usuário via register
-- =============================================

-- 1. Criar tenant Domino's Tangará
INSERT INTO tenants (id, name, slug, food_category, city, state, lat, lng, address, phone, delivery_fee, plan, onboarding_completed)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Domino''s Pizza Tangará',
  'dominos-tangara',
  'pizza',
  'Tangará da Serra',
  'MT',
  -14.6197,
  -57.4875,
  'Tangará da Serra, MT',
  NULL,
  12.90,
  'pro',
  TRUE
);

-- 2. Pizzas — Mais Pedidas
INSERT INTO menu_items (tenant_id, name, description, category, subcategory, price, available, allow_half, size_prices) VALUES
('a0000000-0000-0000-0000-000000000001', 'Margherita', 'Queijo, tomate e manjericão', 'pizzas', 'mais_pedidas', 76.90, true, true, '[{"sizeId":"brotinho","price":36.90},{"sizeId":"media","price":76.90},{"sizeId":"grande","price":87.90},{"sizeId":"gigante","price":98.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Calabresa', 'Queijo, calabresa e cebola', 'pizzas', 'mais_pedidas', 76.90, true, true, '[{"sizeId":"brotinho","price":36.90},{"sizeId":"media","price":76.90},{"sizeId":"grande","price":87.90},{"sizeId":"gigante","price":98.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Pepperoni', 'Queijo e pepperoni', 'pizzas', 'mais_pedidas', 76.90, true, true, '[{"sizeId":"brotinho","price":36.90},{"sizeId":"media","price":76.90},{"sizeId":"grande","price":87.90},{"sizeId":"gigante","price":98.90}]'),
('a0000000-0000-0000-0000-000000000001', '3 Queijos', 'Queijo, requeijão e parmesão ralado', 'pizzas', 'mais_pedidas', 76.90, true, true, '[{"sizeId":"brotinho","price":36.90},{"sizeId":"media","price":76.90},{"sizeId":"grande","price":87.90},{"sizeId":"gigante","price":98.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Frango c/ Requeijão Especial', 'Frango desfiado, cebola e requeijão', 'pizzas', 'mais_pedidas', 76.90, true, true, '[{"sizeId":"brotinho","price":36.90},{"sizeId":"media","price":76.90},{"sizeId":"grande","price":87.90},{"sizeId":"gigante","price":98.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Queijo', 'Queijo e molho', 'pizzas', 'mais_pedidas', 76.90, true, true, '[{"sizeId":"brotinho","price":36.90},{"sizeId":"media","price":76.90},{"sizeId":"grande","price":87.90},{"sizeId":"gigante","price":98.90}]');

-- Pizzas — Clássicas
INSERT INTO menu_items (tenant_id, name, description, category, subcategory, price, available, allow_half, size_prices) VALUES
('a0000000-0000-0000-0000-000000000001', 'Cheddar e Bacon', 'Queijo, molho sabor queijo cheddar, bacon e orégano', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', '4 Queijos', 'Parmesão, molho sabor queijo cheddar, frango grelhado, bacon', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Cheddar e Pepperoni', 'Queijo, molho sabor queijo cheddar, pepperoni, azeite e orégano', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Napolitana', 'Queijo, tomate e parmesão ralado', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Corn & Bacon', 'Queijo, bacon e milho', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Catuperoni', 'Queijo, pepperoni, requeijão e parmesão ralado', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Frango Caipira', 'Queijo, frango desfiado, milho e Catupiry', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Veggie', 'Queijo, azeitona preta, champignon, cebola e pimentão verde', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Portuguesa', 'Queijo, cebola, azeitona preta, pimentão verde, ovo de codorna e presunto', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Pão de Alho', 'Queijo, pão ciabatta, pasta de alho e parmesão ralado', 'pizzas', 'classicas', 81.90, true, true, '[{"sizeId":"brotinho","price":39.90},{"sizeId":"media","price":81.90},{"sizeId":"grande","price":93.90},{"sizeId":"gigante","price":105.90}]');

-- Pizzas — Especiais
INSERT INTO menu_items (tenant_id, name, description, category, subcategory, price, available, allow_half, size_prices) VALUES
('a0000000-0000-0000-0000-000000000001', 'Carne Seca', 'Queijo, carne seca, cream cheese e cebola', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Frango Grelhado', 'Queijo, frango, requeijão, tomate, azeitona preta e manjericão', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Pepperrock', 'Queijo, pepperoni, azeitona preta, parmesão ralado, alho granulado e cream cheese', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Extravaganzza', 'Queijo, azeitona preta, champignon, pepperoni, pimentão verde, cebola e presunto', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Meat & Bacon', 'Cream cheese, pepperoni, presunto, calabresa, bacon e azeite', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'La Bianca', 'Queijo de vaca e búfala, requeijão, parmesão ralado e manjericão', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Carne Seca c/ Cream Cheese', 'Cream cheese, carne seca, cebola, queijo e azeite', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Egg & Bacon', 'Queijo, bacon, cebola, cream cheese e ovo de codorna', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Calabresa Especial', 'Queijo, calabresa, cebola, azeitona preta e cream cheese', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Frango c/ Cream Cheese', 'Queijo, frango, cream cheese e parmesão ralado', 'pizzas', 'especiais', 93.90, true, true, '[{"sizeId":"brotinho","price":42.90},{"sizeId":"media","price":93.90},{"sizeId":"grande","price":105.90},{"sizeId":"gigante","price":118.90}]');

-- Sanduíches
INSERT INTO menu_items (tenant_id, name, description, category, price, available) VALUES
('a0000000-0000-0000-0000-000000000001', 'Sanduíche Frango, Cheddar & Bacon', 'Parmesão, molho sabor queijo cheddar, frango grelhado, bacon e azeite', 'sanduiches', 31.90, true),
('a0000000-0000-0000-0000-000000000001', 'Caprese', 'Queijo de vaca e búfala, cebola, tomate, azeitona preta, manjericão e azeite', 'sanduiches', 27.90, true),
('a0000000-0000-0000-0000-000000000001', 'Carne Seca c/ Cream Cheese', 'Cream cheese, carne seca, cebola, queijo e azeite', 'sanduiches', 31.90, true),
('a0000000-0000-0000-0000-000000000001', 'Frango 4 Queijos', 'Queijo, cream cheese, frango grelhado, gorgonzola, parmesão e azeite', 'sanduiches', 29.90, true),
('a0000000-0000-0000-0000-000000000001', 'Meat & Bacon', 'Cream cheese, pepperoni, presunto, calabresa, bacon e azeite', 'sanduiches', 27.90, true),
('a0000000-0000-0000-0000-000000000001', 'Chicken & Bacon', 'Cream cheese, bacon, frango grelhado, tomate, cebola, parmesão ralado e azeite', 'sanduiches', 28.90, true);

-- Bebidas
INSERT INTO menu_items (tenant_id, name, description, category, price, available) VALUES
('a0000000-0000-0000-0000-000000000001', 'Refrigerante 2L', 'Coca-Cola, Coca Zero, Fanta Uva, Fanta Laranja, Kuat, Sprite Zero, Sprite', 'bebidas', 15.90, true),
('a0000000-0000-0000-0000-000000000001', 'Refrigerante 500ml', 'Coca-Cola, Coca Zero ou Fanta Laranja', 'bebidas', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Refrigerante Lata', 'Coca-Cola, Coca Zero, Fanta Laranja, Sprite, Kuat', 'bebidas', 10.90, true),
('a0000000-0000-0000-0000-000000000001', 'Suco Dell Valle', 'Pêssego, Uva ou Maracujá', 'bebidas', 10.90, true),
('a0000000-0000-0000-0000-000000000001', 'Heineken 330ml', 'Cerveja Heineken long neck', 'bebidas', 9.90, true),
('a0000000-0000-0000-0000-000000000001', 'Amstel', 'Cerveja Amstel', 'bebidas', 9.90, true),
('a0000000-0000-0000-0000-000000000001', 'Água com Gás', 'Água mineral com gás', 'bebidas', 6.90, true),
('a0000000-0000-0000-0000-000000000001', 'Água sem Gás', 'Água mineral sem gás', 'bebidas', 6.90, true);

-- Sobremesas
INSERT INTO menu_items (tenant_id, name, description, category, price, available, size_prices) VALUES
('a0000000-0000-0000-0000-000000000001', 'Canela Bites', 'Pedaços crocantes de massa pan, envoltos em açúcar e canela', 'sobremesas', 27.90, true, '{}'),
('a0000000-0000-0000-0000-000000000001', 'Pizza de Churros', 'Coberta com doce de leite, açúcar e canela', 'sobremesas', 57.90, true, '[{"sizeId":"brotinho","price":27.90},{"sizeId":"media","price":57.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Pizza de M&M''s', 'Coberta com creme de baunilha, brigadeiro de chocolate e M&M''s', 'sobremesas', 57.90, true, '[{"sizeId":"brotinho","price":27.90},{"sizeId":"media","price":57.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Pizza de Brigadeiro', 'Coberta com creme de baunilha, brigadeiro de chocolate e granulado', 'sobremesas', 57.90, true, '[{"sizeId":"brotinho","price":27.90},{"sizeId":"media","price":57.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Pizza de Ovomaltine', 'Coberta com creme de baunilha e creme de Ovomaltine', 'sobremesas', 57.90, true, '[{"sizeId":"brotinho","price":27.90},{"sizeId":"media","price":57.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Pizza de Doce de Leite', 'Coberta com doce de leite', 'sobremesas', 57.90, true, '[{"sizeId":"brotinho","price":27.90},{"sizeId":"media","price":57.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Chocobread', 'Massa recheada de brigadeiro de chocolate e cobertura de creme de baunilha com granulado', 'sobremesas', 27.90, true, '{}'),
('a0000000-0000-0000-0000-000000000001', 'Churrosbread', 'Massa recheada de doce de leite, coberta de açúcar e canela', 'sobremesas', 27.90, true, '{}');

-- Molhos Salgados
INSERT INTO menu_items (tenant_id, name, description, category, price, available) VALUES
('a0000000-0000-0000-0000-000000000001', 'Catupiry', 'Molho cremoso de Catupiry', 'molhos', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Cheddar', 'Molho sabor queijo cheddar', 'molhos', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Molho de Pizza', 'Molho de tomate especial para pizza', 'molhos', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Sweet Chilli', 'Molho agridoce de pimenta', 'molhos', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Maionese Grill', 'Maionese temperada para grill', 'molhos', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Chipotle', 'Molho defumado de chipotle', 'molhos', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Pasta de Alho', 'Pasta cremosa de alho', 'molhos', 12.90, true),
('a0000000-0000-0000-0000-000000000001', 'Cream Cheese', 'Molho cremoso de cream cheese', 'molhos', 12.90, true);

-- Molhos Doces
INSERT INTO menu_items (tenant_id, name, description, category, price, available) VALUES
('a0000000-0000-0000-0000-000000000001', 'Doce de Leite', 'Molho de doce de leite', 'molhos', 9.90, true),
('a0000000-0000-0000-0000-000000000001', 'Pistache', 'Creme de pistache', 'molhos', 9.90, true),
('a0000000-0000-0000-0000-000000000001', 'Brigadeiro', 'Molho de brigadeiro de chocolate', 'molhos', 9.90, true),
('a0000000-0000-0000-0000-000000000001', 'Ovomaltine', 'Creme de Ovomaltine', 'molhos', 9.90, true),
('a0000000-0000-0000-0000-000000000001', 'Nutella', 'Creme de avelã Nutella', 'molhos', 9.90, true),
('a0000000-0000-0000-0000-000000000001', 'Baunilha', 'Creme de baunilha', 'molhos', 9.90, true);

-- Acompanhamentos
INSERT INTO menu_items (tenant_id, name, description, category, price, available, size_prices) VALUES
('a0000000-0000-0000-0000-000000000001', 'Cheddar Volcano', 'Queijo e molho sabor queijo cheddar', 'acompanhamentos', 37.90, true, '{}'),
('a0000000-0000-0000-0000-000000000001', 'Alho Roll', 'Entrada crocante feita de massa pan, recheada com pasta de alho e parmesão ralado', 'acompanhamentos', 27.90, true, '[{"sizeId":"brotinho","price":17.90},{"sizeId":"media","price":27.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Chicken Roll', 'Massa crocante de massa pan, recheada de frango desfiado, queijo e molho de tomate', 'acompanhamentos', 27.90, true, '[{"sizeId":"brotinho","price":17.90},{"sizeId":"media","price":27.90}]'),
('a0000000-0000-0000-0000-000000000001', 'Cheesebread Margherita', 'Pão de queijo recheado sabor margherita', 'acompanhamentos', 27.90, true, '{}'),
('a0000000-0000-0000-0000-000000000001', 'Cheesebread 4 Queijos', 'Pão de queijo recheado sabor 4 queijos', 'acompanhamentos', 27.90, true, '{}'),
('a0000000-0000-0000-0000-000000000001', 'Cheesebread Calabresa', 'Pão de queijo recheado sabor calabresa', 'acompanhamentos', 27.90, true, '{}');

-- Borda Recheada
INSERT INTO menu_items (tenant_id, name, description, category, price, available) VALUES
('a0000000-0000-0000-0000-000000000001', 'Borda de Catupiry', 'Borda recheada com Catupiry', 'borda_recheada', 12.00, true),
('a0000000-0000-0000-0000-000000000001', 'Borda de Requeijão', 'Borda recheada com requeijão', 'borda_recheada', 12.00, true),
('a0000000-0000-0000-0000-000000000001', 'Borda de Cream Cheese', 'Borda recheada com cream cheese', 'borda_recheada', 12.00, true),
('a0000000-0000-0000-0000-000000000001', 'Borda de Pasta de Alho', 'Borda recheada com pasta de alho', 'borda_recheada', 12.00, true);

-- 3. Bairros de Tangará da Serra
INSERT INTO neighborhoods (tenant_id, name, lat, lng, population, avg_income) VALUES
('a0000000-0000-0000-0000-000000000001', 'Centro', -14.6197, -57.4875, 8500, 3200),
('a0000000-0000-0000-0000-000000000001', 'Jardim Europa', -14.6250, -57.4950, 6200, 4500),
('a0000000-0000-0000-0000-000000000001', 'Vila Alta', -14.6150, -57.4800, 5800, 2800),
('a0000000-0000-0000-0000-000000000001', 'Jardim Paraíso', -14.6300, -57.4820, 4500, 3000),
('a0000000-0000-0000-0000-000000000001', 'Cohab', -14.6100, -57.4750, 7200, 2200),
('a0000000-0000-0000-0000-000000000001', 'Jardim Tarumã', -14.6350, -57.4900, 3800, 3500),
('a0000000-0000-0000-0000-000000000001', 'Vila Nova', -14.6180, -57.4920, 4200, 2600),
('a0000000-0000-0000-0000-000000000001', 'Jardim Shangri-lá', -14.6280, -57.4780, 3200, 4000),
('a0000000-0000-0000-0000-000000000001', 'Residencial Bertolli', -14.6220, -57.5000, 2800, 5200),
('a0000000-0000-0000-0000-000000000001', 'Jardim das Palmeiras', -14.6320, -57.4850, 3500, 3800);
