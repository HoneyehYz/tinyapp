const checkEmail = (email, password ) => { 
      if (email === "" || password === "") {
        return true;
      }
    return false;
  };


const validateUser = (bcrypt, db, email, password ) => { 
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


  module.exports = {validateUser, checkEmail,matchName }