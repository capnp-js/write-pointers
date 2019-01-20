/* @flow */

import type { SegmentR, SegmentB, Word } from "@capnp-js/memory";

import { int32 } from "@capnp-js/write-data";

export function singleHop(ref: Word<SegmentB>, land: Word<SegmentR>): void {
  int32(0x02 | land.position, ref.segment.raw, ref.position); /* bytes \equiv words<<3 */
  int32(land.segment.id, ref.segment.raw, ref.position+4);
}

export function doubleHop(ref: Word<SegmentB>, land: Word<SegmentR>): void {
  int32(0x06 | land.position, ref.segment.raw, ref.position);
  int32(land.segment.id, ref.segment.raw, ref.position+4);
}
