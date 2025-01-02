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


</div>
      </div>`,
  };

  return transporter.sendMail(mailOptions);
};

// Cron Job to Check Payments
cron.schedule("*/30 * * * * *", async () => {
  console.log("Running cron job to check payment status...");
  try {
    // Find unpaid records
    const unpaidRecords = await PiData.find({
      isPayment: false,
      isProcessing: { $ne: true }, // Ensure not being processed
    });

    if (unpaidRecords.length === 0) {
      console.log("No pending payments found.");
      return;
    }

    for (const record of unpaidRecords) {
      // Mark record as processing
      const updatedRecord = await PiData.findOneAndUpdate(
        { _id: record._id, isPayment: false, isProcessing: { $ne: true } }, // Ensure record is not processed
        { isProcessing: true }, // Update flag
        { new: true }
      );

      if (!updatedRecord) continue; // Skip if already being processed

      const { quoteWithProductDetails, leadWithDetails, quotePaymentWithDetails } = updatedRecord;

      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName} ${leadWithDetails?.LastName}`;

      if (email) {
        try {
          // Send the payment email
          await sendEmail(email, quoteId, username);
          console.log(`Payment email sent to ${email} for Quote ID: ${quoteId}`);

          // Update flags
          updatedRecord.isPayment = true;
          updatedRecord.isProcessing = false; // Reset processing flag
          await updatedRecord.save();
        } catch (error) {
          console.error(`Error sending payment email to ${email}:`, error);
          updatedRecord.isProcessing = false; // Reset processing flag on error
          await updatedRecord.save();
        }
      } else {
        console.log(`No email found for Quote ID: ${quoteId}`);
        updatedRecord.isProcessing = false; // Reset processing flag
        await updatedRecord.save();
      }
    }
  } catch (error) {
    console.error("Error while running the payment cron job:", error);
  }
});





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
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Cron Job to Check incomplete registrations (isProfile: false)
cron.schedule("*/10 * * * * *", async () => {
  console.log("Running cron job to check profile completion status...");
  try {
    // Find records with incomplete profiles
    const incompleteProfiles = await PiData.find({
      isProfile: false,
      isProcessing: { $ne: true }, // Ensure not being processed
    });

    if (incompleteProfiles.length === 0) {
      console.log("No incomplete registrations found.");
      return;
    }

    for (const record of incompleteProfiles) {
      // Mark record as processing
      const updatedRecord = await PiData.findOneAndUpdate(
        { _id: record._id, isProfile: false, isProcessing: { $ne: true } }, // Ensure record is not processed
        { isProcessing: true }, // Update flag
        { new: true }
      );

      if (!updatedRecord) continue; // Skip if already being processed

      const { quoteWithProductDetails, leadWithDetails, quotePaymentWithDetails } = updatedRecord;

      const email = quoteWithProductDetails?.quoteEmail;
      const quoteId = quotePaymentWithDetails?.QuotePaymentId;
      const username = `${leadWithDetails?.FirstName} ${leadWithDetails?.LastName}`;

      if (email) {
        try {
          // Send the profile completion email
          await sendProfileEmail(email, quoteId, username);
          console.log(`Profile email sent to ${email} for Quote ID: ${quoteId}`);

          // Update flags
          updatedRecord.isProfile = true;
          updatedRecord.isProcessing = false; // Reset processing flag
          await updatedRecord.save();
        } catch (error) {
          console.error(`Error sending profile email to ${email}:`, error);
          updatedRecord.isProcessing = false; // Reset processing flag on error
          await updatedRecord.save();
        }
      } else {
        console.log(`No email found for Quote ID: ${quoteId}`);
        updatedRecord.isProcessing = false; // Reset processing flag
        await updatedRecord.save();
      }
    }
  } catch (error) {
    console.error("Error while running the profile cron job:", error);
  }
});
