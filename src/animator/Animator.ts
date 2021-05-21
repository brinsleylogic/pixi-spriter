import { IAnimation, IEntity, IMainlineKeyFrame } from "../file/IParsedFile";
import AnimationState from "./animation/AnimationState";
import Event from "./Event";
import IAnimatorState from "./IAnimatorState";
import clamp from "../utils/clamp";
import extrapolate from "../utils/extrapolate";
import wrap from "../utils/wrap";
import getKeyFrames from "./getKeyFrames";
import { interpolateKeyFrames } from "./animation/AnimationUtils";

/**
 * Responsible for interfacing with and translating the Spriter animations/timelines in to something more usable.
 *
 * @export
 * @class Animator
 */
export default class Animator {
    /**
     * Invoked when an animation completes.
     *
     * @memberof Animator
     */
    public readonly onComplete = new Event<(target: Animator) => void>();

    /**
     * The animation playback speed.
     *
     * @type {number}
     * @memberof Animator
     */
    public speed: number;

    private _entity: IEntity;

    private _current: IAnimation;
    private _next: IAnimation;

    private _currentFrame: IMainlineKeyFrame;
    private _currentState: IAnimatorState;

    private _playing: boolean;
    private _playTime: number;

    private _transitionDuration: number;
    private _transitionTime: number;
    private _transitionScale: number;

    public constructor() {
        this.speed = 1;
    }

    /**
     * Indicates whether the animator is currently playing an animation.
     *
     * @readonly
     * @type {boolean}
     * @memberof Animator
     */
    public get playing(): boolean { return this._playing };

    /**
     * The current playback time of the Animator.
     *
     * @readonly
     * @type {number}
     * @memberof Animator
     */
    public get time(): number { return this._playTime; }

    /**
     * The current animation.
     *
     * @readonly
     * @type {IAnimation}
     * @memberof Animator
     */
    public get animation(): IAnimation { return this._current; }

    /**
     * The current state of the Animator.
     *
     * @readonly
     * @type {IAnimatorState}
     * @memberof Animator
     */
    public get state(): IAnimatorState { return this._currentState; }

    /**
     * The percentage of the playback duration (from 0-1).
     *
     * @type {number}
     * @memberof Animator
     */
    public get progress(): number { return this._playTime / this._current.length; }
    public set progress(value: number) { this._playTime = value * this._current.length; }

    /**
     *  Sets the Spriter Entity for this Animator to use.
     *
     * @param {IEntity} entity The Entity to use.
     * @returns {this}
     * @memberof Animator
     */
    public setEntity(entity: IEntity): this {
        this._entity = entity;
        this._currentFrame = undefined;

        if (this._current) {
            this._current = entity.animation[this._current.id];
        }

        if (this._next) {
            this._next = entity.animation[this._next.id];
        }

        return this;
    }

    /**
     * Resumes playback if previously stopped.
     *
     * @memberof Animator
     */
    public play(): void;

    /**
     * Plays the animation.
     *
     * @param {number} id The animation identifier.
     * @memberof Animator
     */
    public play(id: number): void;

    /**
     * Plays the animation.
     *
     * @param {string} name The animation name.
     * @memberof Animator
     */
    public play(name: string): void;

    /**
     * Plays the animation.
     *
     * @param {IAnimation} animation The animation.
     * @memberof Animator
     */
    public play(animation: IAnimation): void;

    public play(arg?: number | string | IAnimation): void {
        if (arguments.length === 0) {
            if (this._current) {
                this._playing = true;
            }

            return;
        }

        if (typeof arg === "object") {
            return this.setAnimation(arg);
        }

        const anims = this._entity.animation;

        if (typeof arg === "number") {
            if (anims[arg]) {
                this.setAnimation(anims[arg]);
            }

            return;
        }

        let i = anims.length;

        while (i-- > 0) {
            if (anims[i].name === arg) {
                return this.setAnimation(anims[i]);
            }
        }
    }

    /**
     * Halts playback (stops the Animtor from updating internally).
     *
     * @memberof Animator
     */
    public stop(): void {
        this._playing = false;
    }

    /**
     * Transitions to the animation from the current state.
     *
     * @param {number} id The animation identifier.
     * @memberof Animator
     */
    public transition(id: number, time: number): void;

    /**
     * Transitions to the animation from the current state.
     *
     * @param {string} name The animation name.
     * @memberof Animator
     */
    public transition(name: string, time: number): void;

    /**
     * Transitions to the animation from the current state.
     *
     * @param {IAnimation} animation The animation.
     * @memberof Animator
     */
    public transition(animation: IAnimation, time: number): void;

    public transition(arg: number | string | IAnimation, time: number): void {
        if (this._next) {
            console.warn(
                `Can't transition to ${(typeof arg === "object") ? arg.name : arg}`,
                `already transitioning to ${this._next.name} from ${this._current.name}.`
            );
            return;
        }

        if (typeof arg === "object") {
            return this.startTransition(arg, time);
        }

        const anims = this._entity.animation;

        if (typeof arg === "number") {
            if (anims[arg]) {
                this.startTransition(anims[arg], time);
            }

            return;
        }

        let i = anims.length;

        while (i-- > 0) {
            if (anims[i].name === arg) {
                return this.startTransition(anims[i], time);
            }
        }
    }

