/* @flow */

//TODO: Test level incrementing on guts
import * as assert from "assert";
import { int32 } from "@capnp-js/read-data";
import { describe, it } from "mocha";

import { singleHop, doubleHop } from "../../src/far";

describe("singleHop", function () {
  const segment = { id: 0, raw: new Uint8Array(8), end: 8 };
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

  it("writes a single hop far-pointer", function () {
    singleHop(ref, land);

    assert.equal(int32(ref.segment.raw, 0), 120 | 0x02);
    assert.equal(int32(ref.segment.raw, 4), 21);
  });
});

describe("doubleHop", function () {
  const segment = { id: 0, raw: new Uint8Array(8), end: 8 };
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

  it("writes a double hop far-pointer", function () {
    doubleHop(ref, land);

    assert.equal(int32(ref.segment.raw, 0), 120 | 0x06);
    assert.equal(int32(ref.segment.raw, 4), 21);
  });
});
