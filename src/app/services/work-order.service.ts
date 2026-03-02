import { Injectable, signal } from '@angular/core';
import { WorkOrder, WorkCenter } from '../models/index';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private workCenters = signal<WorkCenter[]>([
    { id: 'wc1', name: 'Genesis Hardware' },
    { id: 'wc2', name: 'Rodriques Electrics' },
    { id: 'wc3', name: 'Konsulting Inc' },
    { id: 'wc4', name: 'McMarrow Distribution' },
    { id: 'wc5', name: 'Spartan Manufacturing' },
  ]);

  private workOrders = signal<WorkOrder[]>([
    {
      id: 'wo1',
      name: 'Centrix Ltd',
      workCenterId: 'wc1',
      status: 'Complete',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-12-15'),
    },
    {
      id: 'wo2',
      name: 'Genesis Hardware',
      workCenterId: 'wc1',
      status: 'In progress',
      startDate: new Date('2025-12-16'),
      endDate: new Date('2026-02-28'),
    },
    {
      id: 'wo3',
      name: 'Rodriques Electrics',
      workCenterId: 'wc2',
      status: 'In progress',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-31'),
    },
    {
      id: 'wo4',
      name: 'Konsulting Inc',
      workCenterId: 'wc3',
      status: 'In progress',
      startDate: new Date('2025-11-15'),
      endDate: new Date('2026-01-15'),
    },
    {
      id: 'wo5',
      name: 'Compleks Systems',
      workCenterId: 'wc3',
      status: 'In progress',
      startDate: new Date('2026-01-16'),
      endDate: new Date('2026-04-30'),
    },
    {
      id: 'wo6',
      name: 'McMarrow Distribution',
      workCenterId: 'wc4',
      status: 'Blocked',
      startDate: new Date('2025-12-10'),
      endDate: new Date('2026-02-20'),
    },
    {
      id: 'wo7',
      name: 'Spartan Manufacturing',
      workCenterId: 'wc5',
      status: 'Open',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-02-28'),
    },
    {
      id: 'wo8',
      name: 'Spartan Systems',
      workCenterId: 'wc5',
      status: 'In progress',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-05-31'),
    },
  ]);

  getWorkCenters(): WorkCenter[] {
    return this.workCenters();
  }

  getWorkOrders(): WorkOrder[] {
    return this.workOrders();
  }

  getWorkOrdersForCenter(workCenterId: string): WorkOrder[] {
    return this.workOrders().filter((wo) => wo.workCenterId === workCenterId);
  }

  addWorkOrder(workOrder: WorkOrder): void {
    this.workOrders.update((orders) => [...orders, workOrder]);
  }

  updateWorkOrder(workOrder: WorkOrder): void {
    this.workOrders.update((orders) =>
      orders.map((wo) => (wo.id === workOrder.id ? workOrder : wo)),
    );
  }

  deleteWorkOrder(id: string): void {
    this.workOrders.update((orders) => orders.filter((wo) => wo.id !== id));
  }

  hasOverlap(workOrder: WorkOrder, excludeId?: string): boolean {
    return this.workOrders()
      .filter((wo) => wo.workCenterId === workOrder.workCenterId && wo.id !== excludeId)
      .some((wo) => workOrder.startDate < wo.endDate && workOrder.endDate > wo.startDate);
  }

  generateId(): string {
    return 'wo_' + Math.random().toString(36).substr(2, 9);
  }
}
