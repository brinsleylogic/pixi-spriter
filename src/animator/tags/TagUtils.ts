import getKeyFrames from "../getKeyFrames";
import { IBoneState } from "../IAnimatorState";
import { IAnimation, ITaglineKeyFrame } from "../../file/IParsedFile";

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
export function hasTag(anim: IAnimation, group: IBoneState[], target: number | string, tag: string, time: number): boolean {
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
export function checkTagline(tagline: ITaglineKeyFrame[], tag: string, time: number): boolean {
    const startFrame = getKeyFrames(tagline, time)?.[0];

    if (startFrame?.tags == null) {
        return false;
    }

    return (startFrame.tags.indexOf(tag) > -1);
}