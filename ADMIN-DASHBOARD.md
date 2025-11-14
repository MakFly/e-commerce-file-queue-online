# 📊 Admin Dashboard - Documentation

## Vue d'Ensemble

L'interface graphique d'administration permet de **visualiser et gérer le système de file d'attente en temps réel**. Elle offre une vue complète de l'état du système avec des graphiques, statistiques et contrôles administratifs.

## 🚀 Accès au Dashboard

### URL
```
http://localhost:3000/admin
```

### Accès Rapide
Un **bouton flottant** (icône statistiques) apparaît en bas à droite de toutes les pages :
- Cliquez dessus pour accéder instantanément au dashboard
- Il disparaît automatiquement sur la page admin

## 📱 Interface Complète

Le dashboard comprend plusieurs sections :

### 1. 📈 Cartes de Statistiques (4 cartes)

#### Carte 1 : Active Users (Utilisateurs Actifs)
- **Affichage** : Nombre d'utilisateurs actuellement sur le site
- **Sous-titre** : Nombre de slots disponibles
- **Couleur** : Bleu
- **Icône** : Groupe d'utilisateurs
- **Exemple** : "Active Users: 15 (85 slots available)"

#### Carte 2 : Waiting Users (Utilisateurs en Attente)
- **Affichage** : Nombre d'utilisateurs dans la file d'attente
- **Sous-titre** : "In queue"
- **Couleur** : Jaune/Orange
- **Icône** : Horloge
- **Exemple** : "Waiting Users: 23 (In queue)"

#### Carte 3 : Total Users (Total)
- **Affichage** : Total (actifs + en attente)
- **Sous-titre** : "Active + Waiting"
- **Couleur** : Violet
- **Icône** : Utilisateurs multiples
- **Exemple** : "Total Users: 38"

#### Carte 4 : Capacity (Capacité)
- **Affichage** : Pourcentage d'utilisation
- **Sous-titre** : Limite maximale configurée
- **Couleur dynamique** :
  - 🟢 Vert : < 50%
  - 🔵 Bleu : 50-69%
  - 🟡 Jaune : 70-89%
  - 🔴 Rouge : ≥ 90%
- **Exemple** : "Capacity: 87% (100 max users)"

### 2. 📊 Graphique en Temps Réel

#### User Activity Chart
- **Type** : Graphique linéaire (LineChart)
- **Période** : Dernière heure (60 minutes)
- **Données affichées** :
  - 🔵 Ligne bleue : Utilisateurs actifs
  - 🟡 Ligne orange : Utilisateurs en attente
- **Axes** :
  - X : Temps (format HH:mm)
  - Y : Nombre d'utilisateurs
- **Interaction** : Hover pour voir les valeurs exactes
- **Rafraîchissement** : Toutes les 5 secondes

### 3. 🚦 System Status (État du Système)

#### Indicateur de Statut
Affiche l'état global du système avec 4 niveaux :

**🟢 Healthy (Sain)** - Usage < 50%
- Badge vert avec ✓
- Message : "System Operating Normally"

**🔵 Moderate Load (Charge Modérée)** - Usage 50-69%
- Badge bleu avec ◐
- Message : "System Operating Normally"

**🟡 High Load (Charge Élevée)** - Usage 70-89%
- Badge jaune avec ⚠
- Message : "High Load - System is experiencing high traffic"

**🔴 Critical (Critique)** - Usage ≥ 90%
- Badge rouge avec !
- Message : "Critical Load - System is at capacity"

#### Barre de Progression
- Visualisation graphique du pourcentage d'utilisation
- Couleur dynamique selon le niveau
- Graduations : 0%, 50%, 100%

### 4. ⚙️ Admin Controls (Contrôles Administratifs)

#### Toggle Queue System
- **Action** : Activer/Désactiver la file d'attente
- **Type** : Interrupteur on/off
- **Effet immédiat** : Les utilisateurs peuvent bypasser la file si désactivé

#### Max Concurrent Users
- **Action** : Modifier la limite d'utilisateurs simultanés
- **Input** : Champ numérique (0 - 10000)
- **Bouton** : "Update" pour appliquer
- **Note** : Peut nécessiter un redémarrage serveur

