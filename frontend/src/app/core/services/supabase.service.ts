import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public readonly supabase: SupabaseClient;

  constructor() {
    if (!environment.supabaseUrl || !environment.supabaseKey) {
      throw new Error('Supabase URL and Key must be provided in environment files.');
    }
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
}
