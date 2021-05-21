import { IAnimation, IMainlineKeyFrame } from "../../file/IParsedFile";
import { applyParentTransforms, getKeyFrameData, interpolateKeyFrames } from "./AnimationUtils";
import IAnimatorState from "../IAnimatorState";

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
     * Returns the state of the animation using the supplied keyframe.
     *
     * @param {IAnimation} animation The animation to process.
     * @param {IMainlineKeyFrame} frame The state of the animation.
     * @memberof AnimationState
     */
    public static from(animation: IAnimation, frame: IMainlineKeyFrame): IAnimatorState;

    /**
     * Returns the state of the animation using the supplied keyframes.
     *
     * @param {IAnimation} animation The animation to process.
     * @param {IMainlineKeyFrame} startFrame The first frame to interpolate between.
     * @param {IMainlineKeyFrame} endFrame The second frame to interpolate between.
     * @param {number} progress The progression (0-1) between the two frames.
     * @memberof AnimationState
     */
    public static from(animation: IAnimation, startFrame: IMainlineKeyFrame, endFrame: IMainlineKeyFrame, progress: number): IAnimatorState

    public static from(animation: IAnimation, arg: IMainlineKeyFrame, endFrame?: IMainlineKeyFrame, progress?: number): IAnimatorState {
        // Just set the state from the supplied `arg`.
        if (endFrame == null) {
            return getKeyFrameData(animation, arg);
        }

        const start = getKeyFrameData(animation, arg);
        const end = getKeyFrameData(animation, endFrame);

        applyParentTransforms(start, end);

        return interpolateKeyFrames(start, end, progress);
    }
}