#### Clear All Queues
- **Action** : Supprimer tous les utilisateurs (actifs + en attente)
- **Sécurité** : Double confirmation requise
- **Processus** :
  1. Clic 1 : Bouton devient rouge "⚠ Click Again to Confirm"
  2. Clic 2 (dans les 3 secondes) : Exécution
- **Effet** : Libération immédiate de tous les slots

#### Quick Actions (Actions Rapides)
4 boutons préconfigurés pour tester rapidement :

| Bouton | Limite | Usage |
|--------|--------|-------|
| **Test Mode (1)** | 1 utilisateur | Tests de file d'attente |
| **Normal (100)** | 100 utilisateurs | Production normale |
| **High (1000)** | 1000 utilisateurs | Trafic élevé |
| **Block All (0)** | 0 utilisateur | Bloquer tout le monde |

### 5. 👥 Active Users List (Liste Utilisateurs Actifs)

#### Colonnes du Tableau
| Colonne | Description |
|---------|-------------|
| **Session ID** | Identifiant de session (8 premiers caractères) |
| **Joined At** | Heure d'arrivée (HH:mm:ss) |
| **Expires In** | Temps restant avant expiration (ex: "4m 32s") |
| **Action** | Bouton "Kick" pour expulser |

#### Fonctionnalités
- **Badge** : Affiche le nombre total d'utilisateurs actifs
- **Hover** : Ligne surlignée au survol
- **Kick** : Bouton rouge pour expulser un utilisateur spécifique
- **Vide** : Affiche une icône et "No active users" si aucun utilisateur

### 6. ⏳ Waiting Users List (Liste Utilisateurs en Attente)

