export const queuesConstants = {
  defaultQueue: {
    name: "EXAMPLE_CREATE",
    jobNames: {
      updateOne: "UPDATE_ONE",
      createOne: "CREATE_ONE",
    },
  },
  emailQueue: {
    name: "email-queue",
    jobNames: {
      sendEmail: "SEND_EMAIL",
      sendWelcomeEmail: "SEND_WELCOME_EMAIL",
      sendPasswordResetEmail: "SEND_PASSWORD_RESET_EMAIL",
      sendOtpEmail: "SEND_OTP_EMAIL",
    },
  },
};
