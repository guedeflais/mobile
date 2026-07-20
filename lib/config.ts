// www.gatinelle.fr, pas gatinelle.fr : l'apex redirige (308) vers www, et le
// fetch de React Native gère mal les redirections 308 sur une requête POST
// avec corps JSON (la requête reste bloquée sans jamais aboutir).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://www.gatinelle.fr";
