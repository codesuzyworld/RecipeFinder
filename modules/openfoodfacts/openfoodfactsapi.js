require('dotenv').config();
const openFoodFacts = process.env.OPENFOODFACTS_API_URL;

//This method will get an ingredient from a barcode
async function getProductByBarcode(barcode) {
    const reqUrl = `${openFoodFacts}/api/v0/product/${barcode}.json`;
    
    const response = await fetch(reqUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }
  
    return await response.json();

  }

  module.exports = {
    getProductByBarcode,
  };