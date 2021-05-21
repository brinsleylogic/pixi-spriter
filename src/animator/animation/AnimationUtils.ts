import { IAnimation, IMainlineKeyFrame } from "../../file/ISpriterFile";
import interpolate from "../../utils/interpolate";
import interpolateAngle from "../../utils/interpolateAngle";
import { IBoneState, ISpriteState } from "../IAnimatorState";

/**
 * Describes the state of a key frame.
 *
 * @export
 * @interface IKeyFrameData
 */
export interface IKeyFrameData {
    bones: IBoneState[];
    sprites: ISpriteState[];
}

/**
 * Retrieves the data that represents the state of the animation on the supplied key frame/
 *
 * @export
 * @param {IAnimation} animation the animation to process.
 * @param {IMainlineKeyFrame} keyFrame the key frame info.
 * @returns {IFrame}
 */
 export function getKeyFrameData(animation: IAnimation, keyFrame: IMainlineKeyFrame): IKeyFrameData {
    let bones = [], sprites = [];

    let i = keyFrame.bone_ref.length;

    while (i-- > 0) {
        const ref = keyFrame.bone_ref[i];
        const timeline = animation.timeline[ref.timeline];

        bones[i] = {
            ...timeline.key[ref.key].bone,
            parent: ref.parent,
            timeline: ref.timeline,
        };
    }

    i = keyFrame.object_ref.length;

    while (i-- > 0) {
        const ref = keyFrame.object_ref[i];
        const timeline = animation.timeline[ref.timeline];

        const data = {
            ...timeline.key[ref.key].object,
            parent: ref.parent,
            timeline: ref.timeline,
        };

        switch (timeline.object_type) {
            case "point":
            case "box":
                break;

            default:
                sprites.push(data);
                break;
        }
    }

    return { bones, sprites };
}

export function applyParentTransforms(...frameData: IKeyFrameData[]): void {
    let i = frameData.length;

    while (i-- > 0) {
        const data = frameData[i];
        const bones = [data.bones[0]];

        for (let j = 1, l = data.bones.length; j < l; j++) {
            const bone = data.bones[j];

            applyParentProps(bone, bones[bone.parent]);

            bones.push(bone);
        }

        let j = data.sprites.length;

        while (j-- > 0) {
            const sprite = data.sprites[j];

            if (sprite.parent != null) {
                applyParentProps(sprite, bones[sprite.parent]);
            }
        }
    }
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
    const bones = [];
    const sprites = [];

    let i = start.bones.length;

    while (i-- > 0) {
        bones[i] = getState(start.bones[i], end.bones[i], progress);
    }

    i = start.sprites.length;

    while (i-- > 0) {
        sprites[i] = getState(start.sprites[i], end.sprites[i], progress);
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
function getState<T extends IBoneState = IBoneState>(start: T, end: T, progress: number): T {
    const state: T = {
        id: start.id,
        parent: start.parent,
        name: start.name,
        timeline: start.timeline,
    } as any;

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
function applyParentProps(child: IBoneState | ISpriteState, parent: IBoneState): void {
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