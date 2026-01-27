import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss']
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password: string = '';
  @Input() showDetails: boolean = true;

  strength: PasswordStrength = {
    score: 0,
    label: '',
    color: '',
    suggestions: []
  };

  ngOnChanges(): void {
    this.strength = this.calculateStrength(this.password);
  }

  private calculateStrength(password: string): PasswordStrength {
    if (!password) {
      return { score: 0, label: '', color: '', suggestions: [] };
    }

    let score = 0;
    const suggestions: string[] = [];

    // Longueur
    if (password.length >= 8) score++;
    else suggestions.push('Au moins 8 caractères');

    if (password.length >= 12) score++;

    // Majuscules
    if (/[A-Z]/.test(password)) score++;
    else suggestions.push('Une lettre majuscule');

    // Minuscules
    if (/[a-z]/.test(password)) score++;
    else suggestions.push('Une lettre minuscule');

    // Chiffres
    if (/[0-9]/.test(password)) score++;
    else suggestions.push('Un chiffre');

    // Caractères spéciaux
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else suggestions.push('Un caractère spécial (!@#$%...)');

    // Mots de passe communs à éviter
    const commonPasswords = ['password', '123456', 'qwerty', 'azerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      score = Math.max(0, score - 2);
      suggestions.push('Évitez les mots de passe courants');
    }

    // Normaliser le score sur 4
    const normalizedScore = Math.min(4, Math.floor(score / 1.5));

    let label = '';
    let color = '';

    switch (normalizedScore) {
      case 0:
      case 1:
        label = 'Très faible';
        color = '#f44336';
        break;
      case 2:
        label = 'Faible';
        color = '#ff9800';
        break;
      case 3:
        label = 'Moyen';
        color = '#ffc107';
        break;
      case 4:
        label = 'Fort';
        color = '#4caf50';
        break;
    }

    return { score: normalizedScore, label, color, suggestions };
  }

  get bars(): number[] {
    return [0, 1, 2, 3];
  }
}
