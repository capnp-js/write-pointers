/* @flow */

import * as assert from "assert";
import { int32 } from "@capnp-js/read-data";
import { describe, it } from "mocha";

import cap from "../../src/cap";

describe("cap", function () {
  const segment = { id: 0, raw: new Uint8Array(8), end: 8 };
  const ref = {
    segment,
    position: 0,
  };

  cap(0x12345678, ref);

  it("writes a capability pointer", function () {
    assert.equal(int32(segment.raw, 0), 0x03);
    assert.equal(int32(segment.raw, 4), 0x12345678);
  });
});
