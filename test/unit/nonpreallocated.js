/* @flow */

import test from "ava";

import { Unlimited } from "@capnp-js/base-arena";
import { Builder } from "@capnp-js/builder-arena";
import { int32 } from "@capnp-js/read-data";
import { root } from "@capnp-js/memory";

import nonpreallocated from "../../src/nonpreallocated";

test("struct `nonpreallocated`", t => {
  t.plan(13);

  const arena = Builder.fresh(120, new Unlimited());
  const ref = root(arena);

  arena.allocate(88);
  const local = arena.allocate(24);
  nonpreallocated(arena, ref, local, 0x00, (0x02<<16) | 0x01);
  t.is(int32(arena.segment(0).raw, 0), ((96-8)>>>1) | 0x00); // 3-2 = 1 for the shift
  t.is(int32(arena.segment(0).raw, 4), (0x02<<16) | 0x01);

  const far = arena.allocate(24);
  t.deepEqual(far.segment, arena.segment(1));

  // Single Far
  nonpreallocated(arena, ref, far, 0x00, (0x02<<16) | 0x01);
  // The landing pad goes right after the allocated bytes
  t.is(int32(arena.segment(0).raw, 0), 24 | 0x02); // 3-3 = 0 for the shift
  t.is(int32(arena.segment(0).raw, 4), 1);
  // The landing pad points back to the allocated bytes
  t.is(int32(arena.segment(1).raw, 24), ((-4)<<2) | 0x00);
  t.is(int32(arena.segment(1).raw, 28), (0x02<<16) | 0x01);

  // Double Far
  // Fill up segment 1 so that the landing pad goes on segment 2
  arena.allocate(arena.segment(1).raw.length - arena.segment(1).end);
  nonpreallocated(arena, ref, far, 0x00, (0x02<<16) | 0x01);
  // The landing pad goes at the front of segment 2
  t.is(int32(arena.segment(0).raw, 0), 0 | 0x04 | 0x02);
  t.is(int32(arena.segment(0).raw, 4), 2);
  // The landing pad pointers back to segment 1
  t.is(int32(arena.segment(2).raw, 0), 0 | 0x00 | 0x02);
  t.is(int32(arena.segment(2).raw, 4), 1);
  t.is(int32(arena.segment(2).raw, 8), 0x00);
  t.is(int32(arena.segment(2).raw, 12), (0x02<<16) | 0x01);
});

test("list `nonpreallocated`", t => {
  t.plan(13);

  const arena = Builder.fresh(120, new Unlimited());
  const ref = root(arena);

  arena.allocate(88);
  const local = arena.allocate(24);
  nonpreallocated(arena, ref, local, 0x01, (3<<3) | 0x05);
  t.is(int32(arena.segment(0).raw, 0), ((96-8)>>>1) | 0x01); // 3-2 = 1 for the shift
  t.is(int32(arena.segment(0).raw, 4), (3<<3) | 0x05);

  const far = arena.allocate(24);
  t.deepEqual(far.segment, arena.segment(1));

  // Single Far
  nonpreallocated(arena, ref, far, 0x01, (3<<3) | 0x05);
  // The landing pad goes right after the allocated bytes
  t.is(int32(arena.segment(0).raw, 0), 24 | 0x02); // 3-3 = 0 for the shift
  t.is(int32(arena.segment(0).raw, 4), 1);
  // The landing pad points back to the allocated bytes
  t.is(int32(arena.segment(1).raw, 24), ((-4)<<2) | 0x01);
  t.is(int32(arena.segment(1).raw, 28), (3<<3) | 0x05);

  // Double Far
  // Fill up segment 1 so that the landing pad goes on segment 2
  arena.allocate(arena.segment(1).raw.length - arena.segment(1).end);
  nonpreallocated(arena, ref, far, 0x01, (3<<3) | 0x05);
  // The landing pad goes at the front of segment 2
  t.is(int32(arena.segment(0).raw, 0), 0 | 0x04 | 0x02);
  t.is(int32(arena.segment(0).raw, 4), 2);
  // The landing pad pointers back to segment 1
  t.is(int32(arena.segment(2).raw, 0), 0 | 0x00 | 0x02);
  t.is(int32(arena.segment(2).raw, 4), 1);
  t.is(int32(arena.segment(2).raw, 8), 0x01);
  t.is(int32(arena.segment(2).raw, 12), (3<<3) | 0x05);
});
