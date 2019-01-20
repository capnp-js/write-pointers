/* @flow */

import test from "ava";

import { Unlimited } from "@capnp-js/base-arena";
import { Builder } from "@capnp-js/builder-arena";
import { int32 } from "@capnp-js/read-data";

import { root } from "@capnp-js/memory";
import preallocated from "../../src/preallocated";

test("struct `preallocated`", t => {
  t.plan(6);

  const arena = Builder.fresh(32, new Unlimited());
  const ref = root(arena);

  const local = arena.allocate(32);
  preallocated(ref, local, 0x00, (0x01<<16) | 0x03);
  t.is(int32(arena.segment(0).raw, 0), 0x00);
  t.is(int32(arena.segment(0).raw, 4), (0x01<<16) | 0x03);

  const far = arena.preallocate(32, local.segment);
  preallocated(ref, far, 0x00, (0x01<<16) | 0x03);
  t.is(int32(arena.segment(0).raw, 0), 0x02);
  t.is(int32(arena.segment(0).raw, 4), 1);
  t.is(int32(arena.segment(1).raw, 0), 0 | 0x00);
  t.is(int32(arena.segment(1).raw, 4), (0x01<<16) | 0x03);
});

test("list `preallocated`", t => {
  t.plan(6);

  const arena = Builder.fresh(32, new Unlimited());
  const ref = root(arena);

  const local = arena.allocate(32);
  preallocated(ref, local, 0x01, 4 | 0x06);
  t.is(int32(arena.segment(0).raw, 0), 0 | 0x01);
  t.is(int32(arena.segment(0).raw, 4), 4 | 0x06);

  const far = arena.preallocate(32, local.segment);
  preallocated(ref, far, 0x01, 4 | 0x06);
  t.is(int32(arena.segment(0).raw, 0), 0x02);
  t.is(int32(arena.segment(0).raw, 4), 1);
  t.is(int32(arena.segment(1).raw, 0), 0 | 0x01);
  t.is(int32(arena.segment(1).raw, 4), 4 | 0x06);
});
