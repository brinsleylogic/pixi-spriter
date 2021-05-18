/**
 * Clamps the supplied value to the bounds.
 *
 * @export
 * @param {number} value The value to wrap.
 * @param {number} boundA The first boundary.
 * @param {number} boundB the second boundary.
 * @returns {number}
 */
 export default function clamp(value: number, boundA: number, boundB: number): number {
    const [min, max] = (boundA < boundB) ? [boundA, boundB] : [boundB, boundA];

    if (value < min) {
        return min;
    }

    if (max < value) {
        return max;
    }

    return value;
}