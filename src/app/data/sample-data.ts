import { WorkCenter, WorkOrder } from '../models';

export const WORK_CENTERS: WorkCenter[] = [
  { id: 'wc1', name: 'Genesis Hardware' },
  { id: 'wc2', name: 'Rodriques Electrics' },
  { id: 'wc3', name: 'Konsulting Inc' },
  { id: 'wc4', name: 'McMarrow Distribution' },
  { id: 'wc5', name: 'Spartan Manufacturing' }
];

export const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1',
    name: 'Centrix Ltd',
    workCenterId: 'wc1',
    status: 'Complete',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-09-30')
  },
  {
    id: 'wo2',
    name: 'Rodriques Electrics',
    workCenterId: 'wc2',
    status: 'In progress',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-11-30')
  },
  {
    id: 'wo3',
    name: 'Konsulting Inc',
    workCenterId: 'wc3',
    status: 'In progress',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-10-31')
  },
  {
    id: 'wo4',
    name: 'Compleks Systems',
    workCenterId: 'wc3',
    status: 'In progress',
    startDate: new Date('2024-11-01'),
    endDate: new Date('2025-01-31')
  },
  {
    id: 'wo5',
    name: 'McMarrow Distribution',
    workCenterId: 'wc4',
    status: 'Blocked',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-01-15')
  },
  {
    id: 'wo6',
    name: 'Spartan Manufacturing',
    workCenterId: 'wc5',
    status: 'Open',
    startDate: new Date('2024-11-01'),
    endDate: new Date('2025-02-28')
  },
  {
    id: 'wo7',
    name: 'Genesis Hardware',
    workCenterId: 'wc1',
    status: 'In progress',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31')
  },
  {
    id: 'wo8',
    name: 'Spartan Systems',
    workCenterId: 'wc5',
    status: 'In progress',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-31')
  }
];