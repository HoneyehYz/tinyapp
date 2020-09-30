const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const { compile } = require("ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  var shortURL           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
     shortURL += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return shortURL;
}

//console.log(shortURL);


app.use(bodyParser.urlencoded({extended: true}));
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  
});
app.get("/login", (req, res) => {
  res.render("login", {error: null});
  
});

app.post("/login", (req,res) => {
  console.log("Welcome!");
  if (req.body.username){
    res.cookie("userCookie", req.body.username);
   }
   res.redirect("/urls");
  // res.cookie('username', req.body.username);
});


app.post('/logout', (req, res) => {
  res.clearCookie('userCookie');
  res.redirect('/urls');
});


app.post(`/urls/:shortURL/delete`, (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post(`/urls/:id`, (req, res) => {
  const shortURL = req.params.id
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL ;
  console.log(shortURL);
  res.redirect(`/urls`);
 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); 
});

app.get(`/urls/:shortURL`, (req, res) => {
  const templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
  urls: urlDatabase ,
  username: req.cookies["userCookie"]
};
  res.render("urls_index", templateVars);
});



// app.get(`/urls/:${shortURL}`, (req, res) => {
//   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
//   res.render("urls_show", templateVars);
// });



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});