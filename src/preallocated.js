/* @flow */

import type { SegmentB, Word } from "@capnp-js/memory";

import { int32 } from "@capnp-js/write-data";

import { singleHop } from "./far";

type i32 = number;

export default function preallocated(ref: Word<SegmentB>, object: Word<SegmentB>, typeBits: 0x00 | 0x01, hi: i32): void {
  if (ref.segment.id === object.segment.id) {
    /* Use `/ 2` instead of `>>> 1` to avoid possible truncation. */
    const lo = (object.position - (ref.position + 8)) / 2 | typeBits;
    int32(lo, ref.segment.raw, ref.position);
    int32(hi, ref.segment.raw, ref.position+4);
  } else {
    const land = {
      segment: object.segment,
      position: object.position - 8,
    };
    singleHop(ref, land);
    int32(typeBits, land.segment.raw, land.position);
    int32(hi, land.segment.raw, land.position+4);
  }
}
