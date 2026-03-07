export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';
export type Timescale = 'Hour' | 'Day' | 'Week' | 'Month';

export interface WorkCenter {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

export interface WorkOrder {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string; // ISO format YYYY-MM-DD
    endDate: string;   // ISO format YYYY-MM-DD
  };
}
