const { Router } = require('express')
const router = Router()

router.get('/', (req, res) => {
  res.render('index', { title: 'Course Store', isOnHomePage: true })
})

module.exports = router
