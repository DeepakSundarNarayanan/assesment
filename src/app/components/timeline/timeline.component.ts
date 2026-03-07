import { Component, signal, OnInit, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkCenter, WorkOrder, Timescale } from '../../models';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';
import { WorkOrderPanelComponent } from '../work-order-panel/work-order-panel.component';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent, WorkOrderPanelComponent],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent implements OnInit {
  workCenters: WorkCenter[] = [];
  workOrders: WorkOrder[] = [];

  timescale = signal<Timescale>('Month');
  timescaleOptions: Timescale[] = ['Hour', 'Day', 'Week', 'Month'];
  showTimescaleDropdown = signal(false);

  columns: { label: string; date: Date }[] = [];

  isPanelOpen = signal(false);
  selectedWorkOrder = signal<WorkOrder | null>(null);
  selectedWorkCenterId = signal<string | null>(null);
  prefillStartDate = signal<Date | null>(null);
  prefillEndDate = signal<Date | null>(null);

  constructor(
    private workOrderService: WorkOrderService,
    private elRef: ElementRef,
  ) {}

  ngOnInit() {
    this.loadData();
    this.generateColumns();
  }

  loadData() {
    this.workCenters = this.workOrderService.getWorkCenters();
    this.workOrders = this.workOrderService.getWorkOrders();
  }

  getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  generateColumns() {
    this.columns = [];
    const now = new Date();
    const ts = this.timescale();

    if (ts === 'Month') {
      // ±6 months = 13 columns total
      const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      for (let i = 0; i < 13; i++) {
        const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
        this.columns.push({
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          date,
        });
      }
    } else if (ts === 'Week') {
      // ±2 months ≈ ±8 weeks = 17 columns total
      const monday = this.getMondayOfWeek(now);
      const start = new Date(monday.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
      for (let i = 0; i < 17; i++) {
        const date = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        this.columns.push({
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date,
        });
      }
    } else if (ts === 'Day') {
      // ±2 weeks = 29 columns total
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
      for (let i = 0; i < 29; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        this.columns.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
          date,
        });
      }
    } else {
      // Hour: show 48 hours centred on now (24h back, 24h forward)
      const startHour = new Date(now);
      startHour.setMinutes(0, 0, 0);
      startHour.setHours(startHour.getHours() - 24);
      for (let i = 0; i < 48; i++) {
        const date = new Date(startHour.getTime() + i * 60 * 60 * 1000);
        this.columns.push({
          label: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          date,
        });
      }
    }
  }

  isCurrentColumn(date: Date): boolean {
    const now = new Date();
    const ts = this.timescale();

    if (ts === 'Month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } else if (ts === 'Week') {
      return this.getMondayOfWeek(now).getTime() === this.getMondayOfWeek(date).getTime();
    } else if (ts === 'Day') {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    } else {
      // Hour: highlight the current hour column
      return (
        date.getHours() === now.getHours() &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
  }

  get currentColumnLabel(): string {
    switch (this.timescale()) {
      case 'Month': return 'Current month';
      case 'Week':  return 'Current week';
      case 'Day':   return 'Today';
      case 'Hour':  return 'Now';
      default:      return '';
    }
  }

  get todayLineLeft(): string {
    if (!this.columns.length) return '-1px';

    const firstCol = this.columns[0].date;
    const lastCol = this.columns[this.columns.length - 1].date;
    const totalStart = firstCol.getTime();

    let totalEnd: number;
    if (this.timescale() === 'Month') {
      totalEnd = new Date(lastCol.getFullYear(), lastCol.getMonth() + 1, 1).getTime();
    } else if (this.timescale() === 'Week') {
      totalEnd = lastCol.getTime() + 7 * 24 * 60 * 60 * 1000;
    } else if (this.timescale() === 'Hour') {
      totalEnd = lastCol.getTime() + 60 * 60 * 1000;
    } else {
      totalEnd = lastCol.getTime() + 24 * 60 * 60 * 1000;
    }

    const todayTime = new Date().getTime();
    if (todayTime < totalStart || todayTime > totalEnd) return '-1px';

    const leftPercent = ((todayTime - totalStart) / (totalEnd - totalStart)) * 100;
    return `${leftPercent}%`;
  }

  // Left position of the today line in pixels (work-center column + offset into month columns)
  get todayLineLeftAbsolute(): string {
    const left = this.todayLineLeft;
    if (left === '-1px') return '-1px';
    const pct = parseFloat(left);
    const colsWidth = parseInt(this.colMinWidth, 10) * this.columns.length;
    const px = 300 + (pct / 100) * colsWidth;
    return `${px.toFixed(2)}px`;
  }

  get colMinWidth(): string {
    switch (this.timescale()) {
      case 'Hour': return '60px';
      case 'Day':  return '50px';
      case 'Week': return '80px';
      default:     return '120px';
    }
  }

  get totalColumnsMinWidth(): string {
    const colW = parseInt(this.colMinWidth, 10);
    return `${this.columns.length * colW}px`;
  }

  getWorkOrdersForCenter(workCenterId: string): WorkOrder[] {
    return this.workOrders.filter((wo) => wo.data.workCenterId === workCenterId);
  }

  selectTimescale(t: Timescale) {
    this.timescale.set(t);
    this.showTimescaleDropdown.set(false);
    this.generateColumns();
  }

  toggleTimescaleDropdown() {
    this.showTimescaleDropdown.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.querySelector('.timescale-dropdown')?.contains(event.target)) {
      this.showTimescaleDropdown.set(false);
    }
  }

  onCellClick(workCenterId: string, colDate: Date) {
    if (this.isPanelOpen()) return;

    const startDate = new Date(colDate);
    const endDate = new Date(colDate);
    endDate.setDate(endDate.getDate() + 7);

    this.selectedWorkCenterId.set(workCenterId);
    this.prefillStartDate.set(startDate);
    this.prefillEndDate.set(endDate);
    this.selectedWorkOrder.set(null);
    this.isPanelOpen.set(true);
  }

  onEditWorkOrder(wo: WorkOrder) {
    this.selectedWorkOrder.set(wo);
    this.selectedWorkCenterId.set(wo.data.workCenterId);
    this.prefillStartDate.set(null);
    this.prefillEndDate.set(null);
    this.isPanelOpen.set(true);
  }

  onDeleteWorkOrder(id: string) {
    this.workOrderService.deleteWorkOrder(id);
    this.loadData();
  }

  onPanelClose() {
    this.isPanelOpen.set(false);
    this.selectedWorkOrder.set(null);
  }

  onPanelSave() {
    this.isPanelOpen.set(false);
    this.selectedWorkOrder.set(null);
    this.loadData();
  }

  trackByColumn(_: number, col: { label: string; date: Date }) { return col.date.getTime(); }
  trackByWorkCenter(_: number, wc: WorkCenter) { return wc.docId; }
  trackByWorkOrder(_: number, wo: WorkOrder) { return wo.docId; }
  trackByTimescale(_: number, t: Timescale) { return t; }
}
