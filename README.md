# La Gâtinelle — application mobile

Application native (React Native / Expo) pour les particuliers et commerçants de
la Gâtinelle, développée pour la distribution sur l'App Store d'Apple et sur
Google Play (voir `docs/cahier-des-charges-mobile-admin.md` dans le dépôt
`gatinelle-app` pour le contexte complet).

Réutilise les API déjà construites côté serveur pour la PWA (`gatinelle-app`) —
pas de nouvelle logique métier ici, une nouvelle couche d'écrans.

## Développement

```bash
npm install
npx expo start
```

Scanner le QR code affiché avec l'app Expo Go (iOS/Android) pour prévisualiser
sur un téléphone, sans build natif.

## Identifiants d'application

- Android `package` / iOS `bundleIdentifier` : `com.gatinelle` — repris du TWA
  déjà en production sur Google Play, pour pouvoir remplacer ce dernier sur la
  même fiche plus tard sans créer une nouvelle fiche.
