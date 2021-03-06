/**
 * Wraps the supplied value around the bounds to ensure it always falls between the bounds.
 *
 * @export
 * @param {number} value The value to wrap.
 * @param {number} boundA The first boundary.
 * @param {number} boundB the second boundary.
 * @returns {number}
 */
export default function wrap(value: number, boundA: number, boundB: number): number {
    const [min, max] = (boundA < boundB) ? [boundA, boundB] : [boundB, boundA];

    if (value < min) {
        return max - ((min - value) % (max - min));
    }

    return min + ((value - min) % (max - min));
}