    /**
     * Progresses the animation by the supplied time.
     *
     * @param {number} delta The time since the last update (in milliseconds).
     * @returns {IAnimatorState} The state of the animator.
     * @memberof Animator
     */
    public update(delta: number): IAnimatorState {
        // Ensure we have an animaiton playing.
        if (!this._current) {
            this.setAnimation(this._entity.animation[0]);
        }

        if (!this._playing || !this.speed) {
            return;
        }

        const animation = this._current;

        delta *= this.speed;

        // Update transition state.
        if (this._next) {
            delta += delta * this._transitionScale * (animation.length / this._next.length);

            // Note: Abs this to cater for playing backwards.
            this._transitionTime += Math.abs(delta);

            if (this._transitionDuration <= this._transitionTime) {
                const progress = this.progress;
                this.setAnimation(this._next);

                this.progress = progress;
            } else {
                this._transitionScale = this._transitionTime / this._transitionDuration;
            }
        }

        // Calculate playback time.
        const duration = animation.length;
        const playTime = this._playTime;

        if (animation.looping) {
            this._playTime = wrap(this._playTime + delta, 0, duration);
        } else {
            this._playTime = clamp(this._playTime + delta, 0, duration);
            this._playing = (0 < this._playTime && this._playTime < duration);
        }

        let state: IAnimatorState;

        // Get blended animation while transitioning.
        if (this._next) {
            state = this.getTransitionState(animation, this._next, this._playTime, this._transitionScale);

        // Get the simple interpolated state.
        } else {
            state = this.getState(animation, this._playTime, true);
        }

        this._currentState = state;

        if (!this._playing || this._playTime < playTime) {
            this.onComplete.dispatch(this);
        }

        return state;
    }

    /**
     * Sets a new current animation.
     *
     * @private
     * @param {IAnimation} animation The animation to use.
     * @memberof Animator
     */
    private setAnimation(animation: IAnimation): void {
        if (animation && this._current === animation) {
            this._playing = true;
            return;
        }

        this._current = animation;
        this._currentFrame = null;
        this._next = null;

        this._playTime = 0;
        this._playing = true;
    }

    /**
     * Starts transitioning to the supplied animation.
     *
     * @private
     * @param {IAnimation} animation The next animation.
     * @param {number} time The transition time.
     * @memberof Animator
     */
    private startTransition(animation: IAnimation, time: number): void {
        if (animation === this._current || !time) {
            this.setAnimation(animation);
            return;
        }

        this._next = animation;
        this._transitionDuration = time;
        this._transitionTime = 0;
        this._transitionScale = 0;
    }

    /**
     * Indicates whether two key frames can be blended.
     *
     * @private
     * @param {IMainlineKeyFrame} first The key frame form the first animation.
     * @param {IMainlineKeyFrame} second The key frame form the second animation.
     * @returns {boolean}
     * @memberof Animator
     */
    private canBlend(first: IMainlineKeyFrame, second: IMainlineKeyFrame): boolean {
        if (first.bone_ref == null || second.bone_ref == null && first.bone_ref != second.bone_ref) {
            return false;
        }

        if (first.bone_ref.length !== second.bone_ref.length) {
            return false;
        }

        if (first.object_ref == null || second.object_ref == null && first.object_ref != second.object_ref) {
            return false;
        }

        if (first.object_ref.length !== second.object_ref.length) {
            return false;
        }

        return true;
    }

    /**
     * Returns the interpolated state of the supplied animations.
     *
     * @private
     * @param {IAnimation} first The first animation to blend.
     * @param {IAnimation} second The second animation to blend.
     * @param {number} time The current play time.
     * @param {number} progress The progression (0-1) of the transition.
     * @returns {IAnimatorState}
     * @memberof Animator
     */
    private getTransitionState(first: IAnimation, second: IAnimation, time: number, progress: number): IAnimatorState {
        const timeforSecond = time / first.length * second.length;

        const [firstStartFrame, firstEndFrame] = getKeyFrames(first.mainline.key, time, this._currentFrame);
        const [secondStartFrame, secondEndFrame] = getKeyFrames(second.mainline.key, timeforSecond);

        // If we cant blend just return the state of the first animation.
        if (!this.canBlend(firstStartFrame, secondStartFrame)) {
            return this.getState(first, time, true);
        }

        if (!this.canBlend(firstEndFrame, secondEndFrame)) {
            return this.getState(first, time, true);
        }

        return interpolateKeyFrames(
            this.getState(first, time),
            this.getState(second, timeforSecond),
            progress
        );
    }

    /**
     * Returns the inerpolated state of the animation.
     *
     * @private
     * @param {IAnimation} animation The animation to interpolate.
     * @param {number} time The current play time.
     * @param {boolean} [updateCurrent]
     * @returns {IAnimatorState}
     * @memberof Animator
     */
    private getState(animation: IAnimation, time: number, updateCurrent?: boolean): IAnimatorState {
        const isCurrentValid = (this._currentFrame?.animation === animation.id);

        const [startFrame, endFrame] = getKeyFrames(animation.mainline.key, time, (isCurrentValid) ? this._currentFrame : null);

        if (updateCurrent && startFrame !== this._currentFrame) {
            this._currentFrame = startFrame;
        }

        // Set the end state.
        if (startFrame === endFrame || endFrame == null) {
            return AnimationState.from(animation, startFrame);
        }

        // Calculate the current state.
        const progress = extrapolate(startFrame.time, endFrame.time || animation.length, time);

        return AnimationState.from(animation, startFrame, endFrame, progress);
    }
}