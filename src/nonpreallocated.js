/* @flow */

import type { SegmentB, Word } from "@capnp-js/memory";
import type { ArenaB } from "@capnp-js/builder-core";

import { int32 } from "@capnp-js/write-data";

import { singleHop, doubleHop } from "./far";

type i32 = number;

export default function nonpreallocated(arena: ArenaB, ref: Word<SegmentB>, object: Word<SegmentB>, typeBits: 0x00 | 0x01, hi: i32): void {
  if (ref.segment.id === object.segment.id) {
    /* Use `/ 2` instead of `>>> 1` to avoid possible truncation. */
    const lo = (object.position - (ref.position + 8)) / 2 | typeBits;
    int32(lo, ref.segment.raw, ref.position);
    int32(hi, ref.segment.raw, ref.position+4);
  } else {
    const alloc = arena.preallocate(8, object.segment);
    if (alloc.segment.id === object.segment.id) {
      const land = alloc;
      singleHop(ref, land);
      // Use `/ 2` instead of `>>> 1` to avoid possible truncation.
      const lo = (object.position - (land.position + 8)) / 2 | typeBits;
      int32(lo, land.segment.raw, land.position);
      int32(hi, land.segment.raw, land.position+4);
    } else {
      const tag = alloc;
      const land: Word<SegmentB> = {
        segment: alloc.segment,
        position: alloc.position - 8,
      };
      doubleHop(ref, land);
      singleHop(land, object);
      int32(typeBits, tag.segment.raw, tag.position);
      int32(hi, tag.segment.raw, tag.position+4);
    }
  }
}
