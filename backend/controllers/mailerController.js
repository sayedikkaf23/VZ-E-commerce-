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
     
   
      
      
    <p style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; color: #000;">
        Hi ${username},<br><br>
        Welcome to Virtuzone! 🎉 Thank you for signing up.<br><br>
        As part of Virtuzone, you’ll have access to:<br>
        <ul>
            <li><strong>Expert Professional Services:https://ecommerce.yeepeey.com/onlinepayment/${quoteId}
            <li><strong>Seamless Onboarding Process</strong></li>
            <li><strong>Dedicated Support Team</strong></li>
        </ul><br>
        We’re here to guide you through every step.<br><br>
        If you need assistance, feel free to reach out.<br><br>
        Best regards,<br>
        <strong>The Virtuzone Team</strong><br>
     
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
      </div>`,
  };

  return transporter.sendMail(mailOptions);
};

// Cron Job to Check Payments
cron.schedule("*/5 * * * *", async () => {
  console.log("Running cron job to check payment status...");
  try {
    // Current time minus 20 minutes
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

    // Find records where payment is not done and createdAt is older than 20 minutes
    const unpaidRecords = await PiData.find({
      isPayment: false,
      createdAt: { $lte: twentyMinutesAgo },
    });

    if (unpaidRecords.length === 0) {
      console.log("No pending payments older than 20 minutes.");
      return;
    }

    for (const record of unpaidRecords) {
        const { quoteWithProductDetails, leadWithDetails } = record;
        
        const email = quoteWithProductDetails?.quoteEmail;
        const quoteId = quoteWithProductDetails?.quoteId;
        const username = `${leadWithDetails?.FirstName} ${leadWithDetails?.LastName}`;  // Combine First and Last name
        
        if (email) {
          await sendEmail(email, quoteId, username);  // Pass email, quoteId, and username
          console.log(`Reminder email sent to ${email} for Quote ID: ${quoteId}`);
        } else {
          console.log(`No email found for Quote ID: ${quoteId}`);
        }
      }
      
  } catch (error) {
    console.error("Error while running the cron job:", error);
  }
});
