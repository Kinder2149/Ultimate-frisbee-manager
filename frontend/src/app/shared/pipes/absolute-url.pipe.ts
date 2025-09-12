import { Pipe, PipeTransform } from '@angular/core';
import { ApiUrlService } from '../../core/services/api-url.service';

@Pipe({
  name: 'absoluteUrl',
  standalone: true
})
export class AbsoluteUrlPipe implements PipeTransform {

  constructor(private apiUrlService: ApiUrlService) {}

  transform(value: string | null | undefined): string {
    return this.apiUrlService.getMediaUrl(value) || '';
  }
}
