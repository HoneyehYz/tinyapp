const express = require("express");
const {checkEmail, validateUser, matchName } = require('./help')
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const { compile } = require("ejs");
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


function generateRandomString() {
  var shortURL           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
     shortURL += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return shortURL;
}


app.use(bodyParser.urlencoded({extended: true}));
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "SpT2N7": "http://www.google.com"
};
const urlDatabase1 = {      
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },   
  SpT2N7: {longURL: "https://www.google.ca", userID: "user2RandomID" }
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase ,
    users: req.cookies["userCookie"],
    email: req.cookies["userCookies"]
  
  };
  res.render("urls_new", templateVars);
});

//////////// LOGIN //////////////////
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase ,
    users: req.cookies["userCookie"],
    email: req.cookies["userCookies"]
  
  };
  res.render("login", templateVars);
});

app.post("/login", (req,res) => {
  const email = req.body.email;
    const password = req.body.password;
    if (validateUser(bcrypt, users, email, password)){    
        const id = matchName(users, email);
        req.session.email = email;                              
        req.session.id = id;
        res.redirect('/urls');
    } else {
        res.redirect('/register');                         
    }
});
///////////// LOGOUT /////////////////////
app.post('/logout', (req, res) => {
  res.clearCookie('userCookie');
  res.clearCookie('userCookies');
  res.redirect('/login');
});


///////////// REGISTER /////////////////

app.get("/register", (req, res) => {
  const templateVars = {users: null}
  if(req.session && req.session.userCookie){
      templateVars.users = req.session.userCookie
  }
  
  res.render("urls_register",templateVars);
});

app.post("/register", (req,res) => {
  console.log("Welcome!");
  const userID = generateRandomString();
  const email = req.body.email;
  const prePassword = req.body.password;
  const password = bcrypt.hashSync(prePassword, salt);
  console.log(userID);
  console.log(email);
  console.log(password);

  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  if (checkEmail(users, email)) {
    res.statusCode = 400;
    res.send('EMAIL ALREADY IN USE')
  } else {
    res.cookie("userCookie", userID);
    res.cookie("userCookies", email);
    console.log(users);
    res.redirect('/urls');

  }

});

//////////  DELETE /////////
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
  const templateVars = { users: req.cookies["users"],shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL] };
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
  users: req.cookies["userCookie"],
  email: req.cookies["userCookies"]

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
