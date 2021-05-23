import { IAnimation, IEntity, IEventline, IMainlineKeyFrame } from "../file/IParsedFile";
import AnimationState from "./animation/AnimationState";
import Event from "./Event";
import IAnimatorState, { IEvent } from "./IAnimatorState";
import clamp from "../utils/clamp";
import extrapolate from "../utils/extrapolate";
import wrap from "../utils/wrap";
import getKeyFrames from "./getKeyFrames";
import { interpolateKeyFrames, IKeyFrameData } from "./animation/AnimationUtils";

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
    private _triggeredEvents: string[];

    private _playing: boolean;
    private _playTime: number;

    private _transitionDuration: number;
    private _transitionTime: number;
    private _transitionScale: number;

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

    public constructor() {
        this._triggeredEvents = [];
        this.speed = 1;
    }

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

        let animation = this._current;

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

                animation = this._current;
            } else {
                this._transitionScale = this._transitionTime / this._transitionDuration;
            }
        }

        // Calculate playback time.
        const duration = animation.length;
        const playTime = this._playTime;

        if (animation.looping) {
            this._playTime = wrap(playTime + delta, 0, duration);
        } else {
            this._playTime = clamp(playTime + delta, 0, duration);
            this._playing = (0 < this._playTime && this._playTime < duration);
        }

        let frameData: IKeyFrameData;

        // Get blended animation while transitioning.
        if (this._next) {
            frameData = this.getTransitionState(animation, this._next, this._playTime, this._transitionScale);

        // Get the simple interpolated state.
        } else {
            frameData = this.getState(animation, this._playTime, true);
        }

        const state: IAnimatorState = frameData as any;

        if (animation.eventline) {
            state.events = this.getTriggeredEvents(animation.eventline, playTime, this._playTime);
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
     * @param {IKeyFrameData} first The interpolated state from the first animation.
     * @param {IKeyFrameData} second The interpolated state from the second animation.
     * @returns {boolean}
     * @memberof Animator
     */
    private canBlend(first: IKeyFrameData, second: IKeyFrameData): boolean {
        if (first.bones.length !== second.bones.length) {
            return false;
        }

        if (first.sprites.length !== second.sprites.length) {
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
     * @returns {IKeyFrameData}
     * @memberof Animator
     */
    private getTransitionState(first: IAnimation, second: IAnimation, time: number, progress: number): IKeyFrameData {
        const timeforSecond = time / first.length * second.length;

        const firstState = this.getState(first, time, true);
        const secondState = this.getState(second, timeforSecond);

        // If we can't blend just return the state of the first animation.
        if (!this.canBlend(firstState, secondState)) {
            return firstState;
        }

        return interpolateKeyFrames(firstState, secondState, progress);
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
    private getState(animation: IAnimation, time: number, updateCurrent?: boolean): IKeyFrameData {
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

    /**
     * Checks the supplied eventlines and returns the data for any events that have triggered between the supplied times.
     *
     * @private
     * @param {IEventline[]} events The events to check.
     * @param {number} prevTime The previous update time.
     * @param {number} curTime The current update time.
     * @returns {IEvent[]}
     * @memberof Animator
     */
    private getTriggeredEvents(events: IEventline[], prevTime: number, curTime: number): IEvent[] {
        let output: IEvent[];
        let i = events.length;

        while (i-- > 0) {
            const data = events[i];
            const triggerIndex = this._triggeredEvents.indexOf(data.name);

            let j = data.key.length;
            let process: boolean;

            while (j-- > 0) {
                const frame = data.key[j];

                if (prevTime <= frame.time && frame.time < curTime) {
                    process = true;
                    break;
                }

                if (prevTime < curTime) {
                    continue;
                }

                if (prevTime <= frame.time && frame.time < curTime) {
                    process = true;
                    break;
                }
            }

            if (!process) {
                // Clear the event if it was previously triggered.
                if (triggerIndex > -1) {
                    this._triggeredEvents.splice(triggerIndex, 1);
                }

                continue;
            }

            // Don't include in the trigger list again until cleared.
            if (triggerIndex > -1) {
                continue;
            }

            this._triggeredEvents.push(data.name);

            const event: IEvent = { name: data.name };

            if (data.meta) {
                event.metaData = data.meta;
            }

            if (data.obj != null) {
                event.infoId = data.obj;
            }

            (output) ? output.push(event) : output = [event];
        }

        return output;
    }
}