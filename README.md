# Sutom Game [https://github.com/win-wiz/sutom-game]

Un jeu de devinettes de mots construit avec T3 Stack, similaire à Wordle.

## Présentation du Projet

Sutom est un jeu de devinettes de mots basé sur le web où les joueurs doivent deviner le mot correct à travers plusieurs tentatives. Le jeu présente les caractéristiques suivantes :

- 🎮 Gameplay similaire à Wordle
- 🎹 Support du clavier français (AZERTY)
- 🔊 Retours sonores riches
- 📱 Design responsive, compatible mobile
- ⚡ Stack technologique moderne basé sur T3 Stack

## Stack Technologique

- **Next.js 13+** - Framework React avec App Router
- **TypeScript** - JavaScript avec sécurité de type
- **TailwindCSS** - Framework CSS utility-first
- **React Hooks** - Gestion d'état et effets de bord

## Commencer

### Installation des Dépendances

```bash
npm install
```

### Démarrer le Serveur de Développement

```bash
npm run dev
```

Visitez [http://localhost:3000](http://localhost:3000) pour commencer à jouer.

### Construire la Version de Production

```bash
npm run build
npm run start
```

## Règles du Jeu

1. Devinez le mot cible, chaque tentative doit être un mot complet
2. La première lettre est donnée comme indice
3. Après avoir soumis une tentative, chaque lettre affichera une couleur différente :
   - 🟢 **Vert** : Lettre correcte à la bonne position
   - 🟡 **Jaune** : Lettre correcte mais à la mauvaise position
   - ⚫ **Gris** : Lettre n'existe pas dans le mot cible

## Caractéristiques du Jeu

### Retours Sonores
- Son de succès lors de la découverte d'une lettre correcte
- Son d'indication lorsque la lettre est mal placée
- Son d'erreur lorsque la lettre n'existe pas
- Son de victoire lors de la réussite du jeu

### Support Clavier
- Support de la saisie au clavier physique
- Interface de clavier virtuel
- Les touches du clavier affichent leur état selon l'utilisation

### Mots Personnalisés
Vous pouvez spécifier un mot via les paramètres URL :
```
http://localhost:3000?word=<mot encodé en base64>
```

Par exemple :
```
http://localhost:3000?word=Ym9uam91cg==
```

## Structure du Projet

```
src/
├── app/                 # Pages Next.js App Router
├── components/          # Composants React
│   ├── Game.tsx        # Composant principal du jeu
│   ├── GameGrid.tsx    # Composant grille de jeu
│   └── VirtualKeyboard.tsx # Composant clavier virtuel
├── hooks/              # Hooks React personnalisés
│   └── useGame.ts      # Gestion d'état du jeu
├── lib/                # Fonctions utilitaires
│   └── gameUtils.ts    # Outils logique de jeu
├── types/              # Définitions de types TypeScript
│   └── game.ts         # Types liés au jeu
└── styles/             # Fichiers de styles
    └── globals.css     # Styles globaux

doc/                     # Documentation du projet
├── requirements.md      # Documentation des exigences
├── changes.md          # Journal des modifications
├── iterations.md       # Processus d'itération
├── project-summary.md  # Résumé du projet
├── iteration-plan.md   # Plan d'itération
└── index.md           # Index de la documentation
```

## Commandes de Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Construire le projet
npm run build

# Démarrer le serveur de production
npm run start

# Vérification du code
npm run lint

# Formatage du code
npm run lint:fix
```

## Déploiement

Le projet peut être déployé sur les plateformes suivantes :

- [Vercel](https://vercel.com) (recommandé)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)

## Contribution

Les Issues et Pull Requests sont les bienvenus pour améliorer le projet.

## Licence

MIT License
