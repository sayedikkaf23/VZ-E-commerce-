const Pidata = require('../models/pidata');
const axios = require("axios");

exports.getPersonalBankSearch = async (req, res) => {
  try {
    // 1) Extract page & limit from query (fallback to page=1, limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || ''; // dynamic search term 
 
    // 2) Build Aggregation Pipeline (No more userdetails lookup)
    const pipeline = [
      // Match only the subcategory = 'personal'
      { $match: { subcategory: 'Personal Bank Account Opening' } }, 

      // Match with the Search Term
        {
            $match: {
            $or: [
                { 'leadWithDetails.FirstName': { $regex: searchTerm, $options: 'i' } },
                { 'leadWithDetails.LastName': { $regex: searchTerm, $options: 'i' } },
                { 'leadWithDetails.Email': { $regex: searchTerm, $options: 'i' } },
                { 'quotePaymentWithDetails.QuotePaymentId': { $regex: searchTerm, $options: 'i' } },
                { 'screeningDetails.matchScore': { $regex: searchTerm, $options: 'i' } }
            ]
            }
        },


      // Now we use $facet to get total count & the paginated docs in one go
      {
        $facet: {
          metadata: [ { $count: 'total' } ], // Count how many docs after above steps
          data: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ];
 
    // 3) Execute the aggregation
    const aggResult = await Pidata.aggregate(pipeline);
   
    const meta = aggResult[0]?.metadata?.[0] || {};
    const totalRecords = meta.total || 0; // If none found, total will be 0
    const data = aggResult[0]?.data || [];
 
    // 4) totalPages from totalRecords
    const totalPages = Math.ceil(totalRecords / limit);
 
    // 5) For each doc, call external KYC status API
    const mergedResults = [];

    for (const doc of data) {
      let kycStatus = 'Unknown';
      try {
        const leadId = doc?.leadWithDetails?.LeadId;
        if (leadId) {
          const authResponse = await axios.post(
            `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
            {
              CustomerId: leadId,
              CompanyName: process.env.SCREENING_COMPANYNAME

            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.authToken}` // Or do a separate authenticate call if needed
              }
            }
          );
          kycStatus = authResponse.data?.CustomerStatus || 'Unknown';

          // Optionally update the original Pidata doc with KYC status
          await Pidata.updateOne(
            { _id: doc._id },
            { $set: { kycStatus } }
          );
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error.message);
      }

      // Attach the KYC status
      doc.kycStatus = kycStatus;

      mergedResults.push(doc);
    }
 
    // 6) Return the final array with paginated results and KYC status
    res.status(200).json({
      data: mergedResults, // Up to 'limit' docs with KYC status
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit
    });
  } catch (error) {
    console.error('Error fetching searched personal bank submissions:', error);
    res.status(500).json({
      error: 'Error fetching searched personal bank submissions',
      details: error.message
    });
  }
};

exports.getBusinessBankSearch = async (req, res) => {
  try {
    // 1) Extract page & limit from query (fallback to page=1, limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || ''; // dynamic search term 
 
    // 2) Build Aggregation Pipeline (No more userdetails lookup)
    const pipeline = [
      // Match only the subcategory = 'personal'
      { $match: { subcategory: 'Business Bank Account Opening' } }, 

      // Match with the Search Term
        {
            $match: {
            $or: [
                { 'leadWithDetails.FirstName': { $regex: searchTerm, $options: 'i' } },
                { 'leadWithDetails.LastName': { $regex: searchTerm, $options: 'i' } },
                { 'leadWithDetails.Email': { $regex: searchTerm, $options: 'i' } },
                { 'quotePaymentWithDetails.QuotePaymentId': { $regex: searchTerm, $options: 'i' } },
                { 'screeningDetails.matchScore': { $regex: searchTerm, $options: 'i' } }
            ]
            }
        },


      // Now we use $facet to get total count & the paginated docs in one go
      {
        $facet: {
          metadata: [ { $count: 'total' } ], // Count how many docs after above steps
          data: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ];
 
    // 3) Execute the aggregation
    const aggResult = await Pidata.aggregate(pipeline);
   
    const meta = aggResult[0]?.metadata?.[0] || {};
    const totalRecords = meta.total || 0; // If none found, total will be 0
    const data = aggResult[0]?.data || [];
 
    // 4) totalPages from totalRecords
    const totalPages = Math.ceil(totalRecords / limit);
 
    // 5) For each doc, call external KYC status API
    const mergedResults = [];

    for (const doc of data) {
      let kycStatus = 'Unknown';
      try {
        const leadId = doc?.leadWithDetails?.LeadId;
        if (leadId) {
          const authResponse = await axios.post(
            `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
            {
              CustomerId: leadId,
              CompanyName: process.env.SCREENING_COMPANYNAME

            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.authToken}` // Or do a separate authenticate call if needed
              }
            }
          );
          kycStatus = authResponse.data?.CustomerStatus || 'Unknown';

          // Optionally update the original Pidata doc with KYC status
          await Pidata.updateOne(
            { _id: doc._id },
            { $set: { kycStatus } }
          );
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error.message);
      }

      // Attach the KYC status
      doc.kycStatus = kycStatus;

      mergedResults.push(doc);
    }
 
    // 6) Return the final array with paginated results and KYC status
    res.status(200).json({
      data: mergedResults, // Up to 'limit' docs with KYC status
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit
    });
  } catch (error) {
    console.error('Error fetching searched personal bank submissions:', error);
    res.status(500).json({
      error: 'Error fetching searched personal bank submissions',
      details: error.message
    });
  }
};

