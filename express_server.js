const express = require("express");
const {checkEmail, validateUser, matchName, usersURL } = require('./help')
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
  const templateVars = { 
    urls: urlDatabase ,
    user: {email : ""}
  
  };
  res.render("homepage", templateVars);         //Rendering homepage
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
///////////////// URLs ////////////////////////
app.get("/urls", (req, res) => {
  const id = req.session.id;
  const user = id ? users[id] : null;                  
  if (user) {
    let templateVars = { "urls": usersURL(urlDatabase, id), user: {email: req.session.email} }; 
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { "urls": usersURL(urlDatabase, id), user: {email: ""} };
      res.render("login", templateVars);
  }

});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
   urlDatabase[shortURL] = {};
   urlDatabase[shortURL] = {
    userID: req.session.id,
    longURL: req.body.longURL 
  }
   res.redirect(`/urls/${shortURL}`);
 });

 app.post(`/urls/:shortURL`, (req, res) => {
  console.log(`edited`);
  urlDatabase[req.params.shortURL] = {         //Assign new longURL to the shortURL
    userID: req.session.id,
    longURL: req.body.longURL 
  }
  res.redirect(`/urls`);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.id;
  const user = id ? users[id] : null; 
  if (user) {
    let templateVars = { "urls/new": usersURL(urlDatabase, id), user: {email: req.session.email} }; 
    res.render("urls_new", templateVars);
  } else {
    let templateVars = { "urls/new": usersURL(urlDatabase, id), user: {email: ""} };
      res.render("login", templateVars);
  }
  // const templateVars = { 
  //   urls: urlDatabase ,
  //   user: {email : req.session.email},
    
  
  // };
  // res.render("urls_new", templateVars);
});

//////////// LOGIN ////////////////
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase ,
    user: {email : ""}
  
  };
  res.render("login", templateVars);         //Rendering Login page
});

app.post("/login", (req,res) => {
  const email = req.body.email;
    const password = req.body.password;
    if (validateUser(bcrypt, users, email, password)){    
        const id = matchName(users, email);
        req.session.email = email;             //set cookie session                 
        req.session.id = id;
        res.redirect('/urls');
    } else {
        res.redirect('/register');           //Redirect to registration page if the user new              
    }
});
///////////// LOGOUT /////////////////////
app.post('/logout', (req, res) => {
  req.session = null;                       //Delete cookies
  let templateVars = {user: {email: ""} };
  res.render("login", templateVars);       //Go back to login page
});


///////////// REGISTER /////////////////

app.get("/register", (req, res) => {
  const templateVars = {user: {email: ""}}
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
    console.log("redirecting");
    req.session.email = email;             //set cookie session                 
    req.session.id = userID;
    res.redirect('/urls');
  
});

//////////  DELETE /////////
app.post(`/urls/:shortURL/delete`, (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get(`/urls/:shortURL`, (req, res) => {
  const id = req.session.id;
  const user = id ? users[id] : null; 
  if(user){
    const templateVars = { user: {email :req.session.email},shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL].longURL};
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  console.log(`urlDtabase: ${JSON.stringify(urlDatabase)}\n req params: ${JSON.stringify(req.params)}`)
  // let longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(longURL);
  res.redirect(`http://${urlDatabase[req.params.shortURL].longURL}`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
