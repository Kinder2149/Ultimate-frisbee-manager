import { TestBed } from '@angular/core/testing';
import { MobileFiltersService } from './mobile-filters.service';
import { ContentItem } from '../models/content-item.model';

describe('MobileFiltersService', () => {
  let service: MobileFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MobileFiltersService]
    });
    service = TestBed.inject(MobileFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should filter by category', () => {
    const items: ContentItem[] = [
      { id: '1', type: 'exercice', title: 'Ex1', createdAt: new Date(), originalData: {} as any },
      { id: '2', type: 'entrainement', title: 'En1', createdAt: new Date(), originalData: {} as any }
    ];

    const filtered = service.filterByCategory(items, 'exercice');
    expect(filtered.length).toBe(1);
    expect(filtered[0].type).toBe('exercice');
  });

  it('should filter by search query', () => {
    const items: ContentItem[] = [
      { id: '1', type: 'exercice', title: 'Passe courte', createdAt: new Date(), originalData: {} as any },
      { id: '2', type: 'exercice', title: 'Défense zone', createdAt: new Date(), originalData: {} as any }
    ];

    const filtered = service.filterBySearch(items, 'passe');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toContain('Passe');
  });

  it('should sort items by date (recent first)', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-02-01');
    const items: ContentItem[] = [
      { id: '1', type: 'exercice', title: 'Ex1', createdAt: date1, originalData: {} as any },
      { id: '2', type: 'exercice', title: 'Ex2', createdAt: date2, originalData: {} as any }
    ];

    const sorted = service.sortItems(items, 'recent');
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  it('should sort items by date (old first)', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-02-01');
    const items: ContentItem[] = [
      { id: '1', type: 'exercice', title: 'Ex1', createdAt: date1, originalData: {} as any },
      { id: '2', type: 'exercice', title: 'Ex2', createdAt: date2, originalData: {} as any }
    ];

    const sorted = service.sortItems(items, 'old');
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });
});
