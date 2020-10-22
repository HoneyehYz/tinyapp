

const checkEmail = (users, email) => {
    for (const userID in users) {
      const currentUser = users[userID]
      if (currentUser.email === email) {
        console.log('Enter a new Email')
        return true
      } else if(currentUser.email === "") {
      }
    }
    return null
}
module.exports = {checkEmail}