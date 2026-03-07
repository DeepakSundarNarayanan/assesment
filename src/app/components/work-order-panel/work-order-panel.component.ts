import { Component, Input, Output, EventEmitter, OnInit, signal, ViewChild, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDateStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrder, WorkOrderStatus, WorkCenter } from '../../models/index';
import { WorkOrderService } from '../../services/work-order.service';

function endAfterStart(group: AbstractControl): ValidationErrors | null {
  const start: NgbDateStruct | null = group.get('startDate')?.value;
  const end: NgbDateStruct | null = group.get('endDate')?.value;
  if (!start || !end) return null;
  const s = start.year * 10000 + start.month * 100 + start.day;
  const e = end.year * 10000 + end.month * 100 + end.day;
  return e >= s ? null : { endBeforeStart: true };
}

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgbDatepickerModule],
  templateUrl: './work-order-panel.component.html',
  styleUrls: ['./work-order-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderPanelComponent implements OnInit {
  @Input() workOrder: WorkOrder | null = null;
  @Input() workCenterId: string | null = null;
  @Input() prefillStartDate: Date | null = null;
  @Input() prefillEndDate: Date | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  @ViewChild('endPicker') private endPicker?: NgbDatepicker;
  @ViewChild('startPicker') private startPicker?: NgbDatepicker;

  form!: FormGroup;
  workCenters: WorkCenter[] = [];
  overlapError = false;
  isClosing = signal(false);
  showStartPicker = signal(false);
  showEndPicker = signal(false);
  endStartDate = signal<NgbDateStruct | undefined>(undefined);
  startStartDate = signal<NgbDateStruct | undefined>(undefined);

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
    }, { validators: endAfterStart });
  }

  get dateOrderError(): boolean {
    return !!this.form.errors?.['endBeforeStart'] &&
      (!!this.form.get('startDate')?.touched || !!this.form.get('endDate')?.touched);
  }

  dateToNgb(date: Date | null | undefined): NgbDateStruct | null {
    if (!date) return null;
    const d = new Date(date);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  ngbToIso(ngb: NgbDateStruct): string {
    return `${ngb.year}-${String(ngb.month).padStart(2, '0')}-${String(ngb.day).padStart(2, '0')}`;
  }

  formatNgbDate(date: NgbDateStruct | null): string {
    if (!date) return '';
    return (
      String(date.month).padStart(2, '0') +
      '.' +
      String(date.day).padStart(2, '0') +
      '.' +
      date.year
    );
  }

  toggleStartPicker() {
    this.showStartPicker.update(v => !v);
    if (this.showStartPicker()) {
      this.showEndPicker.set(false);
      const val = this.form.get('startDate')?.value as NgbDateStruct | null;
      this.startStartDate.set(val ?? this.dateToNgb(new Date()) ?? undefined);
    }
  }

  toggleEndPicker() {
    this.showEndPicker.update(v => !v);
    if (this.showEndPicker()) {
      this.showStartPicker.set(false);
      const val = this.form.get('endDate')?.value as NgbDateStruct | null;
      this.endStartDate.set(val ?? this.dateToNgb(new Date()) ?? undefined);
    }
  }

  prevMonth(picker: 'end' | 'start') {
    const [dateSig, ref] = picker === 'end'
      ? [this.endStartDate, this.endPicker]
      : [this.startStartDate, this.startPicker];
    const current = dateSig();
    if (!current) return;
    const newMonth: NgbDateStruct = current.month === 1
      ? { year: current.year - 1, month: 12, day: 1 }
      : { year: current.year, month: current.month - 1, day: 1 };
    dateSig.set(newMonth);
    ref?.navigateTo(newMonth);
  }

  nextMonth(picker: 'end' | 'start') {
    const [dateSig, ref] = picker === 'end'
      ? [this.endStartDate, this.endPicker]
      : [this.startStartDate, this.startPicker];
    const current = dateSig();
    if (!current) return;
    const newMonth: NgbDateStruct = current.month === 12
      ? { year: current.year + 1, month: 1, day: 1 }
      : { year: current.year, month: current.month + 1, day: 1 };
    dateSig.set(newMonth);
    ref?.navigateTo(newMonth);
  }

  onDateSelect(field: 'startDate' | 'endDate', date: NgbDateStruct) {
    this.form.get(field)?.setValue(date);
    this.form.get(field)?.markAsTouched();
    if (field === 'startDate') this.showStartPicker.set(false);
    if (field === 'endDate') this.showEndPicker.set(false);
  }

  get isEdit(): boolean {
    return !!this.workOrder;
  }

  private closeWithAnimation(emitFn: () => void) {
    if (this.isClosing()) return;
    this.isClosing.set(true);
    setTimeout(() => emitFn(), 250);
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

    this.closeWithAnimation(() => this.save.emit());
  }

  onCancel() {
    this.closeWithAnimation(() => this.close.emit());
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.onCancel();
  }
}
