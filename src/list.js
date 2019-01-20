/* @flow */

import type { NonboolListEncoding } from "@capnp-js/layout";
import type { SegmentB, Word } from "@capnp-js/memory";

import { nonboolListHi } from "@capnp-js/layout";

import preallocated from "./preallocated";

type u29 = number;
type u30 = number;

export function preallocatedBoolList(ref: Word<SegmentB>, object: Word<SegmentB>, length: u29): void {
  preallocated(ref, object, 0x01, 0x01 | length<<3);
}

export function preallocatedNonboolList(ref: Word<SegmentB>, object: Word<SegmentB>, encoding: NonboolListEncoding, length: u29 | u30): void {
  preallocated(ref, object, 0x01, nonboolListHi(encoding, length));
}
