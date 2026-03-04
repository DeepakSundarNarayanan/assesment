import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  HostListener,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrder, Timescale } from '../../models/index';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-order-bar.component.html',
  styleUrls: ['./work-order-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderBarComponent {
  @Input() workOrder!: WorkOrder;
  @Input() columns: { label: string; date: Date }[] = [];
  @Input() timescale: Timescale = 'Month';
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

    // Calculate end of last column based on zoom level
    let totalEnd: number;
    if (this.timescale === 'Month') {
      totalEnd = new Date(lastCol.getFullYear(), lastCol.getMonth() + 1, 1).getTime();
    } else if (this.timescale === 'Week') {
      totalEnd = lastCol.getTime() + 7 * 24 * 60 * 60 * 1000;
    } else {
      totalEnd = lastCol.getTime() + 24 * 60 * 60 * 1000;
    }

    const totalDuration = totalEnd - totalStart;
    const startTime = Math.max(new Date(this.workOrder.data.startDate).getTime(), totalStart);
    const endTime = Math.min(new Date(this.workOrder.data.endDate).getTime(), totalEnd);

    if (endTime <= startTime) return { display: 'none' };

    const leftPercent = ((startTime - totalStart) / totalDuration) * 100;
    const widthPercent = ((endTime - startTime) / totalDuration) * 100;

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  }

  get statusClass(): string {
    switch (this.workOrder.data.status) {
      case 'open':
        return 'status-open';
      case 'in-progress':
        return 'status-inprogress';
      case 'complete':
        return 'status-complete';
      case 'blocked':
        return 'status-blocked';
      default:
        return '';
    }
  }

  get formattedDateRange(): string {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(this.workOrder.data.startDate)} – ${fmt(this.workOrder.data.endDate)}`;
  }

  get statusLabel(): string {
    switch (this.workOrder.data.status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In progress';
      case 'complete':
        return 'Complete';
      case 'blocked':
        return 'Blocked';
      default:
        return '';
    }
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu.update((v) => !v);
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu.set(false);
    this.edit.emit(this.workOrder);
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu.set(false);
    this.delete.emit(this.workOrder.docId);
  }
}
