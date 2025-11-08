import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataTransferService, TransferType } from './data-transfer.service';
import { ImportService } from './import.service';
import { ApiUrlService } from './api-url.service';

class ApiUrlServiceMock {
  base = 'http://localhost:3000/api';
  getUrl(endpoint: string) {
    const clean = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.base}/${clean}`;
  }
}

class ImportServiceStub {
  dryRunFromMarkdown = jasmine.createSpy('dryRunFromMarkdown');
  applyFromMarkdown = jasmine.createSpy('applyFromMarkdown');
  importExercices = jasmine.createSpy('importExercices');
  importEntrainements = jasmine.createSpy('importEntrainements');
  importEchauffements = jasmine.createSpy('importEchauffements');
  importSituations = jasmine.createSpy('importSituations');
}

describe('DataTransferService', () => {
  let service: DataTransferService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataTransferService,
        { provide: ApiUrlService, useClass: ApiUrlServiceMock },
        { provide: ImportService, useClass: ImportServiceStub }
      ]
    });

  it('dryRunPayload doit retourner un résultat combiné pour les clés présentes', (done) => {
    const imp = TestBed.inject(ImportService) as unknown as ImportServiceStub;
    // Préparer retours observables
    const ok = (val: any) => ({ subscribe: (o: any) => o.next(val) });
    imp.importExercices.and.returnValue(ok({ type: 'exercices', totals: { input: 1 } }) as any);
    imp.importEntrainements.and.returnValue(ok({ type: 'entrainements', totals: { input: 1 } }) as any);
    imp.importEchauffements.and.returnValue(ok({ type: 'echauffements', totals: { input: 2 } }) as any);

    const payload = {
      exercices: [{ nom: 'A', description: '...' }],
      entrainements: [{ titre: 'Séance' }],
      echauffements: [{ nom: 'WU1' }, { nom: 'WU2' }]
    };

    service.dryRunPayload(payload).subscribe((res) => {
      // Vérifier structure combinée minimale
      expect(res && res.dryRun).toBe(true as any);
      expect(res && res.results && res.results.exercices).toBeDefined();
      expect(res && res.results && res.results.entrainements).toBeDefined();
      expect(res && res.results && res.results.echauffements).toBeDefined();
      done();
    });
  });
    service = TestBed.inject(DataTransferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('exportElement doit appeler /api/admin/export-ufm et retourner le nom de fichier', (done) => {
    const type: TransferType = 'exercice';
    const id = '11111111-1111-4111-8111-111111111111';

    // Espionner URL APIs du navigateur
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL').and.callFake(() => {});
    // Eviter erreurs de DOM
    spyOn(document.body as any, 'appendChild').and.callFake(() => {});
    spyOn(document.body as any, 'removeChild').and.callFake(() => {});

    service.exportElement(type, id).subscribe((filename) => {
      expect(filename).toMatch(/\.ufm\.json$/);
      expect(filename).toContain(type);
      done();
    });

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:3000/api/admin/export-ufm' && r.params.get('type') === type && r.params.get('id') === id);
    expect(req.request.method).toBe('GET' as any);

    const blob = new Blob([JSON.stringify({ version: '1.0', type, data: {} })], { type: 'application/json' });
    req.flush(blob, { headers: { 'Content-Disposition': `attachment; filename="${type}-${id}.ufm.json"` } as any });
  });
});
