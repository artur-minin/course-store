const { Router } = require('express')
const router = Router()

const Course = require('../models/course')

const mapCartItems = cart => {
  return cart.items.map(({ courseId, count }) => ({
    ...courseId._doc,
    count
  }))
}

const computeTotalPrice = courses => {
  return courses.reduce((total, { price, count }) => {
    return (total += price * count)
  }, 0)
}

router.get('/', async (req, res) => {
  const user = await req.user.populate('cart.items.courseId').execPopulate()
  const courses = mapCartItems(user.cart)

  res.render('cart', {
    title: 'Cart',
    isOnCartPage: true,
    courses: courses,
    totalPrice: computeTotalPrice(courses)
  })
})

router.post('/add', async (req, res) => {
  const course = await Course.findById(req.body.id)
  await req.user.addToCart(course)
  res.redirect('/cart')
})

router.delete('/delete/:id', async (req, res) => {
  await req.user.deleteFromCart(req.params.id)
  const user = await req.user.populate('cart.items.courseId').execPopulate()
  const courses = mapCartItems(user.cart)
  const cart = {
    courses,
    totalPrice: computeTotalPrice(courses)
  }

  res.status(200).json(cart)
})

module.exports = router
