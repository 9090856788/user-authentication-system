import test from "node:test";
import assert from "node:assert/strict";
import { requireAdmin } from "../middlewares/authMiddleware.js";

test("Admin Authorization & Protection Rules", async (t) => {
  await t.test("requireAdmin middleware rejects non-admin users with 403", (context, done) => {
    const regularUserReq = {
      user: { _id: "usr_regular", role: "user" },
    };
    const res = {};
    const next = (err) => {
      assert.ok(err, "Middleware should pass an error");
      assert.equal(err.statusCode, 403, "Status code must be 403 Forbidden");
      assert.match(err.message, /Administrator privileges required/);
      done();
    };

    requireAdmin(regularUserReq, res, next);
  });

  await t.test("requireAdmin middleware permits users with admin role", (context, done) => {
    const adminReq = {
      user: { _id: "usr_admin", role: "admin" },
    };
    const res = {};
    const next = (err) => {
      assert.equal(err, undefined, "No error should be passed for admin users");
      done();
    };

    requireAdmin(adminReq, res, next);
  });

  await t.test("requireAdmin middleware rejects unauthenticated requests with 401", (context, done) => {
    const emptyReq = {};
    const res = {};
    const next = (err) => {
      assert.ok(err, "Middleware should pass an error");
      assert.equal(err.statusCode, 401, "Status code must be 401 Unauthorized");
      done();
    };

    requireAdmin(emptyReq, res, next);
  });
});
