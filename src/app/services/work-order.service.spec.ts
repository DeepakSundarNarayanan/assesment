import { TestBed } from '@angular/core/testing';
import { WorkOrderService } from './work-order.service';
import { WorkOrder } from '../models/index';

function makeWO(overrides: Partial<WorkOrder['data']> & { docId?: string } = {}): WorkOrder {
  return {
    docId: overrides.docId ?? 'test-id',
    docType: 'workOrder',
    data: {
      name: overrides.name ?? 'Test WO',
      workCenterId: overrides.workCenterId ?? 'wc_test',
      status: overrides.status ?? 'open',
      startDate: overrides.startDate ?? '2026-01-01',
      endDate: overrides.endDate ?? '2026-01-31',
    },
  };
}

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getWorkCenters() returns 7 work centers', () => {
    expect(service.getWorkCenters().length).toBe(7);
  });

  it('getWorkOrders() falls back to seed data when localStorage is empty', () => {
    expect(service.getWorkOrders().length).toBeGreaterThan(0);
  });

  it('generateId() returns a string starting with "wo_"', () => {
    expect(service.generateId()).toMatch(/^wo_/);
  });

  describe('addWorkOrder()', () => {
    it('increases the work order count by 1', () => {
      const before = service.getWorkOrders().length;
      service.addWorkOrder(makeWO({ docId: 'add-1' }));
      expect(service.getWorkOrders().length).toBe(before + 1);
    });

    it('persists the new work order', () => {
      service.addWorkOrder(makeWO({ docId: 'add-2', name: 'Persisted WO' }));
      const found = service.getWorkOrders().find((w) => w.docId === 'add-2');
      expect(found?.data.name).toBe('Persisted WO');
    });

    it('saves to localStorage', () => {
      service.addWorkOrder(makeWO({ docId: 'add-3' }));
      const stored = JSON.parse(localStorage.getItem('work-orders') || '[]') as WorkOrder[];
      expect(stored.some((w) => w.docId === 'add-3')).toBe(true);
    });
  });

  describe('updateWorkOrder()', () => {
    it('updates the name of an existing work order', () => {
      const original = service.getWorkOrders()[0];
      service.updateWorkOrder({ ...original, data: { ...original.data, name: 'Updated' } });
      const updated = service.getWorkOrders().find((w) => w.docId === original.docId);
      expect(updated?.data.name).toBe('Updated');
    });

    it('does not change the total count', () => {
      const original = service.getWorkOrders()[0];
      const before = service.getWorkOrders().length;
      service.updateWorkOrder({ ...original, data: { ...original.data, name: 'X' } });
      expect(service.getWorkOrders().length).toBe(before);
    });
  });

  describe('deleteWorkOrder()', () => {
    it('removes the work order by id', () => {
      const target = service.getWorkOrders()[0];
      service.deleteWorkOrder(target.docId);
      expect(service.getWorkOrders().find((w) => w.docId === target.docId)).toBeUndefined();
    });

    it('decreases the count by 1', () => {
      const before = service.getWorkOrders().length;
      service.deleteWorkOrder(service.getWorkOrders()[0].docId);
      expect(service.getWorkOrders().length).toBe(before - 1);
    });
  });

  describe('hasOverlap()', () => {
    // Uses 'wc_overlap' — no seed data for this center, so tests are isolated
    beforeEach(() => {
      service.addWorkOrder(
        makeWO({ docId: 'base', workCenterId: 'wc_overlap', startDate: '2026-03-01', endDate: '2026-03-31' }),
      );
    });

    it('detects overlapping date ranges', () => {
      const wo = makeWO({ workCenterId: 'wc_overlap', startDate: '2026-03-15', endDate: '2026-04-15' });
      expect(service.hasOverlap(wo)).toBe(true);
    });

    it('detects fully contained date ranges', () => {
      const wo = makeWO({ workCenterId: 'wc_overlap', startDate: '2026-03-05', endDate: '2026-03-20' });
      expect(service.hasOverlap(wo)).toBe(true);
    });

    it('does not flag adjacent (non-overlapping) ranges', () => {
      const wo = makeWO({ workCenterId: 'wc_overlap', startDate: '2026-04-01', endDate: '2026-04-30' });
      expect(service.hasOverlap(wo)).toBe(false);
    });

    it('does not flag a different work center', () => {
      const wo = makeWO({ workCenterId: 'wc_other', startDate: '2026-03-15', endDate: '2026-03-20' });
      expect(service.hasOverlap(wo)).toBe(false);
    });

    it('excludes the work order itself when checking for update', () => {
      const wo = makeWO({ docId: 'base', workCenterId: 'wc_overlap', startDate: '2026-03-10', endDate: '2026-03-20' });
      expect(service.hasOverlap(wo, 'base')).toBe(false);
    });
  });
});
