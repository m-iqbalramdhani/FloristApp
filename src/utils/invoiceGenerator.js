exports.generateInvoiceNumber = (id) => {
  const date = new Date().toISOString().slice(0,10).replace(/-/g, '');
  return `INV-${date}-${String(id).padStart(4, '0')}`;
};
