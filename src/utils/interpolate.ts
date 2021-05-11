/**
 * Returns the value of the progression of the supplied value between the `start` and `end` values.
 *
 * @export
 * @param {number} start The minimum value.
 * @param {number} end The maximum value.
 * @param {number} progress The weighting value (between 0-1).
 * @returns {number}
 */
 export default function interpolate(start: number, end: number, progress: number): number {
    return start + ((end - start) * progress);
}