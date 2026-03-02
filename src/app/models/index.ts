export type WorkOrderStatus = 'Open' | 'In progress' | 'Complete' | 'Blocked';
export type Timescale = 'Hour' | 'Day' | 'Week' | 'Month';

export interface WorkCenter {
  id: string;
  name: string;
}

export interface WorkOrder {
  id: string;
  name: string;
  workCenterId: string;
  status: WorkOrderStatus;
  startDate: Date;
  endDate: Date;
}