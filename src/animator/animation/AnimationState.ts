import { IAnimation, IBoneRef, IMainlineKeyFrame, IObjectRef, ITimelineBone, ITimelineKeyFrame, ITimelineObject } from "../../file/IParsedFile";
import { IKeyFrameData } from "./AnimationUtils";
import { IBoneState, IObjectState, IState } from "../IAnimatorState";
import getKeyFrames from "../getKeyFrames";
import extrapolate from "../../utils/extrapolate";
import interpolateAngle from "../../utils/interpolateAngle";
import interpolate from "../../utils/interpolate";

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
     * Returns the state of the animation using the supplied keyframes.
     *
     * @param {IAnimation} animation The animation to process.
     * @param {IMainlineKeyFrame} mainFrame The current frame.
     * @param {number} time The current playback time of the animation.
     * @memberof AnimationState
     */
    public static from(animation: IAnimation, mainFrame: IMainlineKeyFrame, time: number): IKeyFrameData {
        const frameEndTime = mainFrame.next?.time || animation.length;
        const fallbackProgress = extrapolate(mainFrame.time, frameEndTime, time);

        const bones = [];

        for (let i = 0, l = mainFrame.bone_ref.length; i < l; i++) {
            const bone = this.getTimelineState(animation, mainFrame.bone_ref[i], time, fallbackProgress);
            bones.push(bone);

            if (i === 0) {
                continue;
            }

            this.applyParentProps(bone.start, bones[bone.start.parent].start);
            this.applyParentProps(bone.end, bones[bone.end.parent].end);
        }

        const sprites = [], points = [], colliders = [];

        let i = mainFrame.object_ref.length;

        while (i-- > 0) {
            const ref = mainFrame.object_ref[i];
            const data = this.getTimelineState(animation, ref, time, fallbackProgress);

            const timeline = animation.timeline[ref.timeline];

            if (data.start.parent != null) {
                this.applyParentProps(data.start, bones[data.start.parent].start);
            }

            if (data.end.parent != null) {
                this.applyParentProps(data.end, bones[data.end.parent].end);
            }

            switch (timeline.object_type) {
                case "point":
                    points.push(data);
                    break;

                case "box":
                    colliders.push(data);
                    break;

                default:
                    sprites.push(data);
                    break;
            }
        }

        return {
            bones: bones.map(e => this.getState(e.start, e.end, e.progress)),
            sprites: sprites.map(e => this.getState(e.start, e.end, e.progress)),
            points: points.map(e => this.getState(e.start, e.end, e.progress)),
            colliders: colliders.map(e => this.getState(e.start, e.end, e.progress)),
        };
    }

    /**
     * Retrieves the state of the associated timeline for interpolation calculations.
     *
     * @private
     * @static
     * @param {IAnimation} animation The animation to process.
     * @param {(IBoneRef | IObjectRef)} ref The one/object reference fromthe mainline.
     * @param {number} time The animation's current playback time.
     * @returns {TimelineState}
     * @memberof AnimationState
     */
    private static getTimelineState(animation: IAnimation, ref: IBoneRef | IObjectRef, time: number, fallback: number): TimelineState {
        const timeline = animation.timeline[ref.timeline];
        const [startFrame, endFrame] = getKeyFrames(timeline.key, time);

        return {
            start: getFrameData(startFrame),
            end: getFrameData(endFrame),
            progress: (startFrame !== endFrame)
                ? extrapolate(startFrame.time, endFrame.time || animation.length, time)
                : fallback,
        }

        function getFrameData(keyFrame: ITimelineKeyFrame): KeyFrameData {
            return {
                ...(keyFrame.bone ?? keyFrame.object),
                spin: keyFrame.spin,
                parent: ref.parent,
                timeline: ref.timeline
            };
        }
    }

    /**
     * Applies the properties of the parent to the child transform.
     *
     * @private
     * @param {(IBoneState | IObjectState)} child The child transform.
     * @param {IBoneState} parent The parent transform.
     * @memberof AnimationState
     */
    private static applyParentProps(child: IBoneState | IObjectState, parent: IBoneState): void {
        
        if (child.scale_x < 0) {
            child.scale_x = child.scale_x * -1
             child.x = child.x *-1
        }

        if (child.scale_y < 0) {
            child.scale_y = child.scale_y * -1
            child.y = child.y *-1
        }

        if (parent.scale_x < 0) {
            parent.scale_x = parent.scale_x * -1
            parent.x = parent.x *-1
        }

        if (parent.scale_y < 0) {
            parent.scale_y = parent.scale_y * -1
            parent.y = parent.y *-1
        }

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
    private static getState(start: KeyFrameData, end: KeyFrameData, progress: number): any {
        const state = {} as any;

        ["id", "name", "parent", "timeline", "file", "folder", "spin"].forEach(p => {
            if (start[p] != null) {
                state[p] = start[p];
            }
        });

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
                ? interpolateAngle(s, e, progress, state.spin)
                : interpolate(s, e, progress);
            console.log(state.name, prop, state[prop], `${progress}%`, s, e)
        }
    }
}

type KeyFrameData = (ITimelineBone | ITimelineObject) & IState;

type TimelineState = {
    start: KeyFrameData;
    end?: KeyFrameData;
    progress?: number;
}
