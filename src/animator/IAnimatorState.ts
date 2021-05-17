import { ITimelineBone, ITimelineObject } from "../file/IParsedFile";

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
     * @type {ISpriteState[]}
     * @memberof IAnimatorState
     */
    sprites: ISpriteState[];
}

export interface IBoneState extends ITimelineBone, IState {}

export interface ISpriteState extends ITimelineObject, IState {}

interface IState {
    parent: number;
    timeline: number;
}