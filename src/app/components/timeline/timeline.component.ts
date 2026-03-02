import { Component, computed, signal, OnInit, HostListener, ElementRef } from '@angular/core';
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

  // ...existing code...
  generateColumns() {
    this.columns = [];
    const now = new Date();
    // Start 4 months before current month
    const start = new Date(now.getFullYear(), now.getMonth() - 4, 1);
    const count = 12;

    for (let i = 0; i < count; i++) {
      const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
      this.columns.push({
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date,
      });
    }
  }

  isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  // ...existing code...

  getWorkOrdersForCenter(workCenterId: string): WorkOrder[] {
    return this.workOrders.filter((wo) => wo.workCenterId === workCenterId);
  }

  selectTimescale(t: Timescale) {
    this.timescale.set(t);
    this.showTimescaleDropdown.set(false);
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
    const endDate = new Date(colDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    this.selectedWorkCenterId.set(workCenterId);
    this.prefillStartDate.set(colDate);
    this.prefillEndDate.set(endDate);
    this.selectedWorkOrder.set(null);
    this.isPanelOpen.set(true);
  }

  onEditWorkOrder(wo: WorkOrder) {
    this.selectedWorkOrder.set(wo);
    this.selectedWorkCenterId.set(wo.workCenterId);
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
}