import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrder } from '../../models/index';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-order-bar.component.html',
  styleUrls: ['./work-order-bar.component.scss']
})
export class WorkOrderBarComponent {
  @Input() workOrder!: WorkOrder;
  @Input() columns: { label: string; date: Date }[] = [];
  @Output() edit = new EventEmitter<WorkOrder>();
  @Output() delete = new EventEmitter<string>();

  showMenu = signal(false);

  constructor(private elRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showMenu.set(false);
    }
  }

  get barStyle(): { [key: string]: string } {
    if (!this.columns.length) return {};

    const firstCol = this.columns[0].date;
    const lastCol = this.columns[this.columns.length - 1].date;

    const totalStart = firstCol.getTime();
    const totalEnd = new Date(lastCol.getFullYear(), lastCol.getMonth() + 1, 1).getTime();
    const totalDuration = totalEnd - totalStart;

    const startTime = Math.max(this.workOrder.startDate.getTime(), totalStart);
    const endTime = Math.min(this.workOrder.endDate.getTime(), totalEnd);

    const leftPercent = ((startTime - totalStart) / totalDuration) * 100;
    const widthPercent = ((endTime - startTime) / totalDuration) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  }

  get statusClass(): string {
    switch (this.workOrder.status) {
      case 'Open': return 'status-open';
      case 'In progress': return 'status-inprogress';
      case 'Complete': return 'status-complete';
      case 'Blocked': return 'status-blocked';
      default: return '';
    }
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu.update(v => !v);
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu.set(false);
    this.edit.emit(this.workOrder);
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu.set(false);
    this.delete.emit(this.workOrder.id);
  }
}