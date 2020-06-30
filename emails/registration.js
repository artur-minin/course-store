const keys = require('../keys')

module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Account Created',
    html: `
      <h1>Welcome to Course Store</h1>
      <p>Your account was created successfully!</p>
    `
  }
}
