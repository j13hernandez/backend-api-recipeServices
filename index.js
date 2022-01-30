const express = require('express');
const bodyParser = require('body-parser');
const data = require('./data.json');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Filter out recipe names and return an object
const getRecipes = () => {
  const recipeNames = {
    recipeNames: [],
  };
  const recipes = data.recipes;
  recipes.forEach((recipe) => {
    recipeNames.recipeNames.push(recipe.name);
  });
  return recipeNames;
};

// GET recipe details by name
const getDetails = (name) => {
  const details = {};
  const recipes = data.recipes;
  recipes.forEach((recipe) => {
    if (name === recipe.name) {
      details['details'] = { ingredients: recipe.ingredients, numSteps: recipe.ingredients.length };
    }
  });
  return details;
};

// POST new recipes to JSON file
const newRecipe = async (newRecipe) => {
  const recipes = data.recipes;
  let exists = false;

  recipes.forEach((recipe) => {
    if (newRecipe.name === recipe.name) {
      exists = true;
    }
  });
  if (exists) {
    return Promise.reject({ error: 'Recipe already exist' });
  }
  fs.readFile('./data.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data); //now it an object
      obj.recipes.push(newRecipe); //add some data
      json = JSON.stringify(obj); //convert it back to json
      fs.writeFile('./data.json', json, 'utf8', (err) => {
        if (err) {
          console.log(err);
        }
      }); // write it back
    }
  });

  return Promise.resolve();
};

// Updates existing Recipe and file
const updateRecipe = async (newRecipe) => {
  let exists = false;
  const data = fs.readFileSync('./data.json');
  obj = JSON.parse(data); //now it an object
  obj.recipes.forEach((recipe, index) => {
    if (newRecipe.name === recipe.name) {
      obj.recipes[index] = newRecipe;
      exists = true;
    }
  });

  if (!exists) {
    return Promise.reject({ error: 'Recipe does not exist' });
  }
  json = JSON.stringify(obj); //convert it back to json
  fs.writeFile('./data.json', json, 'utf8', (err) => {
    if (err) {
      throw new Error(err);
    }
  }); // write it back
  return Promise.resolve();
};

app
  .route('/recipes')
  .get((req, res) => {
    res.status(200).json(getRecipes());
  })
  .post((req, res) => {
    newRecipe(req.body)
      .then(() => res.status(201).send())
      .catch((err) => {
        res.status(400).send(err);
      });
  })
  .put((req, res) => {
    updateRecipe(req.body)
      .then(() => res.status(204).send())
      .catch((err) => {
        res.status(404).send(err);
      });
  });

app.get('/recipes/details/:food', (req, res) => {
  res.status(200).json(getDetails(req.params.food));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
