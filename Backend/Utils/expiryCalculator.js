export function calculateExpiryDate(collectionDate, component) {
  const expiry = new Date(collectionDate);

  switch (component) {
    case "whole_blood":
    case "rbc":
      expiry.setDate(expiry.getDate() + 42);
      break;

    case "platelets":
      expiry.setDate(expiry.getDate() + 5);
      break;

    case "plasma":
      expiry.setFullYear(expiry.getFullYear() + 1);
      break;

    default:
      throw new Error("Invalid blood component");
  }

  return expiry;
}
