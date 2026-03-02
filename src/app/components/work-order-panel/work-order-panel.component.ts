import { Component, Input, Output, EventEmitter, OnInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  NgbDatepickerModule,
  NgbDateStruct,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import { WorkOrder, WorkOrderStatus, WorkCenter } from '../../models/index';
import { WorkOrderService } from '../../services/work-order.service';

// Custom formatter: displays dates as DD.MM.YYYY
@Injectable()
export class DotDateFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (!value) return null;
    const parts = value.trim().split('.');
    if (parts.length !== 3) return null;
    return { day: +parts[0], month: +parts[1], year: +parts[2] };
  }
  format(date: NgbDateStruct | null): string {
    if (!date) return '';
    return (
      String(date.day).padStart(2, '0') +
      '.' +
      String(date.month).padStart(2, '0') +
      '.' +
      date.year
    );
  }
}

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, NgbDatepickerModule],
  providers: [{ provide: NgbDateParserFormatter, useClass: DotDateFormatter }],
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

  // Objects so ng-select can show "In progress" while storing 'in-progress'
  statusOptions: { value: WorkOrderStatus; label: string }[] = [
    { value: 'open',        label: 'Open' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'complete',    label: 'Complete' },
    { value: 'blocked',     label: 'Blocked' },
  ];

  constructor(
    private fb: FormBuilder,
    private workOrderService: WorkOrderService,
  ) {}

  ngOnInit() {
    this.workCenters = this.workOrderService.getWorkCenters();
    this.form = this.fb.group({
      name: [this.workOrder?.data.name || '', Validators.required],
      workCenterId: [this.workOrder?.data.workCenterId || this.workCenterId || '', Validators.required],
      status: [this.workOrder?.data.status || 'open', Validators.required],
      startDate: [
        this.dateToNgb(
          this.workOrder ? new Date(this.workOrder.data.startDate) : this.prefillStartDate
        ),
        Validators.required,
      ],
      endDate: [
        this.dateToNgb(
          this.workOrder ? new Date(this.workOrder.data.endDate) : this.prefillEndDate
        ),
        Validators.required,
      ],
    });
  }

  // Convert JS Date → NgbDateStruct { year, month, day }
  dateToNgb(date: Date | null | undefined): NgbDateStruct | null {
    if (!date) return null;
    const d = new Date(date);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  // Convert NgbDateStruct → ISO string YYYY-MM-DD
  ngbToIso(ngb: NgbDateStruct): string {
    return `${ngb.year}-${String(ngb.month).padStart(2, '0')}-${String(ngb.day).padStart(2, '0')}`;
  }

  get isEdit(): boolean {
    return !!this.workOrder;
  }

  getStatusClass(status: WorkOrderStatus | null): string {
    switch (status) {
      case 'open':        return 'status-open';
      case 'in-progress': return 'status-inprogress';
      case 'complete':    return 'status-complete';
      case 'blocked':     return 'status-blocked';
      default:            return '';
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const workOrder: WorkOrder = {
      docId: this.workOrder?.docId || this.workOrderService.generateId(),
      docType: 'workOrder',
      data: {
        name: val.name,
        workCenterId: val.workCenterId,
        status: val.status,
        startDate: this.ngbToIso(val.startDate),
        endDate: this.ngbToIso(val.endDate),
      },
    };

    const hasOverlap = this.workOrderService.hasOverlap(workOrder, this.workOrder?.docId);
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
