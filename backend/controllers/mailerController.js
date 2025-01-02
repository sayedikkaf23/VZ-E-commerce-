const cron = require("node-cron");
const nodemailer = require("nodemailer");
const PiData = require("./models/pidata"); // Adjust path if needed

// Flags to prevent overlapping runs
let profileCronRunning = false;
let paymentCronRunning = false;

// 1) Create Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mishalnunu@gmail.com",
    pass: "qgwlzriynfzukuwy", // Use your app password here
  },
});

// 2) Payment Reminder Email Function
const sendPaymentEmail = (email, quoteId, username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "Almost There! Finalize Your Virtuzone Registration",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="font-size: 16px; color: #000;">
          Hi ${username},<br><br>
          It looks like you reached the payment page but haven’t completed the process yet.<br>
          We’ve saved your details, and you’re just one step away from activating your professional services with Virtuzone.<br><br>
          <strong>
            <a href="https://ecommerce.yeepeey.com/onlinepayment/${quoteId}" 
               target="_blank" style="color: #0000EE; text-decoration: underline;">
              Complete Your Payment
            </a>
          </strong><br><br>
          Need assistance? We’re happy to help!<br><br>
          Cheers,<br>
          The Virtuzone Team
        </p>
        <!-- Additional branding, social icons, etc. -->
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// 3) Profile Reminder Email Function
const sendProfileEmail = (email, recordId, username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "Complete Your Virtuzone Profile",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="font-size: 16px; color: #000;">
          Hi ${username},<br><br>
          We noticed that your profile is almost complete, but there are a few details left to finish.<br>
          Please click the link below to finalize your profile and get started with Virtuzone services.<br><br>
          <strong>
            <a href="https://ecommerce.yeepeey.com/profile/${recordId}" 
               target="_blank" style="color: #0000EE; text-decoration: underline;">
              Complete Your Profile
            </a>
          </strong><br><br>
          We’re happy to assist if needed!<br><br>
          Cheers,<br>
          The Virtuzone Team
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

///////////////////////////////////////////////////////////////////////////////
// Payment Reminder Cron (runs every 30 seconds)
///////////////////////////////////////////////////////////////////////////////
cron.schedule("*/30 * * * * *", async () => {
  if (paymentCronRunning) {
    console.log("Payment cron job is already running. Skipping this iteration...");
    return;
  }
  paymentCronRunning = true;
  console.log("Running cron job to check payment status...");

  try {
    // 1. Find records that are unpaid + haven't been reminded yet + not in processing
    const unpaidRecords = await PiData.find({
      isPayment: false,
      isPaymentReminderSent: false,
      isProcessing: { $ne: true },
      "quoteWithProductDetails.quoteEmail": { $exists: true },
    });

    console.log(
      `Found ${unpaidRecords.length} unpaid records that have not been sent a reminder.`
    );

    if (unpaidRecords.length === 0) {
      paymentCronRunning = false;
      return;
    }

    // 2. Process each record
    for (const record of unpaidRecords) {
      const updatedRecord = await PiData.findOneAndUpdate(
        {
          _id: record._id,
          isPayment: false,
          isPaymentReminderSent: false,
          isProcessing: { $ne: true },
        },
        { isProcessing: true },
        { new: true }
      );

      // If it doesn't exist or was already grabbed, skip
      if (!updatedRecord) {
        console.log(
          `Record with ID ${record._id} was already processed or does not exist.`
        );
        continue;
      }

      const { quoteWithProductDetails, leadWithDetails, quotePaymentWithDetails } =
        updatedRecord;
      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName} ${leadWithDetails?.LastName}`;

      if (!email) {
        console.log(`No email found for Record ID: ${record._id}`);
        // Unblock if there's no email
        await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
        continue;
      }

      try {
        // Double-check if still unpaid
        const stillUnpaid = await PiData.findOne({
          _id: record._id,
          isPayment: false,
        });

        if (!stillUnpaid) {
          console.log(`Record ${record._id} is no longer unpaid.`);
          await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
          continue;
        }

        // Send the payment reminder
        await sendPaymentEmail(email, quoteId, username);
        console.log(`Payment email sent to ${email} for Quote ID: ${quoteId}`);

        // Mark only the reminder as sent
        await PiData.findByIdAndUpdate(record._id, {
          isPaymentReminderSent: true,
          isProcessing: false,
        });
      } catch (error) {
        console.error(`Error sending payment email to ${email}:`, error);
        // Unset processing on error
        await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
      }
    }
  } catch (error) {
    console.error("Error while running the payment cron job:", error);
  } finally {
    paymentCronRunning = false;
  }
});

///////////////////////////////////////////////////////////////////////////////
// Profile Reminder Cron (runs every 10 seconds)
///////////////////////////////////////////////////////////////////////////////
cron.schedule("*/10 * * * * *", async () => {
  if (profileCronRunning) {
    console.log("Profile cron job is already running. Skipping this iteration...");
    return;
  }
  profileCronRunning = true;
  console.log("Running cron job to check profile status...");

  try {
    // 1. Find records that have NOT completed their profile + haven't been reminded + not processing
    const incompleteProfiles = await PiData.find({
      isProfile: false,            // <--- Still incomplete
      isProfileReminderSent: false, // <--- No reminder yet
      isProcessing: { $ne: true },
    });

    if (incompleteProfiles.length === 0) {
      console.log("No incomplete profiles found that need a reminder.");
      profileCronRunning = false;
      return;
    }

    // 2. Process each incomplete profile
    for (const record of incompleteProfiles) {
      const updatedRecord = await PiData.findOneAndUpdate(
        {
          _id: record._id,
          isProfile: false,
          isProfileReminderSent: false,
          isProcessing: { $ne: true },
        },
        { isProcessing: true },
        { new: true }
      );

      if (!updatedRecord) continue;

      const { quoteWithProductDetails, leadWithDetails } = updatedRecord;
      const email = quoteWithProductDetails?.quoteEmail;
      const username = `${leadWithDetails?.FirstName} ${leadWithDetails?.LastName}`;

      if (!email) {
        console.log(`No email found for Record ID: ${record._id}`);
        // Unblock if there's no email
        await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
        continue;
      }

      try {
        // Double-check if still incomplete (maybe user just completed it)
        const stillIncomplete = await PiData.findOne({
          _id: record._id,
          isProfile: false,
        });

        if (!stillIncomplete) {
          console.log(`Record ${record._id} is no longer incomplete.`);
          await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
          continue;
        }

        // Send the profile reminder
        await sendProfileEmail(email, record._id, username);
        console.log(
          `Profile completion email sent to ${email} for Record ID: ${record._id}`
        );

        // Mark only the reminder as sent
        await PiData.findByIdAndUpdate(record._id, {
          isProfileReminderSent: true,
          isProcessing: false,
        });
      } catch (error) {
        console.error(`Error sending profile completion email to ${email}:`, error);
        await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
      }
    }
  } catch (error) {
    console.error("Error while running the profile completion cron job:", error);
  } finally {
    profileCronRunning = false;
  }
});
