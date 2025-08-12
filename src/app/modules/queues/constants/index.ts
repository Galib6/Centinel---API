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

const getQueueName = (_queuesConstant): string[] => {
  const queues = [];
  Object.entries(queuesConstants).forEach((each) => {
    queues.push(each[1].name);
  });
  return queues;
};

export const queueNames: string[] = getQueueName(queuesConstants);

export const defaultJobOptions = {
  attempts: 5, // Number of retry attempts
  backoff: {
    type: "exponential", // every retries it will wait exponential at delay time
    delay: 5000, // Delay in milliseconds
  },
};
