# 🛒 Tunnel E-Commerce Complet - Documentation

## Vue d'Ensemble

Un **tunnel de commande e-commerce 100% fonctionnel** intégré au système de file d'attente, avec gestion de panier, checkout complet et paiement mock.

## 🎯 Fonctionnalités

### ✅ Boutique en ligne
- **15 produits réalistes** (iPhone, MacBook, Nike, etc.)
- Catégories multiples (Electronics, Fashion, Home, Sports, Books)
- Filtrage par catégorie
- Stock en temps réel
- Prix TVA incluse

### ✅ Panier d'Achat
- Ajout/Retrait de produits
- Modification des quantités
- Persistance localStorage
- Calcul automatique des totaux
- Badge compteur dans la navbar

### ✅ Tunnel de Commande Complet
1. **Boutique** (`/shop`) - Sélection produits
2. **Panier** (`/cart`) - Révision commande
3. **Checkout** (`/checkout`) - Formulaire + Paiement
4. **Confirmation** (`/confirmation`) - Récap' commande
5. **Mes Commandes** (`/orders`) - Historique

### ✅ Système de Paiement (Mock)
- 3 méthodes : Carte bancaire, PayPal, Virement
- Formulaire complet de CB
- Traitement simulé (2 secondes)
- Confirmation immédiate

### ✅ Calculs Automatiques
- Sous-total produits
- **Frais de port** :
  - Gratuit > €100
  - €5.99 entre €50-€100
  - €9.99 < €50
- **TVA** : 20% automatique
- Total TTC

## 📁 Structure Backend

### Migrations
```
database/migrations/
├── create_products_table.php      # Table produits
├── create_orders_table.php        # Table commandes
└── create_order_items_table.php   # Table détails commande
```

### Models Laravel
```php
Product   // Gestion produits + stock
Order     // Commandes avec n° unique
OrderItem // Détails articles par commande
```

### Controllers
```php
ProductController // API produits (index, show, categories, checkStock)
OrderController   // API commandes (create, payment, getUserOrders)
```

### Seeder
```
15 produits réalistes avec :
- Nom, description détaillée
- Prix réels (€49.99 à €2499)
- Stock variable (15-120 unités)
- Catégories variées
```

## 📱 Structure Frontend

### Context API
```typescript
CartContext  // Gestion globale du panier
- addToCart()
- removeFromCart()
- updateQuantity()
- clearCart()
- getCartTotal()
- getCartCount()
```

### Pages Next.js

#### `/shop` - Boutique
- Liste tous les produits
- Filtres par catégorie
- Ajout au panier
- Indicateur stock
- Vérification file d'attente

#### `/cart` - Panier
- Liste articles
- Modification quantités
- Suppression articles
- Récapitulatif prix
- Bouton checkout

#### `/checkout` - Paiement
- **Formulaire client** :
  - Nom, email, téléphone
- **Adresse livraison** :
  - Adresse, ville, code postal
- **Paiement** :
  - Méthode (CB/PayPal/Virement)
  - Carte: n°, expiration, CVV
- **Récapitulatif** commande

#### `/confirmation` - Confirmation
- Numéro de commande
- Détails complets
- Liste articles
- Total payé
- Email de confirmation
- Liens vers commandes/boutique

#### `/orders` - Mes Commandes
- Historique commandes
- Statuts (En attente, Traitement, Expédiée, Livrée)
- Détails par commande
- Total par commande

### Components

#### `Navbar`
- Logo + Navigation
- Badge panier avec compteur
- Liens Boutique / Mes Commandes
- Masquage sur pages admin/waiting

## 🔄 Flux Complet

### 1. Accès au Site
```
User → Queue System → Active → Shop
```

### 2. Shopping
```
Browse Products → Add to Cart → Cart Badge Updates
```

### 3. Panier
```
Review Cart → Update Quantities → See Totals → Proceed to Checkout
```

### 4. Checkout
```
Fill Customer Info → Fill Shipping → Select Payment → Enter Card Details → Confirm Order
```

### 5. Traitement
```
Create Order → Decrement Stock → Process Payment (mock) → Generate Order Number
```

### 6. Confirmation
```
Show Order Details → Email Sent → Clear Cart → Redirect Options
```

## 🗄️ Base de Données

### Table `products`
| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire |
| name | VARCHAR | Nom produit |
| description | TEXT | Description détaillée |
| price | DECIMAL(10,2) | Prix unitaire |
| stock | INT | Quantité disponible |
| image | VARCHAR | URL image |
| category | VARCHAR | Catégorie |
| active | BOOLEAN | Actif/Inactif |

### Table `orders`
| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire |
| order_number | VARCHAR | N° commande unique |
| customer_* | VARCHAR | Info client |
| shipping_* | VARCHAR | Adresse livraison |
| subtotal | DECIMAL | Sous-total HT |
| shipping_cost | DECIMAL | Frais port |
| tax | DECIMAL | TVA 20% |
| total | DECIMAL | Total TTC |
| payment_method | VARCHAR | Méthode paiement |
| payment_status | VARCHAR | État paiement |
| order_status | VARCHAR | État commande |
| session_id | VARCHAR | Session utilisateur |

### Table `order_items`
| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire |
| order_id | INT | FK vers orders |
| product_id | INT | FK vers products |
| product_name | VARCHAR | Nom (snapshot) |
| product_price | DECIMAL | Prix (snapshot) |
| quantity | INT | Quantité |
| subtotal | DECIMAL | Prix * quantité |

## 🚀 Démarrage

