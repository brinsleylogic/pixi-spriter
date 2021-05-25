import Animator from "../Animator";
import { checkTagline, hasTag } from "./TagUtils";

/**
 * Checks for tags on the target @see Animator.
 *
 * @export
 * @class TagChecker
 */
export default class TagChecker {
    private _animator: Animator;

    public constructor(target?: Animator) {
        this._animator = target;
    }

    /**
     * Sets the target to check for tags.
     *
     * @param {Animator} target The @see Animator to use.
     * @returns {this}
     * @memberof TagChecker
     */
    public setTarget(target: Animator): this {
        this._animator = target;
        return this;
    }

    /**
     * Checks the entire @see Animator state for whether the specified tag is active.
     *
     * @param {string} tag The tag to check.
     * @returns {boolean}
     * @memberof TagChecker
     */
    public check(tag: string): boolean {
        if (this._animator?.state == null) {
            return false;
        }

        if (this.checkAnimation(tag)) {
            return true;
        }

        const animation = this._animator.animation;
        const time = this._animator.time;

        const array = [
            this._animator.state.bones,
            this._animator.state.sprites,
            this._animator.state.colliders,
            this._animator.state.points
        ];

        let i = array.length;

        while (i-- > 0) {
            if (hasTag(animation, array[i], null, tag, time)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks the named event for whether the specified tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {string} name The name of the event.
     * @returns {boolean}
     * @memberof TagChecker
     */
    public checkEvent(tag: string, name: string): boolean {
        const events = this._animator?.state?.events;

        if (events == null) {
            return false;
        }

        let i = events.length;

        while (i -- > 0) {
            const event = events[i];

            if (event.name !== name) {
                continue;
            }

            const tagline = event.metaData?.tagline;

            if (tagline == null) {
                return false;
            }

            return checkTagline(tagline.key, tag, this._animator.time);
        }

        return false;
    }

    /**
     * Checks the current animation for whether the specified tag is active.
     *
     * @param {string} tag The tag to check.
     * @returns {boolean}
     * @memberof TagChecker
     */
    public checkAnimation(tag: string): boolean {
        const tagline = this._animator?.animation?.meta?.tagline;

        if (tagline == null) {
            return false;
        }

        return checkTagline(tagline.key, tag, this._animator.time);
    }

    /**
     * Checks the current animation components for whether the specified tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {number} id The (timeline) identifier of the component to check.
     * @returns {boolean}
     * @memberof TagChecker
     */
    public checkComponent(tag: string, id: number): boolean;

    /**
     * Checks the current animation components for whether the specified tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {string} name The name of the component to check.
     * @returns {boolean}
     * @memberof TagChecker
     */
    public checkComponent(tag: string, name: string): boolean;

    public checkComponent(tag: string, arg: number | string): boolean {
        const sprites = this._animator?.state?.sprites;

        if (sprites == null || sprites.length === 0) {
            return false;
        }

        return hasTag(this._animator.animation, sprites, arg, tag, this._animator.time);
    }

    /**
     * Checks the current animation's colliders for whether the specified tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {string} name The name of the collider to check.
     * @returns {boolean}
     * @memberof TagChecker
     */
    public checkCollider(tag: string, id: number): boolean;

    /**
     * Checks the current animation's colliders for whether the specified tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {number} id The (timeline) identifier of the collider to check.
     * @returns {boolean}
     * @memberof TagChecker
     */
    public checkCollider(tag: string, name: string): boolean;

    public checkCollider(tag: string, arg: number | string): boolean {
        const colliders = this._animator?.state?.colliders;

        if (colliders == null || colliders.length === 0) {
            return false;
        }

        return hasTag(this._animator.animation, colliders, arg, tag, this._animator.time);
    }
}