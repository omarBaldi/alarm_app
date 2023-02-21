/**
 * @description utility function that returns the amount
 * of seconds between 2 given dates
 * @param {Date} startDate the earlier date
 * @param {Date} endDate the later date
 * @returns {number}
 */
export const getNumberSeconds = ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}): number => {
  const startDateMs = startDate.getTime();
  const endDateMs = endDate.getTime();

  const secondsInBetween: number = Math.round(Math.abs(endDateMs - startDateMs) / 1000);
  return startDate > endDate ? secondsInBetween * -1 : secondsInBetween;
};
