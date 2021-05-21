import Animator from "./Animator";
import getKeyFrames from "./getKeyFrames";
import { IBoneState } from "./IAnimatorState";
import { IAnimation, ITaglineKeyFrame } from "../file/IParsedFile";

/**
 * Indicates whether the named tag is active through the Animator's current animation.
 *
 * @export
 * @param {Animator} target The Animator to check.
 * @param {string} tag The tag to check.
 * @param {number} time The time to check.
 * @returns {boolean}
 */
export function checkTag(target: Animator, tag: string, time?: number): boolean;

/**
 * Indicates whether the named tag is active in the target component of the Animator's current animation.
 *
 * @export
 * @param {Animator} animator The Animator to check.
 * @param {(string | number)} target The `name` or `timeline` property of the item to check.
 * @param {string} tag The tag to check.
 * @param {number} time The time to check.
 * @returns {boolean}
 */
export function checkTag(animator: Animator, target: string | number, tag: string, time?: number): boolean;

export function checkTag(animator: Animator, targetOrTag: string | number, tagOrTime: string | number, time?: number): boolean {
    let target: string | number;
    let tag: string;

    if (typeof tagOrTime === "number") {
        tag = targetOrTag as string;
        time = tagOrTime;
    } else {
        target = targetOrTag;
        tag = tagOrTime as string;
    }

    const state = animator.state;

    time ??= animator.time;


    if (state == null) {
        return false;
    }

    const anim = animator.animation;

    if (hasTag(anim, state.bones, target, tag, time)) {
        return true;
    }

    if (hasTag(anim, state.sprites, target, tag, time)) {
        return true;
    }

    return false;
}

/**
 * Indicates whether the named tag is active.
 *
 * @param {string} tag The tag to check.
 * @param {true} animationOnly Indicates whether only the animation-level tags should be checked.
 * @returns {boolean}
 */
export function checkAnimationTag(animation: IAnimation, tag: string, time?: number): boolean {
    const _animator = animation as any;

    return checkTagline(animation.meta.tagline.key, tag, time ?? _animator._playTime);
}

/**
 * Checks the timelines of the supplied group for the tag.
 *
 * @param {IAnimation} anim The animation containing the timeline data.
 * @param {IBoneState[]} group The group of items to check.
 * @param {(number | string)} target If set, indicates the `name` or `timeline` property of the item to check. If omited all items are searched.
 * @param {string} tag The tag to check.
 * @param {number} time The time to check.
 * @returns {boolean}
 */
function hasTag(anim: IAnimation, group: IBoneState[], target: number | string, tag: string, time: number): boolean {
    const checkTarget = (target != null);

    let i = group.length;

    while (i-- > 0) {
        const comp = group[i];

        if (checkTarget) {
            if (comp.name !== (target as string) || comp.timeline !== (target as number)) {
                continue;
            }
        }

        const timeline = anim.timeline[comp.timeline];

        if (timeline.meta?.tagline == null) {
            continue;
        }

        return checkTagline(timeline.meta.tagline.key, tag, time);
    }

    return false;
}

/**
 * Checks the supplied tagline for the named tag.
 *
 * @param {ITaglineKeyFrame[]} tagline The array to search through.
 * @param {string} tag The tag to check.
 * @param {number} time the time to check.
 * @returns {boolean}
 */
function checkTagline(tagline: ITaglineKeyFrame[], tag: string, time: number): boolean {
    const startFrame = getKeyFrames(tagline, time)?.[0];

    if (startFrame?.tags == null) {
        return false;
    }

    return (startFrame.tags.indexOf(tag) > -1);
}