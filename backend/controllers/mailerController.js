const cron = require("node-cron");
const nodemailer = require("nodemailer");
const PiData = require("../models/pidata");

let profileCronRunning = false;
let paymentCronRunning = false;

// Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mishalnunu@gmail.com",
    pass: "qgwlzriynfzukuwy",
  },
});

// Function to send emails
const sendEmail = (email, quoteId, username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "Almost There! Finalize Your Virtuzone Registration",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="font-size: 16px; color: #000;">
          Hi ${username},<br><br>
          It looks like you reached the payment page but haven’t completed the process yet.<br>
          We’ve saved your details, and you’re just one step away from activating your professional services with Virtuzone.<br><br>
          <strong>
            <a href="https://ecommerce.yeepeey.com/onlinepayment/${quoteId}" target="_blank" style="color: #0000EE; text-decoration: underline;">
              Complete Your Payment
            </a>
          </strong><br><br>
          Need assistance? We’re happy to help!<br><br>
          Cheers,<br>
          The Virtuzone Team
        </p>
        <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
          <tbody>
            <tr>
              <td>
                <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color: #000000; width: 600px;" width="600">
                  <tbody>
                    <tr>
                      <td class="column column-1" width="100%" style="text-align: left; padding: 30px 20px; vertical-align: top;">
                        <table class="image_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="padding-bottom: 20px; text-align: center;">
                              <img src="https://res.cloudinary.com/dvekmmxxx/image/upload/v1718347384/photo_2024-06-14_11-46-14-removebg-preview_bml8en.png" style="max-width: 183px; width: 100%; height: auto; border: 0;" alt="Virtuzone Logo">
                            </td>
                          </tr>
                        </table>
                        <table class="social_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="text-align: center;">
                              <a href="https://www.facebook.com/virtuzone" target="_blank">
                                <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" alt="Facebook">
                              </a>
                              <a href="https://twitter.com/Virtuzone_UAE" target="_blank">
                                <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" alt="Twitter">
                              </a>
                              <a href="http://www.youtube.com/virtuzoneuae" target="_blank">
                                <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" alt="YouTube">
                              </a>
                              <a href="http://www.instagram.com/virtuzone" target="_blank">
                                <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" alt="Instagram">
                              </a>
                              <a href="http://www.linkedin.com/company/virtuzone" target="_blank">
                                <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" alt="LinkedIn">
                              </a>
                              <a href="https://www.vz.ae/" target="_blank">
                                <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" alt="Website">
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #000;">
                          <a href="https://g.page/virtuzone?share" style="color: #000; text-decoration: underline;" target="_blank">
                            Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>`
  };

  return transporter.sendMail(mailOptions);
};

cron.schedule("*/30 * * * * *", async () => {
  if (paymentCronRunning) {
    console.log("Payment cron job is already running. Skipping this iteration...");
    return;
  }

  paymentCronRunning = true;

  console.log("Running cron job to check payment status...");
  try {
    const unpaidRecords = await PiData.find({
      isPayment: false,
      isProcessing: { $ne: true },
      "quoteWithProductDetails.quoteEmail": { $exists: true } // Ensure email exists
    });

    console.log(`Found ${unpaidRecords.length} unpaid records.`);

    if (unpaidRecords.length === 0) {
      console.log("No pending payments found.");
      paymentCronRunning = false;
      return;
    }

    for (const record of unpaidRecords) {
      // Check if the record is still unpaid before processing
      if (record.isPayment) {
        console.log(`Record with ID ${record._id} has already been marked as paid. Skipping...`);
        continue;
      }

      const updatedRecord = await PiData.findOneAndUpdate(
        { _id: record._id, isPayment: false, isProcessing: { $ne: true } },
        { isProcessing: true },
        { new: true }
      );

      if (!updatedRecord) {
        console.log(`Record with ID ${record._id} was already processed or does not exist.`);
        continue;
      }

      const { quoteWithProductDetails, leadWithDetails, quotePaymentWithDetails } = updatedRecord;
      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName} ${leadWithDetails?.LastName}`;

      if (email) {
        try {
          // Send payment email only if it's still unpaid
          await sendEmail(email, quoteId, username);
          console.log(`Payment email sent to ${email} for Quote ID: ${quoteId}`);

          // Mark the record as processed immediately after sending the email
          await PiData.findByIdAndUpdate(
            record._id,
            { isPayment: true, isProcessing: false },
            { new: true }
          );
        } catch (error) {
          console.error(`Error sending payment email to ${email}:`, error);
          await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
        }
      } else {
        console.log(`No email found for Quote ID: ${quoteId}`);
        await PiData.findByIdAndUpdate(record._id, { isProcessing: false });
      }
    }
  } catch (error) {
    console.error("Error while running the payment cron job:", error);
  } finally {
    paymentCronRunning = false;
  }
});



// Profile Completion Cron Job
cron.schedule("*/30 * * * * *", async () => {
  if (profileCronRunning) {
    console.log("Profile cron job is already running. Skipping this iteration...");
    return;
  }

  profileCronRunning = true;

  console.log("Running cron job to check profile completion...");
  try {
    const incompleteProfiles = await PiData.find({
      isProfileCompleted: false,
      isProcessing: { $ne: true }, // Ensure the record is not already being processed
    });

    if (incompleteProfiles.length === 0) {
      console.log("No incomplete profiles found.");
      profileCronRunning = false;
      return;
    }

    for (const record of incompleteProfiles) {
      const updatedRecord = await PiData.findOneAndUpdate(
        { _id: record._id, isProfileCompleted: false, isProcessing: { $ne: true } },
        { isProcessing: true },
        { new: true }
      );

      if (!updatedRecord) continue;

      const { quoteWithProductDetails, leadWithDetails } = updatedRecord;

      const email = quoteWithProductDetails?.quoteEmail;
      const username = `${leadWithDetails?.FirstName} ${leadWithDetails?.LastName}`;

      if (email) {
        try {
          await sendProfileEmail(email, record._id, username);
          console.log(`Profile completion email sent to ${email} for Record ID: ${record._id}`);

          await PiData.findByIdAndUpdate(
            record._id,
            { isProfileCompleted: true, isProcessing: false },
            { new: true }
          );
        } catch (error) {
          console.error(`Error sending profile completion email to ${email}:`, error);

          await PiData.findByIdAndUpdate(
            record._id,
            { isProcessing: false },
            { new: true }
          );
        }
      } else {
        console.log(`No email found for Record ID: ${record._id}`);

        await PiData.findByIdAndUpdate(
          record._id,
          { isProcessing: false },
          { new: true }
        );
      }
    }
  } catch (error) {
    console.error("Error while running the profile completion cron job:", error);
  } finally {
    profileCronRunning = false;
  }
});

const sendProfileEmail = (email, recordId, username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "Complete Your Virtuzone Profile",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="font-size: 16px; color: #000;">
          Hi ${username},<br><br>
          We noticed that your profile is almost complete, but there are a few details left to finish.<br>
          Please click the link below to finalize your profile and get started with Virtuzone services.<br><br>
          <strong>
            <a href="https://ecommerce.yeepeey.com/profile/${recordId}" target="_blank" style="color: #0000EE; text-decoration: underline;">
              Complete Your Profile
            </a>
          </strong><br><br>
          We’re happy to assist if needed!<br><br>
          Cheers,<br>
          The Virtuzone Team
        </p>
      </div>`
  };

  return transporter.sendMail(mailOptions);
};
