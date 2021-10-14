import interpolate from "../../utils/interpolate";
import interpolateAngle from "../../utils/interpolateAngle";
import { IBoneState, IObjectState } from "../IAnimatorState";

/**
 * Describes the state of a key frame.
 *
 * @export
 * @interface IKeyFrameData
 */
export interface IKeyFrameData {
    bones: IBoneState[];
    sprites: IObjectState[];
    points: IObjectState[];
    colliders: IObjectState[];
}

/**
 * Returns a new state object that represents the interpolate values of the supplied key frames.
 *
 * @export
 * @param {IKeyFrameData} start The first key frame.
 * @param {IKeyFrameData} end The second key frame.
 * @param {number} progress The progression value (0-1) between the first and second frames.
 * @returns {IKeyFrameData}
 */
export function interpolateKeyFrames(start: IKeyFrameData, end: IKeyFrameData, progress: number): IKeyFrameData {
    const bones = [],
        sprites = [],
        points = [],
        boxes = [];

    let i = start.bones.length;

    while (i-- > 0) {
        bones[i] = getState(start.bones[i], end.bones[i], progress);
    }

    i = start.sprites.length;

    while (i-- > 0) {
        sprites[i] = getState(start.sprites[i], end.sprites[i], progress);
    }

    i = start.points.length;

    while (i-- > 0) {
        points[i] = getState(start.points[i], end.points[i], progress);
    }

    i = start.colliders.length;

    while (i-- > 0) {
        boxes[i] = getState(start.colliders[i], end.colliders[i], progress);
    }

    return {
        bones,
        sprites,
        points,
        colliders: boxes
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
function getState<T extends IBoneState = IBoneState>(start: T, end: T, progress: number): T {
    if (end == null) {
        return start;
    }

    const state: T = {} as any;

    ["id", "name", "parent", "timeline", "file", "folder", "spin"].forEach(p => {
        if (start[p] != null) {
            state[p] = start[p];
        }
    });

    buildState(state, Object.keys(start), start, end, progress);
    buildState(state, Object.keys(end), start, end, progress);

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
function buildState<T extends IBoneState>(state: T, propNames: string[], start: T, end: T, progress: number): void {
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
    }
}