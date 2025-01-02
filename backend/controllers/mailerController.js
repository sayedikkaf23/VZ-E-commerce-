const cron = require("node-cron");
const nodemailer = require("nodemailer");
const PiData =  require("../models/pidata");

// -------------------- EMAIL CONFIG --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mishalnunu@gmail.com",
    pass: "qgwlzriynfzukuwy",
  },
});

// -------------------- PAYMENT EMAIL BODY (unchanged) --------------------
const sendPaymentEmail = (email, quoteId, username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "Almost There! Finalize Your Virtuzone Registration",
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
      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
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
    </div>
    </div>`,
  };

  return transporter.sendMail(mailOptions);
};

// -------------------- PROFILE EMAIL BODY (unchanged) --------------------
const sendProfileEmail = (email, quoteId, username) => {
  const mailOptions = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "Complete Your Registration and Get Started!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="font-size: 16px; color: #000;">
          Hi ${username},<br><br>

          We noticed you started the registration process but haven’t completed it yet. Finish your registration today to access personalized professional services and expert guidance.<br><br>

          If you need help, our team is here for you.<br><br>

          Best regards,<br>
          The Virtuzone Team
        </p>

        <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
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
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// ------------------------------------------------------
// 4) Payment Cron - runs every 45 seconds
// ------------------------------------------------------
cron.schedule("*/55 * * * * *", async () => {
  console.log("Payment Cron (every 45s) checking for unsent Payment Emails...");

  try {
    // 1) Find records where user hasn't paid yet (isPayment=false)
    //    AND we haven't sent the payment email yet (isPaymentEmailSent=false)
    const unpaidRecords = await PiData.find({
      isPayment: false,
      isPaymentEmailSent: false,
    });

    if (!unpaidRecords.length) {
      console.log("No Payment Reminders needed at this time.");
      return;
    }

    for (const record of unpaidRecords) {
      const { quoteWithProductDetails, quotePaymentWithDetails, leadWithDetails } = record;

      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName || ""} ${leadWithDetails?.LastName || ""}`.trim();

      if (!email) {
        console.log(`Record ${record._id} missing email - skipping Payment email`);
        continue;
      }

      // Send Payment Email
      await sendPaymentEmail(email, quoteId, username);
      console.log(`Payment email sent to ${email} - record: ${record._id}`);

      // Mark "payment email" as sent to avoid duplicates
      record.isPaymentEmailSent = true;
      await record.save();
      console.log(
        `Updated isPaymentEmailSent = true for record ${record._id} to avoid duplicates.`
      );
    }
  } catch (error) {
    console.error("Error in Payment Cron job:", error);
  }
});

// ------------------------------------------------------
// 5) Profile Cron - runs every 30 seconds
// ------------------------------------------------------
cron.schedule("*/30 * * * * *", async () => {
  console.log("Profile Cron (every 30s) checking for unsent Profile Emails...");

  try {
    // 1) Find records where user hasn't completed profile yet (isProfile=false)
    //    AND we haven't sent the profile email (isProfileEmailSent=false)
    //    AND the user HAS paid (isPayment=true) to avoid sending both at once
    const incompleteRecords = await PiData.find({
      isProfile: false,
      isProfileEmailSent: false,
      isPayment: true, // Only send if user has paid
    });

    if (!incompleteRecords.length) {
      console.log("No Profile Reminders needed at this time.");
      return;
    }

    for (const record of incompleteRecords) {
      const { quoteWithProductDetails, quotePaymentWithDetails, leadWithDetails } = record;

      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName || ""} ${leadWithDetails?.LastName || ""}`.trim();

      if (!email) {
        console.log(`Record ${record._id} missing email - skipping Profile email`);
        continue;
      }

      // Send Profile Email
      await sendProfileEmail(email, quoteId, username);
      console.log(`Profile email sent to ${email} - record: ${record._id}`);

      // Mark "profile email" as sent to avoid duplicates
      record.isProfileEmailSent = true;
      await record.save();
      console.log(
        `Updated isProfileEmailSent = true for record ${record._id} to avoid duplicates.`
      );
    }
  } catch (error) {
    console.error("Error in Profile Cron job:", error);
  }
});