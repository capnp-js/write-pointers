/* @flow */

import * as assert from "assert";
import { describe, it } from "mocha";

import { Unlimited } from "@capnp-js/base-arena";
import { Builder } from "@capnp-js/builder-arena";
import { int32 } from "@capnp-js/read-data";

import { root } from "@capnp-js/memory";
import preallocated from "../../src/preallocated";

describe("preallocated", function () {
  describe("struct", function () {
    const arena = Builder.fresh(32, new Unlimited());
    const ref = root(arena);
    const local = arena.allocate(32);
    assert.equal(local.segment.id, 0);

    it("encodes struct pointer locally if possible", function () {
      preallocated(ref, local, 0x00, (0x01<<16) | 0x03);
      assert.equal(int32(arena.segment(0).raw, 0), 0x00);
      assert.equal(int32(arena.segment(0).raw, 4), (0x01<<16) | 0x03);
    });

    it("encodes a far pointer landing pad immediately before the allocated object if non-local", function () {
      const far = arena.preallocate(32, local.segment);
      assert.equal(far.segment.id, 1);

      preallocated(ref, far, 0x00, (0x01<<16) | 0x03);
      assert.equal(int32(arena.segment(0).raw, 0), 0x02);
      assert.equal(int32(arena.segment(0).raw, 4), 1);
      assert.equal(int32(arena.segment(1).raw, 0), 0 | 0x00);
      assert.equal(int32(arena.segment(1).raw, 4), (0x01<<16) | 0x03);
    });
  });

  describe("list", function () {
    const arena = Builder.fresh(32, new Unlimited());
    const ref = root(arena);
    const local = arena.allocate(32);
    assert.equal(local.segment.id, 0);

    it("encodes list pointer locally if possible", function () {
      preallocated(ref, local, 0x01, 4 | 0x06);
      assert.equal(int32(arena.segment(0).raw, 0), 0 | 0x01);
      assert.equal(int32(arena.segment(0).raw, 4), 4 | 0x06);
    });

    it("encodes a far pointer landing pad immediately before the allocated object if non-local", function () {
      const far = arena.preallocate(32, local.segment);
      assert.equal(far.segment.id, 1);

      preallocated(ref, far, 0x01, 4 | 0x06);
      assert.equal(int32(arena.segment(0).raw, 0), 0x02);
      assert.equal(int32(arena.segment(0).raw, 4), 1);
      assert.equal(int32(arena.segment(1).raw, 0), 0 | 0x01);
      assert.equal(int32(arena.segment(1).raw, 4), 4 | 0x06);
    });
  });
});
