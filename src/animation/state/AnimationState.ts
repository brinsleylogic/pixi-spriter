import { IAnimation, IMainlineKeyFrame } from "../../file/ISpriterFile";
import IAnimatorState, { IBoneState, ISpriteState } from "./IAnimatorState";
import interpolate from "../../utils/interpolate";
import getKeyFrameData from "./getKeyFrameData";

/**
 * Parses the animation to provide a snapshot of the current state.
 * For blending animations during transitions use @see BlendedAnimationState.
 *
 * @export
 * @class AnimationState
 * @implements {IAnimatorState}
 */
export default class AnimationState implements IAnimatorState {
    public bones: IBoneState[];

    public sprites: ISpriteState[];

    /**
     * Creates an instance of AnimationState.
     *
     * @param {IAnimation} animation The animation to process.
     * @param {IMainlineKeyFrame} frame The state of the animation.
     * @memberof AnimationState
     */
    public constructor(animation: IAnimation, frame: IMainlineKeyFrame);

    /**
     * Creates an instance of AnimationState.
     *
     * @param {IAnimation} animation The animation to process.
     * @param {IMainlineKeyFrame} startFrame The first frame to interpolate between.
     * @param {IMainlineKeyFrame} endFrame The second frame to interpolate between.
     * @param {number} percentage The progression between the two frames.
     * @memberof AnimationState
     */
    public constructor(animation: IAnimation, startFrame: IMainlineKeyFrame, endFrame: IMainlineKeyFrame, percentage: number);

    public constructor(animation: IAnimation, arg: IMainlineKeyFrame, endFrame?: IMainlineKeyFrame, percentage?: number) {
        this.bones = [];
        this.sprites = [];

        // Just set the state form the supplied `arg`.
        if (endFrame == null) {
            const data = getKeyFrameData(animation, arg);
            this.bones = data.bones;
            this.sprites = data.sprites;
            return;
        }

        const start = getKeyFrameData(animation, arg);
        const end = getKeyFrameData(animation, endFrame);

        let i = start.bones.length;

        while (i-- > 0) {
            this.bones[i] = this.getState(start.bones[i], end.bones[i], percentage);
        }

        i = start.sprites.length;

        while (i-- > 0) {
            const sprite = this.getState(start.sprites[i], end.sprites[i], percentage);

            sprite.file = end.sprites[i].file;
            sprite.folder = end.sprites[i].folder;

            this.sprites[i] = sprite;
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
    private getState<T extends IBoneState = IBoneState>(start: T, end: T, progress: number): T {
        const state: T = { id: start.id, parent: start.parent } as any;

        if (start.id !== end.id) {
            console.log(start.id, end.id, start.parent, end.parent);
        }

        this.buildState(state, Object.keys(start), start, end, progress);
        this.buildState(state, Object.keys(end), start, end, progress);
        // console.log(start.id, end.id, start, end, {...state});

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
    private buildState<T>(state: T, propNames: string[], start: T, end: T, progress: number): void {
        let i = propNames.length;

        while (i-- > 0) {
            const prop = propNames[i];

            if (state[prop] != null) {
                continue;
            }

            const s = start[prop];
            const e = end[prop];

            if (s === e) {
                if (e != null) {
                    state[prop] = start[prop];
                }

                continue;
            }

            if (s != null && e != null) {
                if (s === e) {
                    state[prop] = s;
                } else {
                    state[prop] = interpolate(s, e, progress);
                }
            } else if (s != null || e != null) {
                state[prop] = s ?? e;
            }
        }
    }
}