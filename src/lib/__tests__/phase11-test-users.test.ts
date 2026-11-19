import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";

test("Phase 11: Test Users & Login Flexibility Verification", async (t) => {
  await t.test("loginSchema accepts full emails and shorthand usernames", () => {
    // Full emails
    assert.equal(loginSchema.safeParse({ email: "admin1@livinghope.org", password: "Super@Password1212" }).success, true);
    assert.equal(loginSchema.safeParse({ email: "brightnerone@livinghope.org", password: "AdomNhyira10" }).success, true);

    // Shorthand usernames
    assert.equal(loginSchema.safeParse({ email: "brightnerone", password: "AdomNhyira10" }).success, true);
    assert.equal(loginSchema.safeParse({ email: "brightnertwo", password: "AdomNhyira10" }).success, true);
    assert.equal(loginSchema.safeParse({ email: "admin1", password: "Super@Password1212" }).success, true);

    // Empty fields rejected
    assert.equal(loginSchema.safeParse({ email: "", password: "AdomNhyira10" }).success, false);
    assert.equal(loginSchema.safeParse({ email: "brightnerone", password: "" }).success, false);
  });

  await t.test("bcrypt verification matches requested test user passwords", async () => {
    const adminPassword = "Super@Password1212";
    const contributorPassword = "AdomNhyira10";

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const contributorHash = await bcrypt.hash(contributorPassword, 10);

    assert.equal(await bcrypt.compare(adminPassword, adminHash), true);
    assert.equal(await bcrypt.compare("WrongPassword", adminHash), false);

    assert.equal(await bcrypt.compare(contributorPassword, contributorHash), true);
    assert.equal(await bcrypt.compare("WrongPassword", contributorHash), false);
  });
});
