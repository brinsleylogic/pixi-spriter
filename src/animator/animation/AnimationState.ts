import { IAnimation, IMainlineKeyFrame } from "../../file/IParsedFile";
import IAnimatorState, { IBoneState, ISpriteState } from "../IAnimatorState";
import getKeyFrameData from "./getKeyFrameData";
import interpolate from "../../utils/interpolate";
import interpolateAngle from "../../utils/interpolateAngle";

/**
 * Parses the animation to provide a snapshot of the current state.
 * For blending animations during transitions use @see BlendedAnimationState.
 *
 * @export
 * @class AnimationState
 * @implements {IAnimatorState}
 */
export default class AnimationState {
    /**
     * Creates an instance of AnimationState.
     *
     * @param {IAnimation} animation The animation to process.
     * @param {IMainlineKeyFrame} frame The state of the animation.
     * @memberof AnimationState
     */
    public static from(animation: IAnimation, frame: IMainlineKeyFrame): IAnimatorState;

    /**
     * Creates an instance of AnimationState.
     *
     * @param {IAnimation} animation The animation to process.
     * @param {IMainlineKeyFrame} startFrame The first frame to interpolate between.
     * @param {IMainlineKeyFrame} endFrame The second frame to interpolate between.
     * @param {number} percentage The progression between the two frames.
     * @memberof AnimationState
     */
    public static from(animation: IAnimation, startFrame: IMainlineKeyFrame, endFrame: IMainlineKeyFrame, percentage: number): IAnimatorState

    public static from(animation: IAnimation, arg: IMainlineKeyFrame, endFrame?: IMainlineKeyFrame, percentage?: number): IAnimatorState {
        // Just set the state from the supplied `arg`.
        if (endFrame == null) {
            return getKeyFrameData(animation, arg);
        }

        const bones = [];
        const sprites = [];

        const startBones = [];
        const endBones = [];

        const start = getKeyFrameData(animation, arg);
        const end = getKeyFrameData(animation, endFrame);

        for (let i = 0, l = start.bones.length; i < l; i++) {
            const s = start.bones[i];
            const e = end.bones[i];

            if (i > 0) {
                this.applyParentProps(s, startBones[s.parent]);
                this.applyParentProps(e, endBones[e.parent]);
            }

            startBones.push(s);
            endBones.push(e);

            bones[i] = this.getState(s, e, percentage);
        }

        let i = start.sprites.length;

        while (i-- > 0) {
            const s = start.sprites[i];
            const e = end.sprites[i];

            if (s.parent != null) {
                this.applyParentProps(s, startBones[s.parent]);
            }

            if (e.parent != null) {
                this.applyParentProps(e, endBones[e.parent]);
            }

            sprites[i] = this.getState(start.sprites[i], end.sprites[i], percentage);
        }

        return {
            bones,
            sprites,
        };
    }

    /**
     * Returns a new state between the supplied states using the supplied progression value.
     *
     * @private
     * @param {T} start The initial state.
     * @param {T} end The final state.
     * @param {number} progress The progression from start to finish.
     * @returns {T}
     * @memberof AnimationState
     */
    private static getState<T extends IBoneState = IBoneState>(start: T, end: T, progress: number): T {
        const state: T = {
            id: start.id,
            parent: start.parent,
            name: start.name,
            timeline: start.timeline,
        } as any;

        this.buildState(state, Object.keys(start), start, end, progress);
        this.buildState(state, Object.keys(end), start, end, progress);

        return state;
    }

    /**
     * Builds the state data from the supplied state values.
     *
     * @private
     * @template T
     * @param {T} state
     * @param {string[]} propNames
     * @param {T} start
     * @param {T} end
     * @param {number} progress
     * @memberof AnimationState
     */
    private static buildState<T extends IBoneState>(state: T, propNames: string[], start: T, end: T, progress: number): void {
        let i = propNames.length;

        while (i-- > 0) {
            const prop = propNames[i];

            if (state[prop] != null) {
                continue;
            }

            const s = start[prop];
            const e = end[prop];

            if (s == null || e == null) {
                if (e != s) {
                    state[prop] = s ?? e;
                }

                continue;
            }

            if (s === e || typeof s !== "number") {
                state[prop] = s;
                continue;
            }

            state[prop] = (prop === "angle")
                ? interpolateAngle(s, e, progress)
                : interpolate(s, e, progress);
        }
    }

    /**
     * Applies the properties of the parent to the child transform.
     *
     * @private
     * @param {(IBoneState | ISpriteState)} child The child transform.
     * @param {IBoneState} parent The parent transform.
     * @memberof AnimationState
     */
    private static applyParentProps(child: IBoneState | ISpriteState, parent: IBoneState): void {
        const x = child.x * parent.scale_x;
        const y = child.y * parent.scale_y;

        const parentAngle = parent.angle * Math.PI / 180;
        const sin = Math.sin(parentAngle);
        const cos = Math.cos(parentAngle);

        child.x = ((x * cos) - (y * sin)) + parent.x;
        child.y = ((x * sin) - (y * cos)) + parent.y;

        child.scale_x *= parent.scale_x;
        child.scale_y *= parent.scale_y;

        if (child.angle != null) {
            child.angle = Math.sign(parent.scale_x * parent.scale_y) * (child.angle + parent.angle) % 360;
        }
    }
}