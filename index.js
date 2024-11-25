//Import required modules
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

//Import the methods for the APIs
const { getProductByBarcode } = require("./modules/openfoodfacts/openfoodfactsapi");
const { getRecipeByIngredient, getRecipeInfo } = require("./modules/spoonacular/spoonacularapi");




dotenv.config();

//Set up Express app
const app = express();
const port = process.env.PORT || 8888;

//Define important folders
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Setup public folder
app.use(express.static(path.join(__dirname, "public")));

//Parses URL-encoded format for POST request into javascript object
app.use(express.urlencoded({ extended: true }));

//Page Routes

// Route: GET /
// Description: This route is the index page.

app.get("/", async (req, res) => {
    res.render("index", { title: "Generate Meals" });
});


// Route: POST /scan
// Description: Handle the form submission for scanning a barcode.
// Uses the OpenFoodFacts API 

app.post("/scan", async (req, res) => {
    const barcode = req.body.barcode;

    try {
        const productData = await getProductByBarcode(barcode);
        if (productData.status === 1) {
            res.render("index", { title: "Generate Meals", food: productData.product });
        } else {
            res.render("index", { title: "Generate Meals", error: "Cannot find food item. Please try again." });
        }
    } catch (error) {
        console.error("Error fetching barcode data:", error);
        res.render("index", { title: "Generate Meals", error: "An error occurred while fetching food details. Please try again later." });
    }
});

// Route: POST /recipes
// Description: Handle the form submission for generating maximum of 5 recipes.
// Uses the Spoonacular API 
app.post("/recipes", async (req, res) => {
    const ingredient = req.body.ingredient;

    try {
        const recipes = await getRecipeByIngredient(ingredient);

        const recipesWithDetails = await Promise.all(
            recipes.map(async (recipe) => {
                try {
                    const recipeInfo = await getRecipeInfo(recipe.id);
                    return { 
                        ...recipe, 
                        //The price is in cents, not dollars
                        pricePerServing: recipeInfo.pricePerServing
                            ? (recipeInfo.pricePerServing / 100).toFixed(2)
                            : "N/A",
                        readyInMinutes: recipeInfo.readyInMinutes || "N/A",
                        servings: recipeInfo.servings || "N/A"
                    };
                } catch (error) {
                    console.error(`Can't fetch info for recipe ID ${recipe.id}:`, error);
                    return { ...recipe, pricePerServing: "Unavailable" };
                }
            })
        );

        // the page will render the searched ingredient info and name
        res.render("index", { 
            title: "Generate Meals", 
            food: { 
                product_name: ingredient,
                brands: req.body.brands,
                ingredients_text: req.body.ingredients_text
            },
            recipes: recipesWithDetails
        });
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.render("index", { 
            title: "Generate Meals", 
            error: "An error occurred while fetching recipes. Please try again later." 
        });
    }
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});