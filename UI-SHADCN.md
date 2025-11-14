# 🎨 Integration shadcn/ui - Documentation

## Vue d'ensemble

Ce document décrit l'intégration complète de **shadcn/ui** dans le projet Next.js pour fournir une interface utilisateur moderne, accessible et cohérente.

shadcn/ui est une collection de composants réutilisables construits avec **Radix UI** et **Tailwind CSS**, offrant une excellente expérience développeur et utilisateur.

---

## 📦 Installation et Configuration

### 1. Dépendances ajoutées

Les packages suivants ont été ajoutés au projet :

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.303.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### 2. Configuration Tailwind CSS

**Fichier : `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 3. Variables CSS

**Fichier : `src/app/globals.css`**

Toutes les couleurs sont définies en utilisant des variables CSS HSL pour un support complet du thème clair/sombre :

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... autres variables pour le dark mode */
  }
}
```

### 4. Utilitaire cn()

**Fichier : `src/lib/utils.ts`**

Fonction helper pour combiner et fusionner des classes CSS :

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5. Configuration shadcn/ui

**Fichier : `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## 🧩 Composants Créés

### 1. Button

**Fichier : `src/components/ui/button.tsx`**

Composant Button avec plusieurs variantes et tailles.

**Utilisation :**

```tsx
import { Button } from "@/components/ui/button"

// Variantes
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tailles
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// Désactivé
<Button disabled>Disabled</Button>

// As Child (pour Link par exemple)
<Button asChild>
  <Link href="/shop">Go to Shop</Link>
</Button>
```

**Props :**
- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- `asChild`: boolean - Utilise Radix Slot pour transférer les props à l'enfant

---

### 2. Card

**Fichier : `src/components/ui/card.tsx`**

Composant Card avec Header, Title, Description, Content et Footer.

**Utilisation :**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
    <CardDescription>Product description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content</p>
  </CardContent>
  <CardFooter>
    <Button>Add to Cart</Button>
  </CardFooter>
</Card>
```

**Composants :**
- `Card` : Container principal
- `CardHeader` : En-tête avec espacement
- `CardTitle` : Titre (h3 par défaut)
- `CardDescription` : Description (texte muted)
- `CardContent` : Contenu principal
- `CardFooter` : Footer avec flexbox

---

### 3. Input

**Fichier : `src/components/ui/input.tsx`**

Composant Input stylisé pour les formulaires.

**Utilisation :**

```tsx
import { Input } from "@/components/ui/input"

<Input type="text" placeholder="Enter your name" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Quantity" />

// Avec Label
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

**Caractéristiques :**
- Focus ring avec animations
- Support placeholder
- Support disabled
- Gestion des fichiers
- Responsive

---

### 4. Badge

**Fichier : `src/components/ui/badge.tsx`**

Composant Badge pour labels, compteurs, statuts.

**Utilisation :**

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">New</Badge>
<Badge variant="secondary">In Stock</Badge>
<Badge variant="destructive">Out of Stock</Badge>
<Badge variant="outline">Premium</Badge>

// Avec icônes
<Badge>
  <ShoppingCart className="mr-1 h-3 w-3" />
  3 items
</Badge>
```

**Variantes :**
- `default` : Primary color
- `secondary` : Gris
- `destructive` : Rouge
- `outline` : Bordure

---

### 5. Select

**Fichier : `src/components/ui/select.tsx`**

Composant Select basé sur Radix UI avec recherche et clavier.

**Utilisation :**

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="electronics">Electronics</SelectItem>
    <SelectItem value="clothing">Clothing</SelectItem>
    <SelectItem value="books">Books</SelectItem>
  </SelectContent>
</Select>
```

**Composants :**
- `Select` : Root component
- `SelectTrigger` : Bouton d'ouverture
- `SelectValue` : Valeur affichée
- `SelectContent` : Dropdown content
- `SelectItem` : Option sélectionnable
- `SelectGroup` : Grouper des items
- `SelectLabel` : Label de groupe
- `SelectSeparator` : Séparateur

---

### 6. Label

**Fichier : `src/components/ui/label.tsx`**

Composant Label pour formulaires accessibles.

**Utilisation :**

```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

---

### 7. Separator

**Fichier : `src/components/ui/separator.tsx`**

Composant Separator pour diviser visuellement le contenu.

**Utilisation :**

```tsx
import { Separator } from "@/components/ui/separator"

<div>
  <p>Section 1</p>
  <Separator className="my-4" />
  <p>Section 2</p>
</div>

// Vertical
<div className="flex h-20">
  <div>Left</div>
  <Separator orientation="vertical" className="mx-4" />
  <div>Right</div>
</div>
```

