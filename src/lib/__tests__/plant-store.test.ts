import { addDays, subDays, format } from 'date-fns';
import { calculateNextWatering, getPlantStatus } from '../plant-store';

describe('calculateNextWatering', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns "Tomorrow" when frequency is 1', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01'));
    expect(calculateNextWatering(1)).toBe('Tomorrow');
  });

  test('returns in x days when frequency is less than or equal to 7', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01'));
    expect(calculateNextWatering(5)).toBe('in 5 days');
  });

  test('returns formatted date when frequency is greater than 7', () => {
    const now = new Date('2024-04-01');
    jest.useFakeTimers().setSystemTime(now);
    const expected = format(addDays(now, 10), 'MMM dd');
    expect(calculateNextWatering(10)).toBe(expected);
  });
});

describe('getPlantStatus', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns healthy when lastWatered is undefined', () => {
    expect(getPlantStatus('', 3)).toBe('healthy');
  });

  test('returns needs_water when past frequency', () => {
    const now = new Date('2024-04-10');
    jest.useFakeTimers().setSystemTime(now);
    const lastWatered = subDays(now, 3).toISOString();
    expect(getPlantStatus(lastWatered, 3)).toBe('needs_water');
  });

  test('returns overdue when significantly past frequency', () => {
    const now = new Date('2024-04-10');
    jest.useFakeTimers().setSystemTime(now);
    const lastWatered = subDays(now, 5).toISOString();
    expect(getPlantStatus(lastWatered, 2)).toBe('overdue');
  });

  test('returns healthy when watered recently', () => {
    const now = new Date('2024-04-10');
    jest.useFakeTimers().setSystemTime(now);
    const lastWatered = subDays(now, 1).toISOString();
    expect(getPlantStatus(lastWatered, 3)).toBe('healthy');
  });
});
