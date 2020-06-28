const { Router } = require('express')
const router = Router()

const Course = require('../models/course')

router.get('/', (req, res) => {
  res.render('course-add', { title: 'Add Course', isOnAddCoursePage: true })
})

router.post('/', async (req, res) => {
  const { title, price, imageURL } = req.body
  const course = new Course({ title, price, imageURL })

  try {
    await course.save()
    res.redirect('/courses')
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
