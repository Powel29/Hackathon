import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

/**
 * Initialize the RecaptchaVerifier
 * @param {string} elementId - The ID of the DOM element (e.g., button) to attach the Recaptcha to.
 * @returns {RecaptchaVerifier} The initialized RecaptchaVerifier instance.
 */
export const setupRecaptcha = (elementId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("Recaptcha solved");
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log("Recaptcha expired");
      },
      'defaultCountry': "IN"
    });
  }
  return window.recaptchaVerifier;
};

/**
 * Send OTP to the provided phone number using the initialized RecaptchaVerifier.
 * @param {string} phoneNumber - The phone number to send the OTP to (e.g., "+1234567890").
 * @returns {Promise<ConfirmationResult>} A promise that resolves with the verification ID (confirmationResult).
 */
export const sendOtp = (phoneNumber) => {
  const appVerifier = window.recaptchaVerifier;

  if (!appVerifier) {
    throw new Error("Recaptcha Verifier is not initialized. Call setupRecaptcha first.");
  }

  // Format phone number: ensure it starts with +, default to +91 if just 10 digits
  const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

  return signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
    .then((confirmationResult) => {
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).
      window.confirmationResult = confirmationResult;
      return confirmationResult;
    }).catch((error) => {
      // Error; SMS not sent
      console.error("Error sending OTP:", error);
      throw error;
    });
};

/**
 * Verify the OTP code entered by the user.
 * @param {string} code - The OTP code entered by the user.
 * @returns {Promise<UserCredential>} A promise that resolves with the UserCredential.
 */
export const verifyOtp = (code) => {
  if (!window.confirmationResult) {
    throw new Error("No confirmation result found. OTP was not sent or session expired.");
  }
  return window.confirmationResult.confirm(code);
};