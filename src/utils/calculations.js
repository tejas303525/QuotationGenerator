export const calcLineTotal = (qty, unitPrice) => {
  return qty * unitPrice;
};

export const calcSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (item.total || 0), 0);
};

export const calcTax = (subtotal, rate) => {
  return (subtotal * rate) / 100;
};

export const calcGrandTotal = (subtotal, taxAmount) => {
  return subtotal + taxAmount;
};
