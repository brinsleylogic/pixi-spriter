/**
 * Describes a collision.
 *
 * @export
 * @interface ICollision
 */
export default interface ICollision {
    colliderName: string;

    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
        angle: number;
    };
}