### 1. Migrations
```bash
docker-compose exec backend php artisan migrate
```

### 2. Seed Products
```bash
docker-compose exec backend php artisan db:seed
```

### 3. Accéder à la Boutique
```
http://localhost:3000/shop
```

## 🛡️ Intégration File d'Attente

**Toutes les routes e-commerce sont protégées** par le middleware `queue.check` :

```
User Request
   ↓
Queue Middleware
   ↓
Active? → API Call → Response
Waiting? → 429 Error → Waiting Room
```

L'utilisateur **ne peut pas** :
- Voir les produits
- Ajouter au panier
- Passer commande

...sans avoir une **session active** !

## 📊 API Endpoints

### Products
```
GET    /api/products                  # Liste produits
GET    /api/products/{id}             # Détail produit
GET    /api/categories                # Liste catégories
POST   /api/products/check-stock      # Vérifier stock
```

### Orders
```
POST   /api/orders                    # Créer commande
GET    /api/orders/{id}               # Détail commande
GET    /api/orders/number/{orderNum}  # Par numéro
POST   /api/orders/{id}/payment       # Traiter paiement
GET    /api/my-orders                 # Mes commandes
```

**Toutes les routes nécessitent le header** : `X-Session-Id`

## 💳 Paiement Mock

Le système simule un vrai processus de paiement :

```php
// OrderController::processPayment()
sleep(2); // Simule traitement
$order->update(['payment_status' => 'paid']);
```

En production, intégrez :
- Stripe
- PayPal
- Banque

Pour un véritable système de paiement, remplacez cette fonction par des appels API aux providers de paiement.

## 📦 Gestion Stock

**Automatique** lors de la commande :

```php
// Décrémentation du stock
$product->decrementStock($quantity);

// Vérification avant commande
if ($product->stock < $quantity) {
    throw new Exception("Produit en rupture de stock");
}
```

## 🎨 Design

- **Responsive** : Mobile / Tablet / Desktop
- **Tailwind CSS** : Classes utility
- **Icons SVG** : Pas de dépendances icônes
- **Animations** : Smooth transitions
- **Loading States** : Spinners, disabled buttons

## 🧪 Tester le Tunnel Complet

### Scénario Test
```
1. Lancer l'app : docker-compose up -d
2. Seed DB      : docker-compose exec backend php artisan db:seed
3. Accéder      : http://localhost:3000/shop
4. Ajouter 3 produits au panier
5. Aller au panier (/cart)
6. Modifier quantités
7. Procéder au checkout (/checkout)
8. Remplir formulaire :
   - Nom    : John Doe
   - Email  : john@example.com
   - Tel    : 0123456789
   - Adresse: 123 Rue Test
   - Ville  : Paris
   - CP     : 75001
   - Carte  : 1234567812345678
   - Exp    : 12/25
   - CVV    : 123
9. Confirmer → Voir confirmation
10. Vérifier dans /orders
```

## 🔧 Personnalisation

### Ajouter des Produits
Éditer `backend/database/seeders/ProductSeeder.php`

### Modifier les Frais de Port
Éditer `OrderController::calculateShipping()`

### Changer la TVA
Modifier le taux dans `OrderController::store()` :
```php
$tax = $subtotal * 0.20; // 20% → Modifier ici
```

## 📈 Amélioration Possibles

### Phase 1
- [ ] Images produits réelles
- [ ] Recherche produits
- [ ] Tri (prix, nom, popularité)
- [ ] Pagination
- [ ] Wishlist

### Phase 2
- [ ] Comptes utilisateurs
- [ ] Historique commandes persistant
- [ ] Suivi livraison
- [ ] Factures PDF
- [ ] Newsletter

### Phase 3
- [ ] Codes promo
- [ ] Programme fidélité
- [ ] Reviews/Notes produits
- [ ] Recommandations
- [ ] Multi-devises

## 🎓 Architecture

```
┌────────────────┐
│   Next.js      │
│   Frontend     │
│  ┌──────────┐  │
│  │CartContext│  │
│  └──────────┘  │
└────────┬───────┘
         │ REST API
┌────────▼───────┐
│   Laravel      │
│   Backend      │
│ ┌────────────┐ │
│ │Controllers │ │
│ │  Product   │ │
│ │  Order     │ │
│ └────────────┘ │
└────────┬───────┘
         │
┌────────▼───────┐
│   MySQL        │
│   products     │
│   orders       │
│   order_items  │
└────────────────┘
```

## ✅ Checklist Fonctionnalités

- [x] Liste produits
- [x] Détail produit
- [x] Ajout au panier
- [x] Panier persistant
- [x] Modification quantités
- [x] Suppression articles
- [x] Calcul automatique
- [x] Frais de port progressifs
- [x] TVA 20%
- [x] Formulaire client
- [x] Formulaire livraison
- [x] Choix paiement
- [x] Formulaire CB
- [x] Création commande
- [x] Décrémentation stock
- [x] Numéro commande unique
- [x] Confirmation visuelle
- [x] Historique commandes
- [x] Statuts commandes
- [x] Integration file d'attente
- [x] Responsive design
- [x] Loading states

## 🎉 Résultat Final

Un **tunnel e-commerce professionnel et complet** avec :
- 15 produits réels
- Panier fonctionnel
- Checkout multi-étapes
- Paiement simulé
- Confirmation et suivi
- Historique commandes
- **Intégré à la file d'attente**

Prêt pour la production avec quelques ajustements (vraie passerelle de paiement, images, etc.) !

---

**Créé par Claude** | Documentation complète du système e-commerce
