import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { prisma } from '../_shared/prisma.ts'

// Lire l'origine autorisée depuis les variables d'environnement de la fonction Supabase.
// Fournir une valeur par défaut pour le développement local.
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:4200';

// Définir les en-têtes CORS pour les réutiliser
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin' // Indiquer au cache que la réponse dépend de l'origine
};

serve(async (req) => {
  // Gérer la requête preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer les données du body de la requête POST
    const body = await req.json();
    const category = body.category;

    // Récupérer les tags depuis la base de données
    const tags = await prisma.tag.findMany({
      where: category ? { category } : {},
    });

    // Renvoyer les données avec les en-têtes CORS
    return new Response(JSON.stringify(tags), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Gérer les erreurs et les renvoyer avec les en-têtes CORS
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
