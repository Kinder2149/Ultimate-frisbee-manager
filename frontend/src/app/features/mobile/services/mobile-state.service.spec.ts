import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MobileStateService } from './mobile-state.service';
import { MobileDataService } from './mobile-data.service';
import { MobileFiltersService } from './mobile-filters.service';

describe('MobileStateService', () => {
  let service: MobileStateService;
  let dataServiceSpy: jasmine.SpyObj<MobileDataService>;
  let filtersServiceSpy: jasmine.SpyObj<MobileFiltersService>;

  beforeEach(() => {
    const dataSpy = jasmine.createSpyObj('MobileDataService', ['getAllContent', 'getContentById']);
    const filtersSpy = jasmine.createSpyObj('MobileFiltersService', ['applyAllFilters']);

    TestBed.configureTestingModule({
      providers: [
        MobileStateService,
        { provide: MobileDataService, useValue: dataSpy },
        { provide: MobileFiltersService, useValue: filtersSpy }
      ]
    });

    service = TestBed.inject(MobileStateService);
    dataServiceSpy = TestBed.inject(MobileDataService) as jasmine.SpyObj<MobileDataService>;
    filtersServiceSpy = TestBed.inject(MobileFiltersService) as jasmine.SpyObj<MobileFiltersService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load content and update items signal', (done) => {
    const mockItems = [
      { id: '1', type: 'exercice' as const, title: 'Ex1', createdAt: new Date(), originalData: {} as any }
    ];
    dataServiceSpy.getAllContent.and.returnValue(of(mockItems));
    filtersServiceSpy.applyAllFilters.and.returnValue(mockItems);

    service.loadAllContent();

    setTimeout(() => {
      expect(service.items().length).toBe(1);
      expect(service.loading()).toBe(false);
      done();
    }, 100);
  });

  it('should update active category', () => {
    service.setCategory('exercice');
    expect(service.activeCategory()).toBe('exercice');
  });

  it('should update search query', () => {
    service.setSearchQuery('test');
    expect(service.searchQuery()).toBe('test');
  });

  it('should update sort order', () => {
    service.setSortOrder('old');
    expect(service.sortOrder()).toBe('old');
  });

  it('should toggle terrain mode', () => {
    const initialMode = service.terrainMode();
    service.toggleTerrainMode();
    expect(service.terrainMode()).toBe(!initialMode);
  });
});
