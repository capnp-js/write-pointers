/* @flow */

import test from "ava";

import { int32 } from "@capnp-js/read-data";

import cap from "../../src/cap";

test("`cap`", t => {
  t.plan(2);

  const segment = {
    id: 0,
    raw: new Uint8Array(8),
    end: 8,
  };

  const ref = {
    segment,
    position: 0,
  };

  cap(0x12345678, ref);

  t.is(int32(segment.raw, 0), 0x03);
  t.is(int32(segment.raw, 4), 0x12345678);
});
