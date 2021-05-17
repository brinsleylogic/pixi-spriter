import { IAnimation, IEntity, IMainlineKeyFrame, ITaglineKeyFrame } from "../file/IParsedFile";
import AnimationState from "./animation/AnimationState";
import Event from "./Event";
import IAnimatorState, { IBoneState } from "./IAnimatorState";
import extrapolate from "../utils/extrapolate";

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

        // Update transition state.
        if (this._next) {
            delta *= delta * this._transitionScale * (animation.length / this._next.length);

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

        const duration = animation.length;
        const playTime = this._playTime;

        if (animation.looping) {
            this._playTime = (this._playTime + delta) % duration;
        } else {
            this._playTime = Math.min(this._playTime + delta, duration);
            this._playing = (this._playTime < duration);
        }

        let state: IAnimatorState;

        // Get blended animation while transitioning.
        if (this._next) {
            // TODO: Handle blending.
            // state = this.getTransitionState(animation, this._next, this._playTime);

        // Get the simple interpolated state.
        } else {
            const [startFrame, endFrame] = this.getKeyFrames(animation.mainline.key, this._playTime, this._currentFrame);

            this._currentFrame = startFrame;

            // Set the end state.
            if (endFrame == null) {
                state = AnimationState.from(animation, startFrame);

            // Calculate the current state.
            } else {
                const progress = extrapolate(startFrame.time, endFrame.time, this._playTime);

                state = AnimationState.from(animation, startFrame, endFrame, progress);
            }
        }

        this._currentState = state;

        if (!this._playing || this._playTime < playTime) {
            this.onComplete.dispatch(this);
        }

        return state;
    }

    /**
     * Indicates whether the named tag is active through the entire animation.
     *
     * @param {string} tag The tag to check.
     * @returns {boolean}
     * @memberof Animator
     */
    public checkTag(tag: string): boolean;

    /**
     * Indicates whether the named tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {true} animationOnly Indicates whether only the animation-level tags should be checked.
     * @returns {boolean}
     * @memberof Animator
     */
    public checkTag(tag: string, animationOnly: true): boolean;

    /**
     * Indicates whether the named tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {number} [target] The specific component to check. If omitted, all components are checked.
     * @returns {boolean}
     * @memberof Animator
     */
    public checkTag(tag: string, target?: number): boolean;

    /**
     * Indicates whether the named tag is active.
     *
     * @param {string} tag The tag to check.
     * @param {number} [target] The specific component to check. If omitted, all components are checked.
     * @returns {boolean}
     * @memberof Animator
     */
    public checkTag(tag: string, target?: number | boolean): boolean {
        if (this._currentState == null) {
            return false;
        }

        const anim = this._current;
        const checkTarget = (target != null);
        const animationOnly = (target === true);
        const _this = this;

        // Check animation tags.
        if ((animationOnly || !checkTarget) && anim.meta?.tagline) {
            if (_checkTagline(anim.meta.tagline.key)) {
                return true;
            }

            if (animationOnly) {
                return false;
            }
        }

        if (_hasTag(this._currentState.bones)) {
            return true;
        }

        if (_hasTag(this._currentState.sprites)) {
            return true;
        }

        return false;

        function _hasTag(group: IBoneState[]): boolean {
            let i = group.length;

            while (i-- > 0) {
                const comp = group[i];

                if (checkTarget && comp.timeline !== target) {
                    continue;
                }

                const timeline = anim.timeline[comp.timeline];

                if (timeline.meta?.tagline == null) {
                    continue;
                }

                return _checkTagline(timeline.meta.tagline.key);
            }

            return false;
        }

        function _checkTagline(tagline: ITaglineKeyFrame[]): boolean {
            const startFrame = _this.getKeyFrames(tagline, _this._playTime)?.[0];

            if (startFrame?.tags == null) {
                return false;
            }

            return (startFrame.tags.indexOf(tag) > -1);
        }
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
    private getKeyFrames<T extends IKeyFrame>(frames: T[], time: number, selected?: T): [T, T?] {
        let current = selected ?? frames[0];
        let iterations = 0;

        do {
            // Start time of frame is less than the time.
            if (current.time <= time) {
                // We're in the last frame.
                if (current.next == null) {
                    return [current];

                // We're in the current frame.
                } else if (time < current.next.time || current.next === frames[0]) {
                    return [current, current.next] as [T, T];
                }
            }

            current = current.next as T;

            if (++iterations === frames.length) {
                // console.log("Animator.getKeyFrames :: Broke loop.", frames, time);
                return;
            }
        }
        while (current.next);
    }
}

interface IKeyFrame {
    time: number;

    next?: IKeyFrame;
}