exports.getPersonalBankDateFilter = async (req, res) => {
  try {
    // 1) Extract page & limit from query (fallback to page=1, limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    // const fromDate = req.query.fromDate || '';
    // const toDate = req.query.toDate || '';
    const fromDate = new Date(req.query.fromDate).toISOString().substring(0, 10) || ''; // "YYYY-MM-DD"
    const toDate = new Date(req.query.toDate).toISOString().substring(0, 10) || ''; 
 
    // 2) Build Aggregation Pipeline (No more userdetails lookup)
    const pipeline = [
      // Match only the subcategory = 'personal'
      { $match: { subcategory: 'Personal Bank Account Opening' } }, 

      // Match with the Search Term
      {
        $addFields: {
            updatedAtFormatted: {
            $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$updatedAt" 
            }
            }
        }
        },
        {
            $match: {
                updatedAtFormatted: {
                    $gte: fromDate,
                    $lte: toDate
                }
            }
        },

      // Now we use $facet to get total count & the paginated docs in one go
      {
        $facet: {
          metadata: [ { $count: 'total' } ], // Count how many docs after above steps
          data: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ];
 
    // 3) Execute the aggregation
    const aggResult = await Pidata.aggregate(pipeline);
   
    const meta = aggResult[0]?.metadata?.[0] || {};
    const totalRecords = meta.total || 0; // If none found, total will be 0
    const data = aggResult[0]?.data || [];
 
    // 4) totalPages from totalRecords
    const totalPages = Math.ceil(totalRecords / limit);
 
    // 5) For each doc, call external KYC status API
    const mergedResults = [];

    for (const doc of data) {
      let kycStatus = 'Unknown';
      try {
        const leadId = doc?.leadWithDetails?.LeadId;
        if (leadId) {
          const authResponse = await axios.post(
            `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
            {
              CustomerId: leadId,
              CompanyName: process.env.SCREENING_COMPANYNAME

            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.authToken}` // Or do a separate authenticate call if needed
              }
            }
          );
          kycStatus = authResponse.data?.CustomerStatus || 'Unknown';

          // Optionally update the original Pidata doc with KYC status
          await Pidata.updateOne(
            { _id: doc._id },
            { $set: { kycStatus } }
          );
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error.message);
      }

      // Attach the KYC status
      doc.kycStatus = kycStatus;

      mergedResults.push(doc);
    }
 
    // 6) Return the final array with paginated results and KYC status
    res.status(200).json({
      data: mergedResults, // Up to 'limit' docs with KYC status
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit,
      datefiltering:true
    });
  } catch (error) {
    console.error('Error fetching searched personal bank submissions:', error);
    res.status(500).json({
      error: 'Error fetching searched personal bank submissions',
      details: error.message
    });
  }
}

exports.getBusinessBankDateFilter = async (req, res) => {
  try {
    // 1) Extract page & limit from query (fallback to page=1, limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const fromDate = new Date(req.query.fromDate).toISOString().substring(0, 10) || ''; // "YYYY-MM-DD"
    const toDate = new Date(req.query.toDate).toISOString().substring(0, 10) || '';  
 
    // 2) Build Aggregation Pipeline (No more userdetails lookup)
    const pipeline = [
      // Match only the subcategory = 'personal'
      { $match: { subcategory: 'Business Bank Account Opening' } }, 

      // Match with the Search Term
      {
        $addFields: {
            updatedAtFormatted: {
            $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$updatedAt" 
            }
            }
        }
        },
        {
            $match: {
                updatedAtFormatted: {
                    $gte: new Date(fromDate),
                    $lte: new Date(toDate)
                }
            }
        },

      // Now we use $facet to get total count & the paginated docs in one go
      {
        $facet: {
          metadata: [ { $count: 'total' } ], // Count how many docs after above steps
          data: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ];
 
    // 3) Execute the aggregation
    const aggResult = await Pidata.aggregate(pipeline);
   
    const meta = aggResult[0]?.metadata?.[0] || {};
    const totalRecords = meta.total || 0; // If none found, total will be 0
    const data = aggResult[0]?.data || [];
 
    // 4) totalPages from totalRecords
    const totalPages = Math.ceil(totalRecords / limit);
 
    // 5) For each doc, call external KYC status API
    const mergedResults = [];

    for (const doc of data) {
      let kycStatus = 'Unknown';
      try {
        const leadId = doc?.leadWithDetails?.LeadId;
        if (leadId) {
          const authResponse = await axios.post(
            `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
            {
              CustomerId: leadId,
              CompanyName: process.env.SCREENING_COMPANYNAME

            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.authToken}` // Or do a separate authenticate call if needed
              }
            }
          );
          kycStatus = authResponse.data?.CustomerStatus || 'Unknown';

          // Optionally update the original Pidata doc with KYC status
          await Pidata.updateOne(
            { _id: doc._id },
            { $set: { kycStatus } }
          );
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error.message);
      }

      // Attach the KYC status
      doc.kycStatus = kycStatus;

      mergedResults.push(doc);
    }
 
    // 6) Return the final array with paginated results and KYC status
    res.status(200).json({
      data: mergedResults, // Up to 'limit' docs with KYC status
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit,
      datefiltering:true
    });
  } catch (error) {
    console.error('Error fetching searched business bank submissions:', error);
    res.status(500).json({
      error: 'Error fetching searched business bank submissions',
      details: error.message
    });
  }
}