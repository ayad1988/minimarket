CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO product (id, sku, name, description, brand, model, category, price, currency, main_image_url, active)
VALUES
-- Audio
('10000000-0000-0000-0000-000000000001','SKU-AUD-001','Casque Bluetooth ANC','Casque sans fil avec réduction de bruit active','SoundMax','S900','ELECTRONICS',129.90,'EUR','https://img.example.com/p1.jpg',true),
('10000000-0000-0000-0000-000000000002','SKU-AUD-002','Écouteurs True Wireless','Écouteurs compacts avec boîtier de charge','SoundMax','TW20','ELECTRONICS',79.90,'EUR','https://img.example.com/p2.jpg',true),

-- Claviers & souris
('10000000-0000-0000-0000-000000000003','SKU-KEY-001','Clavier mécanique RGB','Clavier mécanique switches bleus','KeyPro','K95','ELECTRONICS',99.00,'EUR','https://img.example.com/p3.jpg',true),
('10000000-0000-0000-0000-000000000004','SKU-MOU-001','Souris gaming','Souris gaming haute précision','Clicker','X500','ELECTRONICS',49.90,'EUR','https://img.example.com/p4.jpg',true),

-- Écrans
('10000000-0000-0000-0000-000000000005','SKU-SCR-001','Écran 24 pouces','Écran Full HD 144Hz','ViewBest','VB24','ELECTRONICS',189.00,'EUR','https://img.example.com/p5.jpg',true),
('10000000-0000-0000-0000-000000000006','SKU-SCR-002','Écran 27 pouces','Écran QHD IPS','ViewBest','VB27','ELECTRONICS',279.00,'EUR','https://img.example.com/p6.jpg',true),

-- Ordinateurs
('10000000-0000-0000-0000-000000000007','SKU-LAP-001','Laptop Ultrabook','Ultrabook léger et performant','CompTech','U14','COMPUTERS',999.00,'EUR','https://img.example.com/p7.jpg',true),
('10000000-0000-0000-0000-000000000008','SKU-LAP-002','Laptop Gaming','PC portable gaming RTX','CompTech','G17','COMPUTERS',1499.00,'EUR','https://img.example.com/p8.jpg',true),

-- Stockage
('10000000-0000-0000-0000-000000000009','SKU-SSD-001','SSD NVMe 1To','Disque SSD ultra rapide','FastDisk','NV1T','STORAGE',129.00,'EUR','https://img.example.com/p9.jpg',true),
('10000000-0000-0000-0000-000000000010','SKU-HDD-001','Disque dur 2To','HDD externe USB 3','FastDisk','H2T','STORAGE',89.00,'EUR','https://img.example.com/p10.jpg',true),

-- Réseau
('10000000-0000-0000-0000-000000000011','SKU-NET-001','Routeur WiFi 6','Routeur haut débit','NetHome','AX3000','NETWORK',149.00,'EUR','https://img.example.com/p11.jpg',true),
('10000000-0000-0000-0000-000000000012','SKU-NET-002','Répéteur WiFi','Extension de couverture WiFi','NetHome','EXT200','NETWORK',59.00,'EUR','https://img.example.com/p12.jpg',true),

-- Bureau
('10000000-0000-0000-0000-000000000013','SKU-OFF-001','Chaise de bureau','Chaise ergonomique réglable','OfficePlus','ERGO1','OFFICE',199.00,'EUR','https://img.example.com/p13.jpg',true),
('10000000-0000-0000-0000-000000000014','SKU-OFF-002','Bureau assis-debout','Bureau électrique réglable','OfficePlus','STANDX','OFFICE',399.00,'EUR','https://img.example.com/p14.jpg',true),

-- Accessoires
('10000000-0000-0000-0000-000000000015','SKU-ACC-001','Hub USB-C','Hub multiports USB-C','Connectix','HUB7','ACCESSORIES',49.00,'EUR','https://img.example.com/p15.jpg',true),
('10000000-0000-0000-0000-000000000016','SKU-ACC-002','Webcam Full HD','Webcam streaming','StreamPro','CAM1080','ACCESSORIES',79.00,'EUR','https://img.example.com/p16.jpg',true),

-- Divers
('10000000-0000-0000-0000-000000000017','SKU-POW-001','Batterie externe','Power bank 20000mAh','PowerGo','PB20','ACCESSORIES',39.90,'EUR','https://img.example.com/p17.jpg',true),
('10000000-0000-0000-0000-000000000018','SKU-CAB-001','Câble USB-C','Câble USB-C 2m','WireIt','UC2M','ACCESSORIES',14.90,'EUR','https://img.example.com/p18.jpg',true),
('10000000-0000-0000-0000-000000000019','SKU-SPK-001','Enceinte Bluetooth','Enceinte portable','SoundMax','BOOM','ELECTRONICS',89.90,'EUR','https://img.example.com/p19.jpg',true),
('10000000-0000-0000-0000-000000000020','SKU-MON-001','Support écran','Bras articulé écran','MountIt','ARM1','OFFICE',59.00,'EUR','https://img.example.com/p20.jpg',true);
;
INSERT INTO product_image (id, product_id, url, position)
SELECT
  gen_random_uuid(),
  p.id,
  CONCAT('https://img.example.com/', p.sku, '-img', i, '.jpg'),
  i
FROM product p
CROSS JOIN generate_series(1,2) i;