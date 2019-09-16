const http = require( 'http' ),
      fs   = require( 'fs' ),
      request = require('request'),
      cheerio = require('cheerio'),
      bodyParser = require('body-parser'),
      mongoose = require("mongoose"),
      passport = require("passport"),
      express = require('express'),
      flash = require('connect-flash'),
      session = require('express-session'),
      expressLayouts = require('express-ejs-layouts'),
      
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library used in the following line of code
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000,
      url = "mongodb+srv://repimentel:Qhb50fko1Ebn2ZAk@cluster0-kkory.mongodb.net/test?retryWrites=true&w=majority";
      // Passport file
      require('./passport')(passport);

      const app = express();
      mongoose.connect(url,
                      {
          useNewUrlParser: true,
          useCreateIndex: true
      }).then(() => {
        console.log('connected');
      }).catch(err => {
        console.log('ERROR: ',err.message)
      });
const appdata = [
  { 'yourname': 'Rafael', 'dish': "cookie", 'ingredient': "chocolate" },
  { 'yourname': 'Nasim', 'dish': "roll", 'ingredient': "strawberry" },
  { 'yourname': 'Shine', 'dish': "duck", 'ingredient': "orange"} 
]

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

const recipe = function (data, callback) {
  const new_recipe = data;
  const str = ""
  let url = str.concat('https://www.allrecipes.com/search/results/?wt=', new_recipe.dish, '&ingIncl=', new_recipe.ingredient, '&sort=re')
  console.log("Recipe site url:", url)
  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      const link = $('.fixed-recipe-card__h3 a').first().attr('href');
      recipeview(link, data => {
        callback(data)
      });
    }
  })
}

const recipeview = function (link, callback) {
  console.log("Recipe url:", link)
  const new_recipe = link;
  const str = ""
  request(link, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      const ingredients = $('#polaris-app li > label[title]').map((i, el) => {
        return $(el).attr('title')
      }).get();

      const instructions = $('ol.list-numbers:nth-child(2) > li .recipe-directions__list--item').map((i, el) => {
        return $(el).text()
      }).get();

      callback({
        ingredients: ingredients,
        instructions: instructions
      })
    }
  })
}

const addLog = function(data){
  appdata.push(data)
}

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./index.js'));
app.use('/users', require('./users.js'));

const PORT = process.env.PORT || port;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