#### Colonnes du Tableau
| Colonne | Description |
|---------|-------------|
| **Position** | Badge jaune avec numéro (#1, #2, etc.) |
| **Session ID** | Identifiant de session (8 premiers caractères) |
| **Joined At** | Heure d'entrée dans la file |
| **Wait Time** | Temps d'attente écoulé |
| **Action** | Bouton "Kick" pour retirer de la file |

#### Fonctionnalités
- Tri automatique par position
- Badge de position en jaune
- Temps d'attente actualisé en temps réel

## 🔄 Rafraîchissement Automatique

### Toggle Auto-Refresh
- **Position** : En haut à droite du dashboard
- **Par défaut** : Activé
- **Fréquence** : Toutes les 5 secondes
- **Affichage** : Heure de dernière mise à jour

### Données Rafraîchies
Lorsque l'auto-refresh est actif :
- ✅ Statistiques (cartes)
- ✅ Graphique historique
- ✅ Liste des utilisateurs actifs
- ✅ Liste des utilisateurs en attente
- ✅ Statut du système

## 🎨 Design et UX

### Palette de Couleurs
- **Primaire** : Bleu (#3b82f6)
- **Succès** : Vert (#10b981)
- **Attention** : Jaune (#f59e0b)
- **Danger** : Rouge (#ef4444)
- **Secondaire** : Violet (#8b5cf6)

### Responsive Design
- **Desktop** : Grille 4 colonnes pour les stats
- **Tablet** : Grille 2 colonnes
- **Mobile** : Colonne unique

### Animations
- Hover sur les cartes : Élévation de l'ombre
- Transition smooth sur les graphiques
- Pulse sur le bouton admin flottant

## 📡 API Endpoints Utilisés

Le dashboard communique avec ces endpoints :

```
GET  /api/admin/dashboard     # Données complètes du dashboard
GET  /api/admin/stats          # Statistiques en temps réel
GET  /api/admin/history        # Historique pour le graphique
POST /api/admin/kick-user      # Expulser un utilisateur
POST /api/admin/clear-queue    # Vider toutes les files
POST /api/admin/update-config  # Modifier la configuration
GET  /api/admin/redis-info     # Informations Redis
```

## 🎯 Cas d'Usage

### 1. Surveillance en Production
```
Scénario : Vente flash sur le site
Action   : Ouvrir le dashboard pour monitorer en temps réel
Objectif : S'assurer que le système gère bien le trafic
```

### 2. Tests de Charge
```
Scénario : Tester le système avant un événement
Action   : Mettre limite à 1 (Test Mode)
Objectif : Vérifier que la file d'attente fonctionne
```

### 3. Maintenance
```
Scénario : Maintenance urgente du site
Action   : Block All (0) ou Clear All Queues
Objectif : Vider le site de tous les utilisateurs
```

### 4. Optimisation
```
Scénario : Ajuster la capacité selon le trafic
Action   : Modifier Max Concurrent Users
Objectif : Trouver l'équilibre optimal
```

## 🔐 Sécurité

### Recommandations
- [ ] Ajouter une authentification admin
- [ ] Implémenter des rôles (admin, viewer)
- [ ] Logger toutes les actions admin
- [ ] Rate limiting sur les endpoints admin
- [ ] Protection CSRF

### À Implémenter (Phase 2)
```typescript
// Exemple d'authentification
const middleware = [
  'auth',        // Vérifier authentification
  'role:admin',  // Vérifier rôle admin
  'log:actions', // Logger les actions
];
```

## 🚀 Améliorations Futures

### Phase 1 - Fonctionnalités
- [ ] Export des statistiques (CSV, PDF)
- [ ] Notifications en temps réel (WebSocket)
- [ ] Historique sur plusieurs jours
- [ ] Filtres sur les listes d'utilisateurs
- [ ] Recherche par session ID

### Phase 2 - Analytics
- [ ] Temps moyen d'attente
- [ ] Taux de conversion (file → actif)
- [ ] Pics de trafic détectés
- [ ] Prédictions de charge
- [ ] Comparaison jour/semaine/mois

### Phase 3 - Contrôles Avancés
- [ ] Priorité pour certains utilisateurs (VIP)
- [ ] Blacklist/Whitelist d'IPs
- [ ] Limites par IP
- [ ] Messages personnalisés en salle d'attente
- [ ] Throttling dynamique

## 📸 Captures d'Écran (Description)

### Vue Desktop
```
┌─────────────────────────────────────────────────────────────┐
│  Queue Dashboard              [Auto-refresh: ON] [23:45:12] │
├─────────────────────────────────────────────────────────────┤
│  [Active: 87] [Waiting: 23] [Total: 110] [Capacity: 87%]   │
├─────────────────────────────────────────────────────────────┤
│  [           Graphique Activité (60min)          ] [Status] │
├─────────────────────────────────────────────────────────────┤
│  [              Admin Controls                             ] │
├─────────────────────────────────────────────────────────────┤
│  [  Active Users  ]                [  Waiting Users      ]  │
│  │ ID  │Time│Exp │                 │Pos│ID │Time│Wait   │  │
│  │ ...│... │... │                 │ # │...│... │...    │  │
└─────────────────────────────────────────────────────────────┘
```

## 💡 Conseils d'Utilisation

### Pour les Tests
1. Utilisez "Test Mode (1)" pour voir rapidement la file d'attente
2. Ouvrez plusieurs navigateurs incognito
3. Observez les changements en temps réel sur le dashboard

### En Production
1. Laissez l'auto-refresh activé
2. Surveillez le statut système (évitez le rouge)
3. Augmentez progressivement la limite si nécessaire
4. Utilisez Clear Queue avec précaution

### Dépannage
1. **Dashboard ne charge pas** → Vérifiez que le backend est démarré
2. **Stats à 0** → Vérifiez la connexion Redis
3. **Graphique vide** → Attendez quelques minutes pour l'historique
4. **Kick ne fonctionne pas** → Rafraîchissez la page

## 📚 Ressources

- **Code** : `/frontend/src/app/admin/page.tsx`
- **Composants** : `/frontend/src/components/admin/`
- **API** : `/backend/app/Http/Controllers/AdminController.php`
- **Types** : `/frontend/src/lib/api.ts`

---

**Note** : Cette interface graphique a été créée pour faciliter la gestion et la surveillance du système de file d'attente. Elle est évolutive et peut être étendue selon vos besoins.
