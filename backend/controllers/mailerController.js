const cron = require("node-cron");
const nodemailer = require("nodemailer");
const PiData = require("../models/pidata");

// Email Configuration
const transporter = nodemailer.createTransport({

  service: "gmail",
  auth: {
    user: "mishalnunu@gmail.com",
    pass: "qgwlzriynfzukuwy",
  },
});

// Function to send emails
const sendEmail = (email, quoteId,username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "You’re Almost There – Finalize Your Virtuzone Registration!",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
     
   
      
      
 <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
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
      </div>
    
    
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
                          <img src="https://res.cloudinary.com/dotkngkpl/image/upload/v1739944226/thumbnail_vz-ascentium_1_yrtbkn.png" style="max-width: 183px; width: 100%; height: auto; border: 0;" alt="Virtuzone Logo">
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


</div>
      </div>`,
  };

  return transporter.sendMail(mailOptions);
};

// 3) Payment Cron (runs every 30s)
cron.schedule("*/10 * * * *", async () => {
  // console.log("Payment Cron: Checking for records to send Payment email...");

  try {
    // Example: only pick records older than 1 minute
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find all records that STILL need payment email
    const unpaidRecords = await PiData.find({
      isPayment: false,
      isPaymentEmailSent: false,
       createdAt: { $lte: oneHourAgo },  // only records created 1 hour ago or earlier

    });

    if (!unpaidRecords.length) {
      // console.log("No pending payments found at this time.");
      return;
    }

    for (const record of unpaidRecords) {
      const { quoteWithProductDetails, leadWithDetails, quotePaymentWithDetails } = record;

      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName || ""} ${
        leadWithDetails?.LastName || ""
      }`.trim();

      if (!email) {
        // console.log(`Record ${record._id} has no email, skipping Payment email.`);
        continue;
      }

      // ---------- ATOMIC UPDATE (Lock) ----------
      // If isPaymentEmailSent is still false, set it to true.
      // If some other process beat us to it, 'updatedDoc' will be null.
      const updatedDoc = await PiData.findOneAndUpdate(
        { _id: record._id, isPaymentEmailSent: false },
        { isPaymentEmailSent: true },
        { new: true }
      );

      if (!updatedDoc) {
        // console.log(
        //   `Record ${record._id} was already updated by another process. Skipping.`
        // );
        continue;
      }

      // If we get here, we have exclusive "right" to send the email.
      await sendEmail(email, quoteId, username);
      console.log(`Payment Email sent to ${email} for record ${record._id}`);

      // (Optional) you might also set 'isPayment' = true if you never want to send again,
      // but that depends on your business logic. For repeated reminders, keep isPayment = false.
    }
  } catch (error) {
    console.error("Error in Payment Cron:", error);
  }
});



const sendProfileEmail = (email, quoteId, username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "We Miss You - Complete Your Virtuzone Registration!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="font-size: 16px; color: #000;">
          Hi ${username},<br><br>

         We noticed you started your journey with Virtuzone but haven’t completed it yet. We get it – other priorities get in the way. Let us help you with the nitty gritty, so you can focus on the bigger picture!<br>
Don’t worry – we’ve saved all your details so you can pick up right where you left off.
<br><br>

        

         Need assistance? We’re happy to help!<br><br>

          Best regards,<br>
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
                          <img src="https://res.cloudinary.com/dotkngkpl/image/upload/v1739944226/thumbnail_vz-ascentium_1_yrtbkn.png" style="max-width: 183px; width: 100%; height: auto; border: 0;" alt="Virtuzone Logo">
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
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Cron Job to Check incomplete registrations (isProfile: false)
cron.schedule("*/10 * * * *", async () => {
  // console.log("Running Profile Cron to check profile completion status...");

  try {
    // Only process records older than 1 minute (optional time filter)
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);


    // Find all incomplete profiles that haven't had the profile email sent yet
    // and are older than 1 minute (optional).
    const incompleteProfiles = await PiData.find({
      $and: [
        { isProfile: false },
        {  isPayment: false, },
        { isProfileEmailSent: false },
             { createdAt: { $lte: oneDayAgo } }, // older than 1 day

      ],
    });

    if (incompleteProfiles.length === 0) {
      console.log("No incomplete registrations found.");
      return;
    }

    for (const record of incompleteProfiles) {
      const { quoteWithProductDetails, quotePaymentWithDetails, leadWithDetails } = record;

      // Extract data
      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName || ""} ${leadWithDetails?.LastName || ""}`.trim();

      if (!email) {
        // console.log(`Record ${record._id} has no email - skipping profile reminder.`);
        continue;
      }

      // ---------------- ATOMIC UPDATE ----------------
      // Check if this record still has isProfileEmailSent=false
      // If so, set it to true. If another process already did this, you'll get null.
      const updatedDoc = await PiData.findOneAndUpdate(
        { _id: record._id, isProfileEmailSent: false },
        { isProfileEmailSent: true },
        { new: true }
      );

      if (!updatedDoc) {
        // Means another process or iteration already updated isProfileEmailSent
        // console.log(`Record ${record._id} was already updated by another process. Skipping.`);
        continue;
      }

      // We have the "lock", so it's safe to send the email now
      await sendProfileEmail(email, quoteId, username);
      // console.log(`Profile completion reminder email sent to ${email} for record ${record._id}`);

      // If you want to mark them as having completed their profile
      // you can also set isProfile = true if your business logic requires that
      updatedDoc.isProfile = true;
      await updatedDoc.save();

      // console.log(`Marked record ${updatedDoc._id} as isProfile=true and isProfileEmailSent=true.`);
    }
  } catch (error) {
    console.error("Error while running the profile cron job:", error);
  }
});