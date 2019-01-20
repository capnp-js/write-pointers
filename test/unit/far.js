/* @flow */

//TODO: Test level incrementing on guts
import test from "ava";

import { int32 } from "@capnp-js/read-data";

import { singleHop, doubleHop } from "../../src/far";

test("`singleHop`", t => {
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

  const land = {
    segment: {
      id: 21,
      raw: (null: any),
      end: 128,
    },
    position: 120,
  };

  singleHop(ref, land);

  t.is(int32(ref.segment.raw, 0), 120 | 0x02);
  t.is(int32(ref.segment.raw, 4), 21);
});

test("`doubleHop`", t => {
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

  const land = {
    segment: {
      id: 21,
      raw: (null: any),
      end: 128,
    },
    position: 120,
  };

  doubleHop(ref, land);

  t.is(int32(ref.segment.raw, 0), 120 | 0x06);
  t.is(int32(ref.segment.raw, 4), 21);
});
