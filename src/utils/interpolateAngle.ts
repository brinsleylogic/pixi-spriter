import wrap from "./wrap";

/**
 * Returns the value of the progression of the supplied value between the `start` and `end` angles.
 *
 * @export
 * @param {number} start The minimum value.
 * @param {number} end The maximum value.
 * @param {number} progress The weighting value (between 0-1).
 * @returns {number}
 */
export default function interpolateAngle(start: number, end: number, progress: number, spin: number, useRadians?: boolean): number {
    const halfAngle = (useRadians) ? Math.PI : 180;

    if (spin > 0 && (end - start) < 0) {
        end += 360;
    }

    if (spin < 0 && (end - start) > 0) {
        end -= 360;
    }

    const angle = wrap(end - start, -halfAngle, halfAngle);

    return start + (angle * progress);
}