import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TimelineComponent } from './timeline.component';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkCenter, WorkOrder } from '../../models';

const mockWorkCenters: WorkCenter[] = [
  { docId: 'wc1', docType: 'workCenter', data: { name: 'Center 1' } },
];

const mockWorkOrders: WorkOrder[] = [];

const mockService = {
  getWorkCenters: () => mockWorkCenters,
  getWorkOrders: () => mockWorkOrders,
  deleteWorkOrder: () => {},
};

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineComponent],
      providers: [{ provide: WorkOrderService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── colMinWidth ────────────────────────────────────────────────────────────

  describe('colMinWidth', () => {
    it('returns 60px for Hour', () => {
      component.timescale.set('Hour');
      expect(component.colMinWidth).toBe('60px');
    });

    it('returns 50px for Day', () => {
      component.timescale.set('Day');
      expect(component.colMinWidth).toBe('50px');
    });

    it('returns 80px for Week', () => {
      component.timescale.set('Week');
      expect(component.colMinWidth).toBe('80px');
    });

    it('returns 150px for Month', () => {
      component.timescale.set('Month');
      expect(component.colMinWidth).toBe('150px');
    });
  });

  // ── generateColumns() ──────────────────────────────────────────────────────

  describe('generateColumns()', () => {
    it('generates 13 columns for Month', () => {
      component.timescale.set('Month');
      component.generateColumns();
      expect(component.columns.length).toBe(13);
    });

    it('generates 17 columns for Week', () => {
      component.timescale.set('Week');
      component.generateColumns();
      expect(component.columns.length).toBe(17);
    });

    it('generates 29 columns for Day', () => {
      component.timescale.set('Day');
      component.generateColumns();
      expect(component.columns.length).toBe(29);
    });

    it('generates 48 columns for Hour', () => {
      component.timescale.set('Hour');
      component.generateColumns();
      expect(component.columns.length).toBe(48);
    });

    it('Month columns start 6 months before the current month', () => {
      component.timescale.set('Month');
      component.generateColumns();
      const now = new Date();
      const expected = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const first = component.columns[0].date;
      expect(first.getFullYear()).toBe(expected.getFullYear());
      expect(first.getMonth()).toBe(expected.getMonth());
    });

    it('Week columns start on a Monday', () => {
      component.timescale.set('Week');
      component.generateColumns();
      // Monday = getDay() === 1
      expect(component.columns[0].date.getDay()).toBe(1);
    });
  });

  // ── totalColumnsMinWidth ───────────────────────────────────────────────────

  describe('totalColumnsMinWidth', () => {
    it('returns 1950px for Month (13 × 150)', () => {
      component.timescale.set('Month');
      component.generateColumns();
      expect(component.totalColumnsMinWidth).toBe('1950px');
    });

    it('returns 1360px for Week (17 × 80)', () => {
      component.timescale.set('Week');
      component.generateColumns();
      expect(component.totalColumnsMinWidth).toBe('1360px');
    });

    it('returns 1450px for Day (29 × 50)', () => {
      component.timescale.set('Day');
      component.generateColumns();
      expect(component.totalColumnsMinWidth).toBe('1450px');
    });

    it('returns 2880px for Hour (48 × 60)', () => {
      component.timescale.set('Hour');
      component.generateColumns();
      expect(component.totalColumnsMinWidth).toBe('2880px');
    });
  });

  // ── isCurrentColumn() ──────────────────────────────────────────────────────

  describe('isCurrentColumn()', () => {
    it('returns true for the current month', () => {
      component.timescale.set('Month');
      const now = new Date();
      expect(component.isCurrentColumn(new Date(now.getFullYear(), now.getMonth(), 1))).toBe(true);
    });

    it('returns false for a past month', () => {
      component.timescale.set('Month');
      expect(component.isCurrentColumn(new Date(2020, 0, 1))).toBe(false);
    });

    it('returns true for today in Day mode', () => {
      component.timescale.set('Day');
      expect(component.isCurrentColumn(new Date())).toBe(true);
    });

    it('returns false for yesterday in Day mode', () => {
      component.timescale.set('Day');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(component.isCurrentColumn(yesterday)).toBe(false);
    });

    it('returns true for the current week in Week mode', () => {
      component.timescale.set('Week');
      const now = new Date();
      // Use the monday of the current week
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      expect(component.isCurrentColumn(monday)).toBe(true);
    });

    it('returns true for the current hour in Hour mode', () => {
      component.timescale.set('Hour');
      const now = new Date();
      const thisHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      expect(component.isCurrentColumn(thisHour)).toBe(true);
    });
  });

  // ── todayLineLeftAbsolute ──────────────────────────────────────────────────

  describe('todayLineLeftAbsolute', () => {
    it('returns a pixel value (not -1px) for Month', () => {
      component.timescale.set('Month');
      component.generateColumns();
      expect(component.todayLineLeftAbsolute).not.toBe('-1px');
    });

    it('is greater than 280px (past the work-center column) for Month', () => {
      component.timescale.set('Month');
      component.generateColumns();
      const px = parseFloat(component.todayLineLeftAbsolute);
      expect(px).toBeGreaterThan(280);
    });

    it('is within the total grid width for Month', () => {
      component.timescale.set('Month');
      component.generateColumns();
      const px = parseFloat(component.todayLineLeftAbsolute);
      const maxPx = 280 + 13 * 150; // 2230
      expect(px).toBeLessThan(maxPx);
    });

    it('returns -1px when today is out of range (Day mode — simulate)', () => {
      // Force columns to a range that excludes today
      component.timescale.set('Day');
      component.columns = [
        { label: 'Jan 1', date: new Date(2020, 0, 1) },
        { label: 'Jan 2', date: new Date(2020, 0, 2) },
      ];
      expect(component.todayLineLeftAbsolute).toBe('-1px');
    });
  });

  // ── getMondayOfWeek() ──────────────────────────────────────────────────────

  describe('getMondayOfWeek()', () => {
    it('returns Monday for a Wednesday input', () => {
      const wed = new Date(2026, 2, 4); // 4 Mar 2026 = Wednesday
      const mon = component.getMondayOfWeek(wed);
      expect(mon.getDay()).toBe(1);
      expect(mon.getDate()).toBe(2); // 2 Mar 2026 = Monday
    });

    it('returns the previous Monday for a Sunday input', () => {
      const sun = new Date(2026, 2, 8); // 8 Mar 2026 = Sunday
      const mon = component.getMondayOfWeek(sun);
      expect(mon.getDay()).toBe(1);
      expect(mon.getDate()).toBe(2);
    });

    it('returns itself when input is already Monday', () => {
      const monday = new Date(2026, 2, 2); // 2 Mar 2026 = Monday
      const result = component.getMondayOfWeek(monday);
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(2);
    });
  });

  // ── currentColumnLabel ─────────────────────────────────────────────────────

  describe('currentColumnLabel', () => {
    it('returns "Current month" for Month', () => {
      component.timescale.set('Month');
      expect(component.currentColumnLabel).toBe('Current month');
    });

    it('returns "Current week" for Week', () => {
      component.timescale.set('Week');
      expect(component.currentColumnLabel).toBe('Current week');
    });

    it('returns "Today" for Day', () => {
      component.timescale.set('Day');
      expect(component.currentColumnLabel).toBe('Today');
    });

    it('returns "Now" for Hour', () => {
      component.timescale.set('Hour');
      expect(component.currentColumnLabel).toBe('Now');
    });
  });

  // ── getWorkOrdersForCenter() ───────────────────────────────────────────────

  describe('getWorkOrdersForCenter()', () => {
    it('returns only work orders matching the given work center id', () => {
      component.workOrders = [
        { docId: 'wo1', docType: 'workOrder', data: { name: 'A', workCenterId: 'wc1', status: 'open', startDate: '2026-01-01', endDate: '2026-01-31' } },
        { docId: 'wo2', docType: 'workOrder', data: { name: 'B', workCenterId: 'wc2', status: 'open', startDate: '2026-01-01', endDate: '2026-01-31' } },
      ];
      expect(component.getWorkOrdersForCenter('wc1').length).toBe(1);
      expect(component.getWorkOrdersForCenter('wc1')[0].docId).toBe('wo1');
    });

    it('returns an empty array when no work orders match', () => {
      component.workOrders = [];
      expect(component.getWorkOrdersForCenter('wc99')).toEqual([]);
    });
  });
});
