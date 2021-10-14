import { IMetaData, ITimelineBone, ITimelineObject } from "../file/IParsedFile";

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
    sprites: IObjectState[];

    /**
     * The state of the Action Points.
     *
     * @type {IObjectState[]}
     * @memberof IAnimatorState
     */
    points: IObjectState[];

    /**
     * The state of the boxes.
     *
     * @type {IColliderState[]}
     * @memberof IAnimatorState
     */
    colliders: IColliderState[];

    /**
     * The events triggered in this state.
     *
     * @type {IEvent[]}
     * @memberof IAnimatorState
     */
    events: IEvent[];
}

export interface IEvent {
    name: string;

    metaData?: IMetaData;

    infoId?: number;
}

export interface IBoneState extends ITimelineBone, IState {}

export interface IObjectState extends ITimelineObject, IState {}

export interface IColliderState extends IObjectState {
    pivot_x: number;
    pivot_y: number;

    w: number;
    h: number;
}

export interface IState {
    parent: number;
    timeline: number;
    spin: number;
}