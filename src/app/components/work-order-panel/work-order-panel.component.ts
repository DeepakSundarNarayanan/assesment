import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkOrder, WorkOrderStatus, WorkCenter } from '../../models/index';
import { WorkOrderService } from '../../services/work-order.service';

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-order-panel.component.html',
  styleUrls: ['./work-order-panel.component.scss'],
})
export class WorkOrderPanelComponent implements OnInit {
  @Input() workOrder: WorkOrder | null = null;
  @Input() workCenterId: string | null = null;
  @Input() prefillStartDate: Date | null = null;
  @Input() prefillEndDate: Date | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  form!: FormGroup;
  workCenters: WorkCenter[] = [];
  overlapError = false;

  statusOptions: WorkOrderStatus[] = ['Open', 'In progress', 'Complete', 'Blocked'];

  constructor(
    private fb: FormBuilder,
    private workOrderService: WorkOrderService,
  ) {}

  ngOnInit() {
    this.workCenters = this.workOrderService.getWorkCenters();
    this.form = this.fb.group({
      name: [this.workOrder?.name || '', Validators.required],
      workCenterId: [this.workOrder?.workCenterId || this.workCenterId || '', Validators.required],
      status: [this.workOrder?.status || 'Open', Validators.required],
      startDate: [
        this.formatDate(this.workOrder?.startDate || this.prefillStartDate),
        Validators.required,
      ],
      endDate: [
        this.formatDate(this.workOrder?.endDate || this.prefillEndDate),
        Validators.required,
      ],
    });
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  get isEdit(): boolean {
    return !!this.workOrder;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In progress':
        return 'status-inprogress';
      case 'Complete':
        return 'status-complete';
      case 'Blocked':
        return 'status-blocked';
      default:
        return '';
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const workOrder: WorkOrder = {
      id: this.workOrder?.id || this.workOrderService.generateId(),
      name: val.name,
      workCenterId: val.workCenterId,
      status: val.status,
      startDate: new Date(val.startDate),
      endDate: new Date(val.endDate),
    };

    const hasOverlap = this.workOrderService.hasOverlap(workOrder, this.workOrder?.id);
    if (hasOverlap) {
      this.overlapError = true;
      return;
    }

    this.overlapError = false;

    if (this.isEdit) {
      this.workOrderService.updateWorkOrder(workOrder);
    } else {
      this.workOrderService.addWorkOrder(workOrder);
    }

    this.save.emit();
  }

  onCancel() {
    this.close.emit();
  }
}
