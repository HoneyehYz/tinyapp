const checkEmail = (email, password ) => { 
      if (email === "" || password === "") {
        return true;
      }
    return false;
  };


const validateUser = (bcrypt, db, email, password ) => { //checks for password match
  for (const id in db) {
    const currentUser = db[id];
    if (email === currentUser.email){
      if (bcrypt.compareSync(password, currentUser.password)) {
        return true;
      } else {
        return false;
      } 
    }
  }
   return false;
};
  
const matchName = function(obj, key){  
  for (let item in obj){
      if(obj[item].email === key)
      return obj[item].id;
  }
};

const usersURL = function (object, id) { ///create list of urls for user
  let usersObject = {};
  for (let key in object) {
    if (object[key].userID === id) {
      usersObject[key] = object[key];
    }
  }
  return usersObject;
};

  module.exports = {validateUser, checkEmail,matchName, usersURL}