import ICollision from "./ICollision";
import Animator from "../Animator";

/**
 * Checks whether the supplied point intersects with the colliders of the supplied @see Animator instance.
 *
 * @param {Animator} target The @see Animator to check.
 * @param {number} x The position on the x-axis.
 * @param {number} y The position on the y-axis.
 * @returns {ICollision[]} The collision data for each intersected collider.
 */
export default function checkCollision(target: Animator, x: number, y: number): ICollision[];

/**
 * Checks whether the supplied point intersects with the colliders of the supplied @see Animator instance.
 *
 * @param {Animator} target The @see Animator to check.
 * @param {IPoint} point The point to check.
 * @returns {ICollision[]} The collision data for each intersected collider.
 */
export default function checkCollision(target: Animator, point: IPoint): ICollision[];

export default function checkCollision(target: Animator, arg: number | IPoint, y?: number): ICollision[] {
    const colliders = target.state?.colliders;

    if (colliders == null || colliders.length === 0) {
        return;
    }

    let x: number;
    let i = colliders.length;

    if (typeof arg === "number") {
        x = arg;
    } else {
        x = arg.x;
        y = arg.y;
    }

    const collisions: ICollision[] = [];

    while (i-- > 0) {
        const collider = colliders[i];

        const rx = x - collider.x;
        const ry = y - collider.y;

        const sin = Math.sin(-collider.angle);
        const cos = Math.cos(-collider.angle);

        const tx = (rx * cos) - (ry * sin);
        const ty = (rx * sin) + (ry * cos);

        if (
            -collider.pivot_x <= tx && tx <= collider.w - collider.pivot_x
            && -collider.pivot_y <= ty && ty <= collider.h - collider.pivot_y
        ) {
            collisions.push({
                colliderName: collider.name,
                rect: collider
            });
        }
    }

    if (collisions.length) {
        return collisions;
    }
}

/**
 * Represents a point in two-dimensional space.
 *
 * @interface IPoint
 */
interface IPoint {
    x: number;
    y: number;
}