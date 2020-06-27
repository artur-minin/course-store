const { Router } = require('express')
const router = Router()

router.get('/', (req, res) => {
  res.render('add', { title: 'Add New Course', isOnAddCoursePage: true })
})

module.exports = router
