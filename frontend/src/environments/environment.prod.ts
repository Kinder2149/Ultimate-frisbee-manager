/**
 * Configuration d'environnement pour la production
 * 
 * ⚠️ TODO CRITIQUE: Mettre à jour apiUrl après déploiement backend sur Vercel
 * Format attendu: 'https://[VOTRE-PROJET].vercel.app/api'
 */
export const environment = {
  production: true,
  // TODO: Remplacer par l'URL Vercel après déploiement backend
  apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};