---

## 🎨 Système de Thème

### Mode Clair / Sombre

Le système est prêt pour le dark mode grâce aux variables CSS.

**Pour activer le dark mode :**

```tsx
// Dans layout.tsx ou un composant racine
<html lang="en" className="dark">
  <body>{children}</body>
</html>

// Ou dynamiquement
<html lang="en" className={theme === 'dark' ? 'dark' : ''}>
  <body>{children}</body>
</html>
```

### Personnalisation des Couleurs

Modifier les variables CSS dans `globals.css` :

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Bleu par défaut */
  /* Changez en vert : */
  --primary: 142 76% 36%;
  /* Changez en violet : */
  --primary: 262 83% 58%;
}
```

---

## 📚 Exemples d'Utilisation

### 1. Formulaire de Contact

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 2. Carte Produit

```tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{product.name}</CardTitle>
          {product.stock > 0 ? (
            <Badge variant="secondary">In Stock</Badge>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">€{product.price.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={product.stock === 0}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 3. Select avec Filtre

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CategoryFilter({ onCategoryChange }: { onCategoryChange: (category: string) => void }) {
  return (
    <Select onValueChange={onCategoryChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        <SelectItem value="electronics">Electronics</SelectItem>
        <SelectItem value="clothing">Clothing</SelectItem>
        <SelectItem value="books">Books</SelectItem>
        <SelectItem value="sports">Sports</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

---

## 🔄 Migration des Composants Existants

### Avant (Code actuel)

```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click me
</button>
```

### Après (Avec shadcn/ui)

```tsx
<Button>Click me</Button>
```

### Avantages

1. **Cohérence** : Tous les boutons ont le même style
2. **Accessibilité** : Focus states, ARIA attributes automatiques
3. **Maintenabilité** : Changements centralisés
4. **Variantes** : Multiples styles prédéfinis
5. **TypeScript** : Props typées

---

## 🚀 Prochaines Étapes

### Composants Additionnels Recommandés

Pour enrichir l'UI, considérer l'ajout de :

1. **Dialog** : Modales pour confirmation d'achat
2. **Toast** : Notifications (ajouté au panier, commande créée)
3. **Dropdown Menu** : Menu utilisateur, actions admin
4. **Table** : Liste des commandes, admin dashboard
5. **Tabs** : Navigation dans le profil utilisateur
6. **Avatar** : Profil utilisateur
7. **Progress** : Barre de progression du checkout
8. **Skeleton** : Loading states

### Migration Progressive

**Phase 1 : Composants de Base**
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Badge
- ✅ Select
- ✅ Label
- ✅ Separator

**Phase 2 : Pages Simples**
- [ ] Page Shop (ProductCard)
- [ ] Page Cart (CartItem)
- [ ] Navbar

**Phase 3 : Pages Complexes**
- [ ] Page Checkout (Form complet)
- [ ] Page Admin Dashboard
- [ ] Page Orders

**Phase 4 : Interactions**
- [ ] Toast notifications
- [ ] Dialogs de confirmation
- [ ] Loading states avec Skeleton

---

## 📖 Ressources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [class-variance-authority](https://cva.style/docs)

---

## ✨ Bonnes Pratiques

### 1. Composition

Préférer composer les composants plutôt que créer de nouvelles variantes :

```tsx
// ✅ Bon
<Button className="w-full">
  <ShoppingCart className="mr-2 h-4 w-4" />
  Add to Cart
</Button>

// ❌ Éviter de créer ButtonWithIcon
```

### 2. Extensibilité

Tous les composants acceptent `className` pour override :

```tsx
<Card className="border-2 border-blue-500">
  {/* content */}
</Card>
```

### 3. Accessibilité

Toujours utiliser `Label` avec `Input` :

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### 4. TypeScript

Utiliser les types exportés :

```tsx
import { ButtonProps } from "@/components/ui/button"

function MyButton(props: ButtonProps) {
  return <Button {...props} />
}
```

---

## 🎯 Conclusion

L'intégration de shadcn/ui dans le projet Next.js apporte :

- ✅ **Design System** cohérent et professionnel
- ✅ **Accessibilité** (WCAG 2.1)
- ✅ **Performances** optimisées
- ✅ **Developer Experience** excellente
- ✅ **Customisation** facile via CSS variables
- ✅ **Dark Mode** ready
- ✅ **TypeScript** support complet
- ✅ **Responsive** par défaut

Le projet est maintenant prêt pour une migration progressive vers ces composants pour une UI moderne, propre et professionnelle !
