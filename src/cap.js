/* @flow */

import type { SegmentB, Word } from "@capnp-js/memory";

import { int32 } from "@capnp-js/write-data";

type u32 = number;

export default function cap(index: u32, ref: Word<SegmentB>): void {
  int32(0x03, ref.segment.raw, ref.position);
  int32(index, ref.segment.raw, ref.position+4);
}
