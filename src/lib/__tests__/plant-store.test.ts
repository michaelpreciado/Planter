import { addDays, subDays, format } from 'date-fns';
import { calculateNextWatering, getPlantStatus } from '../plant-store';

describe('calculateNextWatering', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns "Tomorrow" when frequency is 1 and no last watered date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01'));
    expect(calculateNextWatering(1)).toBe('Tomorrow');
  });

  test('returns in x days when frequency is less than or equal to 7 and no last watered date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01'));
    expect(calculateNextWatering(5)).toBe('in 5 days');
  });

  test('returns formatted date when frequency is greater than 7 and no last watered date', () => {
    const now = new Date('2024-04-01');
    jest.useFakeTimers().setSystemTime(now);
    const expected = format(addDays(now, 10), 'MMM dd');
    expect(calculateNextWatering(10)).toBe(expected);
  });

  test('calculates next watering based on last watered date', () => {
    const now = new Date('2024-04-01');
    jest.useFakeTimers().setSystemTime(now);
    const yesterday = subDays(now, 1).toISOString();
    expect(calculateNextWatering(3, yesterday)).toBe('in 2 days');
  });

  test('returns "Today" when plant should be watered today', () => {
    const now = new Date('2024-04-01');
    jest.useFakeTimers().setSystemTime(now);
    const threeDaysAgo = subDays(now, 3).toISOString();
    expect(calculateNextWatering(3, threeDaysAgo)).toBe('Today');
  });

  test('returns "Overdue" when plant is significantly past due', () => {
    const now = new Date('2024-04-01');
    jest.useFakeTimers().setSystemTime(now);
    const weekAgo = subDays(now, 7).toISOString();
    expect(calculateNextWatering(3, weekAgo)).toBe('Overdue');
  });

  test('returns "Tomorrow" when plant needs watering tomorrow', () => {
    const now = new Date('2024-04-01');
    jest.useFakeTimers().setSystemTime(now);
    const twoDaysAgo = subDays(now, 2).toISOString();
    expect(calculateNextWatering(3, twoDaysAgo)).toBe('Tomorrow');
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
