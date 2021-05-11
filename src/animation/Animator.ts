import { IEntity, IAnimation, IMainlineKeyFrame } from "../file/ISpriterFile";
import AnimationState from "./state/AnimationState";
import IAnimatorState from "./state/IAnimatorState";
import Event from "./Event";
import extrapolate from "../utils/extrapolate";

/**
 * Responsible for interfacing with and translating the Spriter animaitons/timelines in to something more usable.
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
     * The current animation.
     *
     * @readonly
     * @type {IAnimation}
     * @memberof Animator
     */
    public get current(): IAnimation { return this._current; }

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

        if (this._current) {
            this._current = entity.animation[this._current.id];
        }

        if (this._next) {
            this._next = entity.animation[this._next.id];
        }

        return this;
    }

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

    public play(arg: number | string | IAnimation): void {
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

        // Update transition state.
        if (this._next) {
            delta *= delta * this._transitionScale * (this._current.length / this._next.length);

            // Note: Abs this to cater for playing backwards.
            this._transitionTime += Math.abs(delta);
            this._transitionScale = this._transitionTime / this._transitionDuration;

            if (this._transitionDuration <= this._transitionTime) {
                const progress = this.progress;
                this.setAnimation(this._next);

                this.progress = progress;
            }
        }

        // Calculate playback time.
        delta *= this.speed;

        const duration = this._current.length;
        const playTime = this._playTime;

        if (this._current.looping || this._current.looping == null) {
            this._playTime = (this._playTime + delta) % duration;
        } else {
            this._playTime = Math.min(this._playTime + delta, duration);
            this._playing = (this._playTime < duration);
        }

        if (this._next) {
            // TODO: Handle blending.
            // return this.updateTransitionState(this._current, this._next, this._playTime);
        }

        const state = this.getSimpleState(this._current, this._playTime);

        if (!this._playing || this._playTime < playTime) {
            this.onComplete.dispatch(this);
        }

        return state;
    }

    /**
     * Retrieves the state of the animation.
     *
     * @private
     * @param {IAnimation} animation The current animation.
     * @param {number} time The current playback time.
     * @memberof Animator
     */
    private getSimpleState(animation: IAnimation, time: number): IAnimatorState {
        const [startState, endState] = this.getKeyFrames(animation, time);

        // Set the end state.
        if (endState == null) {
            return new AnimationState(animation, startState);
        }

        // Calculate the current state.
        const progress = extrapolate(startState.time, endState.time, time);

        return new AnimationState(animation, startState, endState, progress);
    }

    /**
     * Sets a new current animation.
     *
     * @private
     * @param {IAnimation} animation The animation to use.
     * @memberof Animator
     */
    private setAnimation(animation: IAnimation): void {
        this._current = animation;
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
        if (animation == this._current) {
            return;
        }

        this._next = animation;
        this._transitionDuration = time;
        this._transitionTime = 0;
        this._transitionScale = 0;
    }

    /**
     * Returns the animation's key frames for the supplied time.
     *
     * @private
     * @param {IAnimation} animation The animation to get the frames for.
     * @param {number} time The time to fetch the frames for.
     * @returns {[IMainlineKeyFrame, IMainlineKeyFrame?]}
     * @memberof Animator
     */
    private getKeyFrames(animation: IAnimation, time: number): [IMainlineKeyFrame, IMainlineKeyFrame?] {
        const frames = animation.mainline.key;

        for (let i = 0, l = frames.length; i < l; i++) {
            const current = frames[i];
            const next = frames[i + 1];

            if (next == null) {
                if (animation.looping || animation.looping == null) {
                    return [current, frames[0]];
                }

                return [current];
            }

            if (current.time <= time && time < next.time) {
                return [current, next];
            }
        }
    }
}