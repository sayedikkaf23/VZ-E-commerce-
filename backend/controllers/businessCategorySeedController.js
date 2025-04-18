const ProductFamily = require('../models/productFamily');
// ^–– make sure this file exports the BusinessCategory model as shown earlier
 
 
// POST /api/product-families/bulk
exports.bulkCreateProductFamilies = async (req, res) => {
  try {
    const rows = req.body;                              // expects array
 
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Body must be a non‑empty array' });
    }
 
    // clean + keep createdBy / updatedBy if provided
    const docs = rows
      .filter(r => r.label && r.value)
      .map(r => ({
        label:      r.label,
        value:      r.value,
        isActive:   r.isActive !== undefined ? r.isActive : true,
        createdBy:  r.createdBy ?? null,
        updatedBy:  r.updatedBy ?? null
      }));
 
    // skip any values already in the DB
    const existing = await ProductFamily.find({ value: { $in: docs.map(d => d.value) } })
                                        .select('value');
    const existingSet = new Set(existing.map(e => e.value));
    const freshDocs   = docs.filter(d => !existingSet.has(d.value));
 
    if (freshDocs.length === 0) {
      return res.status(200).json({ message: 'No new records to insert' });
    }
 
    const inserted = await ProductFamily.insertMany(freshDocs, { ordered: false });
    return res.status(201).json({
      message: `Inserted ${inserted.length} new records (skipped ${docs.length - inserted.length} duplicates)`,
      data: inserted
    });
  } catch (err) {
    console.error('Bulk create error:', err);
    return res.status(500).json({ error: err.message });
  }
};
 
exports.getBusinessCategories = async (req, res) => {
  try {
               // should appear
    const docs = await ProductFamily.find({});                // no filter first
                         // should be >0
    const onlyActive = docs.filter(d => d.isActive === true); // inspect
    return res.status(200).json(onlyActive);
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
};