export type Status = "happy" | "thirsty" | "mad";

/**
 * Calculate hydration percentage based on last watered date and next water due date
 * @param lastWatered - ISO string or Date when plant was last watered
 * @param nextWaterDue - ISO string or Date when plant should next be watered
 * @returns hydration percentage (0-100)
 */
export function calculateHydrationPercentage(
  lastWatered: string | Date,
  nextWaterDue: string | Date
): number {
  const lastWateredDate = typeof lastWatered === 'string' ? new Date(lastWatered) : lastWatered;
  const nextWaterDate = typeof nextWaterDue === 'string' ? new Date(nextWaterDue) : nextWaterDue;
  const now = new Date();
  
  // If we haven't reached the watering time yet, calculate based on time elapsed
  if (now <= nextWaterDate) {
    const totalCycle = nextWaterDate.getTime() - lastWateredDate.getTime();
    const elapsed = now.getTime() - lastWateredDate.getTime();
    const hydration = Math.max(0, 100 - (elapsed / totalCycle) * 100);
    return Math.round(hydration);
  }
  
  // If we're past the watering time, hydration decreases more rapidly
  const totalCycle = nextWaterDate.getTime() - lastWateredDate.getTime();
  const overdue = now.getTime() - nextWaterDate.getTime();
  const overdueRatio = overdue / totalCycle;
  
  // Rapid decline after due date
  const hydration = Math.max(0, 25 - (overdueRatio * 25));
  return Math.round(hydration);
}

/**
 * Determine plant status based on hydration percentage
 * @param hydrationPercent - hydration percentage (0-100)
 * @returns plant status
 */
export function getStatusFromHydration(hydrationPercent: number): Status {
  if (hydrationPercent >= 50) return "happy";
  if (hydrationPercent >= 25) return "thirsty";
  return "mad";
}

/**
 * Get sprite path for a given status
 * @param status - plant status
 * @returns path to sprite image
 */
export function getSpriteForStatus(status: Status): string {
  switch (status) {
    case "happy":
      return "/assets/happy.png";
    case "thirsty":
      return "/assets/thirsty.png";
    case "mad":
      return "/assets/mad.png";
    default:
      return "/assets/happy.png";
  }
} 