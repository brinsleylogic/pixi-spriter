/**
 * Returns the progression value (between 0-1) of the supplie3d value between the `start` and `end` values.
 *
 * @export
 * @param {number} start The minimum value.
 * @param {number} end The maximum value.
 * @param {number} value The value to test.
 * @returns {number}
 */
export default function extrapolate(start: number, end: number, value: number): number {
    return (value - start) / (end - start);
}