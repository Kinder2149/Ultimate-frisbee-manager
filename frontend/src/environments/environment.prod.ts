/**
 * Configuration d'environnement pour la production
 * 
 * ⚠️ TODO CRITIQUE: Mettre à jour apiUrl après déploiement backend sur Vercel
 * Format attendu: 'https://[VOTRE-PROJET].vercel.app/api'
 */
export const environment = {
  production: true,
  // URL Vercel Functions backend (ajuster après premier déploiement si nécessaire)
  apiUrl: 'https://ultimate-frisbee-manager-kinder.vercel.app/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};
