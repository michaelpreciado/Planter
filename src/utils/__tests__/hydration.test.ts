import { calculateHydrationPercentage, getStatusFromHydration, getSpriteForStatus } from '../hydration';

describe('Hydration utilities', () => {
  describe('getStatusFromHydration', () => {
    test('returns happy for hydration >= 50%', () => {
      expect(getStatusFromHydration(100)).toBe('happy');
      expect(getStatusFromHydration(75)).toBe('happy');
      expect(getStatusFromHydration(50)).toBe('happy');
    });

    test('returns thirsty for hydration 25-49%', () => {
      expect(getStatusFromHydration(49)).toBe('thirsty');
      expect(getStatusFromHydration(37)).toBe('thirsty');
      expect(getStatusFromHydration(25)).toBe('thirsty');
    });

    test('returns mad for hydration < 25%', () => {
      expect(getStatusFromHydration(24)).toBe('mad');
      expect(getStatusFromHydration(10)).toBe('mad');
      expect(getStatusFromHydration(0)).toBe('mad');
    });
  });

  describe('getSpriteForStatus', () => {
    test('returns correct sprite paths', () => {
      expect(getSpriteForStatus('happy')).toBe('/assets/tamagotchi.png');
      expect(getSpriteForStatus('thirsty')).toBe('/assets/thirsty.png');
      expect(getSpriteForStatus('mad')).toBe('/assets/mad.png');
    });
  });

  describe('calculateHydrationPercentage', () => {
    test('returns reasonable hydration values', () => {
      const now = new Date();
      const lastWatered = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
      const nextWaterDue = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
      
      const result = calculateHydrationPercentage(lastWatered, nextWaterDue);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
}); 