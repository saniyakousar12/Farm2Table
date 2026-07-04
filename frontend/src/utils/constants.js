export const API_URL = 'http://localhost:5000/api/v1';

export const PRODUCE_TYPES = [
  'vegetables',
  'fruits',
  'dairy',
  'herbs',
  'grains',
  'other'
];

export const UNITS = [
  'kg',
  'gram',
  'liter',
  'bunch',
  'piece',
  'dozen'
];

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'badge-warning' },
  confirmed: { label: 'Confirmed', color: 'badge-info' },
  preparing: { label: 'Preparing', color: 'badge-info' },
  ready_for_pickup: { label: 'Ready for Pickup', color: 'badge-info' },
  out_for_delivery: { label: 'Out for Delivery', color: 'badge-info' },
  delivered: { label: 'Delivered', color: 'badge-success' },
  cancelled: { label: 'Cancelled', color: 'badge-danger' }
};

export const getFreshnessCategory = (score) => {
  if (score >= 80) return { label: 'Just Harvested', color: 'badge-success' };
  if (score >= 50) return { label: 'Today\'s Fresh', color: 'badge-info' };
  if (score >= 20) return { label: 'Evening Deal', color: 'badge-warning' };
  return { label: 'Flash Sale', color: 'badge-danger' };
};