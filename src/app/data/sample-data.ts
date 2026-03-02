import { WorkCenter, WorkOrder } from '../models';

export const WORK_CENTERS: WorkCenter[] = [
  { docId: 'wc1', docType: 'workCenter', data: { name: 'Genesis Hardware' } },
  { docId: 'wc2', docType: 'workCenter', data: { name: 'Rodriques Electrics' } },
  { docId: 'wc3', docType: 'workCenter', data: { name: 'Konsulting Inc' } },
  { docId: 'wc4', docType: 'workCenter', data: { name: 'McMarrow Distribution' } },
  { docId: 'wc5', docType: 'workCenter', data: { name: 'Spartan Manufacturing' } },
];

export const WORK_ORDERS: WorkOrder[] = [
  {
    docId: 'wo1', docType: 'workOrder',
    data: { name: 'Centrix Ltd', workCenterId: 'wc1', status: 'complete', startDate: '2025-11-01', endDate: '2025-12-15' },
  },
  {
    docId: 'wo2', docType: 'workOrder',
    data: { name: 'Genesis Hardware', workCenterId: 'wc1', status: 'in-progress', startDate: '2025-12-16', endDate: '2026-02-28' },
  },
  {
    docId: 'wo3', docType: 'workOrder',
    data: { name: 'Rodriques Electrics', workCenterId: 'wc2', status: 'in-progress', startDate: '2025-12-01', endDate: '2026-01-31' },
  },
  {
    docId: 'wo4', docType: 'workOrder',
    data: { name: 'Konsulting Inc', workCenterId: 'wc3', status: 'in-progress', startDate: '2025-11-15', endDate: '2026-01-15' },
  },
  {
    docId: 'wo5', docType: 'workOrder',
    data: { name: 'Compleks Systems', workCenterId: 'wc3', status: 'in-progress', startDate: '2026-01-16', endDate: '2026-04-30' },
  },
  {
    docId: 'wo6', docType: 'workOrder',
    data: { name: 'McMarrow Distribution', workCenterId: 'wc4', status: 'blocked', startDate: '2025-12-10', endDate: '2026-02-20' },
  },
  {
    docId: 'wo7', docType: 'workOrder',
    data: { name: 'Spartan Manufacturing', workCenterId: 'wc5', status: 'open', startDate: '2026-01-01', endDate: '2026-02-28' },
  },
  {
    docId: 'wo8', docType: 'workOrder',
    data: { name: 'Spartan Systems', workCenterId: 'wc5', status: 'in-progress', startDate: '2026-03-01', endDate: '2026-05-31' },
  },
];
