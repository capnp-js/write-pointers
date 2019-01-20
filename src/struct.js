/* @flow */

import type { Bytes } from "@capnp-js/layout";
import type { SegmentB, Word } from "@capnp-js/memory";

import { structHi } from "@capnp-js/layout";
import { int32 } from "@capnp-js/write-data";

import preallocated from "./preallocated";

/* Null pointers indicate default substition, so I use offset=-1 to avoid
 * triggering default substitution. */
export function emptyStruct(ref: Word<SegmentB>): void {
  int32(0xfffffffc, ref.segment.raw, ref.position);
  int32(0x00000000, ref.segment.raw, ref.position+4);
}

export function preallocatedStruct(ref: Word<SegmentB>, object: Word<SegmentB>, bytes: Bytes): void {
  const hi = structHi(bytes);
  if (hi === 0x00000000) {
//TODO: Add test(s) to trigger this case.
    emptyStruct(ref);
  } else {
    preallocated(ref, object, 0x00, hi);
  }
}
