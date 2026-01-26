/**
 * Configuration d'environnement pour la production
 * 
 * Backend déployé sur Vercel Functions
 * Frontend déployé sur Vercel
 */
export const environment = {
  production: true,
  // URL du backend Vercel Functions
  apiUrl: 'https://ultimate-frisbee-manager.vercel.app/api',
  // Supabase pour l'authentification
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmVhYWVpY2Nxa3dnd3h3eGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MzI3NjAsImV4cCI6MjA1MDMwODc2MH0.5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};
