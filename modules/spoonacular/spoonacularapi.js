require('dotenv').config();

const spoonacular = process.env.SPOONACULAR_API_URL;
const apiKey = process.env.SPOONACULAR_API_KEY;

// This method will return 5 recipes maximum for said ingredient.
async function getRecipeByIngredient(ingredient) {
    const reqUrl = `${spoonacular}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredient)}&number=5&apiKey=${apiKey}`;
    
    const response = await fetch(reqUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return await response.json(); 
}

async function getRecipeInfo(id) {
    const reqUrl = `${spoonacular}/recipes/${id}/information?apiKey=${apiKey}`;
    const response = await fetch(reqUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return await response.json();
}

module.exports = {
    getRecipeByIngredient,
    getRecipeInfo,
}
