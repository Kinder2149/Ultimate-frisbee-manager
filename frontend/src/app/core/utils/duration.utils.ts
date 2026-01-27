/**
 * Utilitaires pour la gestion des durées
 * Parsing typé et formatage unifié
 */

export class DurationUtils {
  /**
   * Parse une chaîne de durée en secondes
   * Formats supportés: "5 min", "30 sec", "1h", "1h 30min"
   */
  static parse(durationStr: string): number {
    if (!durationStr || typeof durationStr !== 'string') {
      return 0;
    }

    const normalized = durationStr.toLowerCase().trim();
    let totalSeconds = 0;

    const hoursMatch = normalized.match(/(\d+)\s*h/);
    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    }

    const minutesMatch = normalized.match(/(\d+)\s*min/);
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1], 10) * 60;
    }

    const secondsMatch = normalized.match(/(\d+)\s*sec/);
    if (secondsMatch) {
      totalSeconds += parseInt(secondsMatch[1], 10);
    }

    return totalSeconds;
  }

  /**
   * Formate un nombre de secondes en chaîne lisible
   */
  static format(seconds: number): string {
    if (!seconds || seconds < 0) {
      return '0 sec';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours}h`);
    }

    if (minutes > 0) {
      parts.push(`${minutes} min`);
    }

    if (secs > 0 && hours === 0) {
      parts.push(`${secs} sec`);
    }

    return parts.length > 0 ? parts.join(' ') : '0 sec';
  }

  /**
   * Additionne plusieurs durées (en chaînes)
   */
  static sum(durations: string[]): number {
    return durations.reduce((total, duration) => {
      return total + this.parse(duration);
    }, 0);
  }

  /**
   * Convertit des minutes en format lisible
   */
  static fromMinutes(minutes: number): string {
    return this.format(minutes * 60);
  }

  /**
   * Convertit en minutes
   */
  static toMinutes(durationStr: string): number {
    return Math.floor(this.parse(durationStr) / 60);
  }
}
