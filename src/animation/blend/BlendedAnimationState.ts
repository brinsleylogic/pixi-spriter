import IAnimatorState, { IBoneState, ISpriteState } from "../state/IAnimatorState";

/**
 * Parses the animation to provide a snapshot of the current state.
 * For blending animations during transitions use @see BlendedAnimationState.
 *
 * @export
 * @class AnimationState
 * @implements {IAnimatorState}
 */
export default class BlendedAnimationState implements IAnimatorState {
    public bones: IBoneState[];

    public sprites: ISpriteState[];

}