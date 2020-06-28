const fs = require('fs')
const path = require('path')

const pathToCart = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json')

class Cart {
  static async add(courseToAdd) {
    const cart = await Cart.fetch()

    const courseIndex = cart.courses.findIndex(course => course.id === courseToAdd.id)
    const course = cart.courses[courseIndex]

    const isCourseAlreadyInCart = !!course

    if (isCourseAlreadyInCart) {
      course.count++
      cart.courses[courseIndex] = course
    } else {
      cart.courses.push({ ...courseToAdd, count: 1 })
    }

    cart.totalPrice += Number(courseToAdd.price)

    return new Promise((resolve, reject) => {
      fs.writeFile(pathToCart, JSON.stringify(cart), err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  static async delete(id) {
    const cart = await Cart.fetch()

    const courseIndex = cart.courses.findIndex(course => course.id === id)
    const course = cart.courses[courseIndex]

    if (course.count === 1) {
      cart.courses = cart.courses.filter(course => course.id !== id)
    } else {
      cart.courses[courseIndex].count--
    }

    cart.totalPrice -= course.price

    return new Promise((resolve, reject) => {
      fs.writeFile(pathToCart, JSON.stringify(cart), err => {
        if (err) {
          reject(err)
        } else {
          resolve(cart)
        }
      })
    })
  }

  static async fetch() {
    return new Promise((resolve, reject) => {
      fs.readFile(pathToCart, 'utf-8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(data))
        }
      })
    })
  }
}

module.exports = Cart
