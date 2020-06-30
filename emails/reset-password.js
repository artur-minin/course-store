const keys = require('../keys')

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Password Reset',
    html: `
      <h1>Password reset</h1>
      <p>If you actually forgot password click on the link:</p>
      <p><a href="${keys.BASE_URL}/auth/password/${token}">${keys.BASE_URL}/auth/password/${token}</a></p>
    `
  }
}
