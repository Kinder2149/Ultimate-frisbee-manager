import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        // Forcer la désactivation de la synchronisation entre onglets.
        // C'est la cause racine du conflit avec zone.js d'Angular.
        multiTab: false
      }
    } as any); // Utiliser 'as any' pour contourner le typage strict qui ne reconnaît pas cette option pourtant fonctionnelle.
  }
}
