const keys = require('../keys')

module.exports = function (email, resetToken) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Password Reset',
    html: `
      <h1>Password reset</h1>
      <p>If you actually forgot password click on the link to reset it:</p>
      <p><a href="${keys.BASE_URL}/auth/password/${resetToken}">${keys.BASE_URL}/auth/password/${resetToken}</a></p>
    `
  }
}
