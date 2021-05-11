import { IBoneState as IBaseBoneState, IObjectState } from "../../file/ISpriterFile";

/**
 * Represesnts the current state of an Animator.
 *
 * @export
 * @interface IAnimatorState
 */
export default interface IAnimatorState {
    /**
     * The state of the bone components.
     *
     * @type {IBoneState[]}
     * @memberof IAnimatorState
     */
    bones: IBoneState[];

    /**
     * The state of the sprite components.
     *
     * @type {IObjectState[]}
     * @memberof IAnimatorState
     */
    sprites: ISpriteState[];
}

export interface IBoneState extends IBaseBoneState {
    parent: number;
}

export interface ISpriteState extends IObjectState {
    parent: number;
}