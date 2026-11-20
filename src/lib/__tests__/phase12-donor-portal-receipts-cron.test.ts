import test from "node:test";
import assert from "node:assert/strict";
import { updateDonorProfileSchema, changePasswordSchema } from "@/lib/validations";
import { normalizeGhanaPhoneNumber, sendSmsNotification } from "@/lib/sms";

test("Phase 12: Donor Profile, Receipts, and SMS Engine Verification", async (t) => {
  await t.test("updateDonorProfileSchema validates donor names and phone numbers", () => {
    // Valid input
    const valid = updateDonorProfileSchema.safeParse({
      name: "Kwame Mensah",
      phone: "+233241234567",
    });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.name, "Kwame Mensah");
      assert.equal(valid.data.phone, "+233241234567");
    }

    // Valid without optional phone
    const validNoPhone = updateDonorProfileSchema.safeParse({
      name: "Akosua Frimpong",
      phone: "",
    });
    assert.equal(validNoPhone.success, true);

    // Reject too short name
    const invalidName = updateDonorProfileSchema.safeParse({
      name: "A",
    });
    assert.equal(invalidName.success, false);
  });

  await t.test("changePasswordSchema validates password length and confirmation match", () => {
    // Valid password change
    const valid = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123",
      newPassword: "NewSecretPassword123!",
      confirmPassword: "NewSecretPassword123!",
    });
    assert.equal(valid.success, true);

    // Reject mismatched passwords
    const mismatch = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123",
      newPassword: "NewSecretPassword123!",
      confirmPassword: "DifferentPassword123!",
    });
    assert.equal(mismatch.success, false);

    // Reject too short password (<8 chars)
    const tooShort = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123",
      newPassword: "short",
      confirmPassword: "short",
    });
    assert.equal(tooShort.success, false);
  });

  await t.test("normalizeGhanaPhoneNumber formats standard local numbers to E.164", () => {
    // 10-digit leading zero -> +233
    assert.equal(normalizeGhanaPhoneNumber("0241234567"), "+233241234567");
    assert.equal(normalizeGhanaPhoneNumber("055 987 6543"), "+233559876543");
    assert.equal(normalizeGhanaPhoneNumber("(020) 111-2233"), "+233201112233");

    // 12-digit without plus -> +233
    assert.equal(normalizeGhanaPhoneNumber("233241234567"), "+233241234567");

    // Already E.164 with plus
    assert.equal(normalizeGhanaPhoneNumber("+233241234567"), "+233241234567");
    assert.equal(normalizeGhanaPhoneNumber("+14155552671"), "+14155552671");
  });

  await t.test("sendSmsNotification safely logs when external gateway keys are omitted", async () => {
    const result = await sendSmsNotification({
      to: "0241234567",
      message: "Test message from LivingHope test suite",
    });
    assert.equal(result.success, true);
    assert.ok(result.messageId);
  });
});
