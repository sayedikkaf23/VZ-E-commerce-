// controllers/serviceProductsController.js
require('dotenv').config();
const axios = require('axios');

exports.getServiceProducts = async (req, res) => {
  try {
    const { ServiceNameCode, SubTypeCode, RiskCode } = req.body;

    // 1) grab Salesforce OAuth token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id: '3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip',
          client_secret: '0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1',
          grant_type: 'password',
          username: 'vzpaymentapi@vz.ae.vzfullcopy',
          password: 'VZ@12345678',
        },
      }
    );

    // 2) call the Apex REST endpoint as GET + params
    const sfResp = await axios.get(
      `${tokenResp.data.instance_url}/services/apexrest/VZAR_ServicesProducts/`,
      {
        headers: {
          Authorization: `Bearer ${tokenResp.data.access_token}`,
          'Content-Type': 'application/json'
        },
        params: { ServiceNameCode, SubTypeCode, RiskCode }
      }
    );
    console.log('SF response data:', sfResp.data);

    // 3) return the product payload
    return res.status(200).json(sfResp.data);

  } catch (err) {
    console.error('getServiceProducts error:', err.response?.data || err);
    return res.status(500).json({
      message: 'Failed to fetch service products',
      error: err.response?.data || err.toString()
    });
  }
};
