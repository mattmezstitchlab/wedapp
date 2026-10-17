# Plan — Le Grand Jour

## Périmètre retenu

Le Grand Jour est une application mobile de planification de mariage qui transforme l’organisation d’un événement en atelier visuel simple : une journée découpée en moments, une bibliothèque de ressources réutilisables et une liste de tâches actionnable au téléphone. La première version livrée couvre un parcours complet de démonstration et de travail : consulter les moments, ajouter/retirer des prestataires, déplacer une affectation entre moments, filtrer la bibliothèque, suivre les statuts, cocher les tâches, consulter les coûts et détecter les informations manquantes. Les modèles de données et les routes serveur préparent la persistance, l’historique et la collaboration.

## Approche d’implémentation

- **Client** : Expo Router + React Native + TypeScript + NativeWind, avec un shell portrait à quatre onglets : Planning, Bibliothèque, Tâches et Budget. Les composants restent compatibles iOS, Android et Expo Web ; les contrôles interactifs utilisent des `Pressable` stylés avec `style` pour respecter l’adaptateur NativeWind du starter.
- **État produit** : un store React local fournit une réponse immédiate pour le parcours tactile ; les mutations sont envoyées vers tRPC dès que l’API répond. Un jeu de données de démonstration cohérent permet de travailler sans compte ni donnée préalable. Les règles de domaine sont isolées dans `lib/wedding-rules.ts` afin de recalculer les conflits et les besoins sans IA.
- **Serveur et persistance** : Drizzle/MySQL conserve l’événement, les moments, les prestataires, les services, les affectations, les tâches, les devis/paiements, les documents et l’historique. Le routeur tRPC expose les lectures et mutations du workspace. Les écritures restent idempotentes sur les identifiants métier et l’API peut évoluer vers les autorisations Manus OAuth du starter.
- **Collaboration** : les rôles `couple`, `planner` et `vendor` sont modélisés dans les membres d’événement et affichés dans l’espace équipe ; les actions sensibles sont regroupées dans les propriétés de l’élément sélectionné. La couche d’autorisation serveur est préparée pour être branchée aux utilisateurs authentifiés sans bloquer le parcours de démonstration.
- **Médias** : les fiches prestataires acceptent une image distante ou une future URL `/manus-storage/...`. Aucun média décoratif supplémentaire n’est ajouté au tableau de bord afin de conserver la lisibilité demandée.

## Direction artistique

- **Mouvement** : Apple / Framer editorial — une interface d’atelier calme, lumineuse et précise, avec des cartes flottantes, des bordures fines et une hiérarchie typographique très nette.
- **Principes** : réduire la charge mentale ; faire ressortir le prochain geste ; traiter les coûts comme une information de confiance ; privilégier le tactile, les surfaces larges et les retours d’état explicites.
- **Philosophie couleur** : ivoire chaud et graphite pour la base, bleu ardoise comme couleur de décision, corail discret pour les alertes et vert sauge pour les confirmations. La palette doit évoquer du papier de travail premium plutôt qu’un tableau de gestion froid.
- **Paradigme de mise en page** : une pile verticale mobile avec une barre de contexte persistante, des sections décalées et un planning horizontal scrollable ; chaque onglet est une vue focalisée plutôt qu’un dashboard miniature compressé.
- **Éléments signature** : le ruban de progression du jour J ; les pastilles de statut en forme de capsules ; les cartes de prestataires avec miniature, rôle et montant visible.
- **Interaction** : tap sur une carte pour ouvrir ses propriétés ; appui sur « Ajouter » pour affecter une ressource à un moment ; glissement représenté par des cartes réordonnables et un déplacement tactile simplifié via boutons de moment afin de rester fiable sur téléphone.
- **Animation** : transitions courtes de 180–240 ms, apparition par fondu et translation légère, feedback haptique sur les actions de statut et de tâche, aucune animation décorative continue.
- **Typographie** : système sans-serif natif pour la lisibilité, avec titres semibold espacés et chiffres de budget en poids fort ; capitales réservées aux micro-labels.
- **Essence de marque** : le copilote visuel qui transforme un mariage complexe en une suite de décisions simples. Personnalité : sereine, précise, attentionnée.
- **Voix** : directe, chaleureuse et concrète. Exemples : « Le prochain geste est déjà là. » et « Rien ne se perd entre le cocktail et la soirée. »
- **Logo** : un monogramme “GJ” formé par deux arcs de ruban qui se rejoignent comme un nœud minimal, lisible en monochrome dans une icône carrée.
- **Couleur signature** : bleu ardoise `#43566B`, utilisé avec parcimonie sur les actions et les repères temporels.

## Modèle de données

`users` reste la table du starter. Les tables métier seront ajoutées dans `drizzle/schema.ts` : `weddingEvents`, `eventMembers`, `moments`, `vendors`, `services`, `assignments`, `needs`, `tasks`, `quotes`, `payments`, `documents`, `activityLog`. Les ressources réutilisables (`vendors`, `services`) sont séparées des affectations (`assignments`) afin qu’un prestataire puisse être attaché à plusieurs moments sans dupliquer sa fiche ni son forfait.

## Organisation des fichiers

- `app/(tabs)/_layout.tsx` : navigation mobile et barre d’onglets.
- `app/(tabs)/index.tsx` : planning du jour, timeline des moments, affectations et actions de déplacement.
- `app/(tabs)/library.tsx` : bibliothèque filtrable de prestataires et services.
- `app/(tabs)/tasks.tsx` : tâches filtrables et cochables.
- `app/(tabs)/budget.tsx` : synthèse estimé/validé/acompte/solde et alertes.
- `components/wedding/*` : cartes, capsules de statut, en-têtes et panneaux de propriétés réutilisables.
- `lib/wedding-data.ts` : seed de démonstration et types client.
- `lib/wedding-rules.ts` : consolidation des besoins, calculs budgétaires et conflits.
- `lib/wedding-store.tsx` : état partagé du workspace et mutations optimistes.
- `server/wedding.ts` et `server/routers.ts` : lectures/mutations tRPC et règles serveur.
- `drizzle/schema.ts` : tables et types persistants.
- `assets/images/*` : identité native et icône carrée de l’application.

## Flux de construction et de livraison

1. Étendre le schéma et les routes métier sans supprimer les helpers d’authentification du starter.
2. Remplacer le contenu de démonstration Expo par les quatre vues mobiles et leurs composants.
3. Enregistrer les diagnostics TypeScript déjà gérés par le Sandbox, lancer `pnpm db:push`, puis démarrer Metro et l’API sur les ports fixes 8081/3000.
4. Exécuter `pnpm check`, `pnpm test` et un contrôle HTTP des deux listeners ; corriger les diagnostics actionnables.
5. Vérifier les vues planning/bibliothèque/tâches/budget sur Expo Web et une taille de viewport mobile si nécessaire.
6. Mettre à jour la configuration de marque et les assets natifs, puis créer un checkpoint sur le remote canonique. La publication reste séparée et n’est pas activée automatiquement.
