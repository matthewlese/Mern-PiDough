const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const keys = require('../../config/keys');
const jwt = require('jsonwebtoken'); 
const passport = require('passport');

const Recipe = require("../../models/Recipe");
const validateRecipeInput = require('../../validations/recipe');

router.post('/create', (req, res) => {
  const { errors, isValid } = validateRecipeInput(req.body)

  if (!isValid) {
    return res.status(400).json(errors);
  }
  let { title, authorId } = req.body
  Recipe.findOne({
    authorId: authorId, // filter by the author (current user)
    title: title        // filter by title
  }).then(recipe => {
    if (recipe) {
      errors.title = 'You already have a recipe with this title.'
      return res.status(400).json(errors) // bad request
    } else {
      const newRecipe = new Recipe(req.body)
      newRecipe.save()
        .then(recipe => res.json(recipe))
        .catch(err => res.status(400).json(err));
    }
  })
})

module.exports = router