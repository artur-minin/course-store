const { v4: uuid } = require('uuid')
const fs = require('fs')
const path = require('path')

class Course {
  constructor(title, price, imageURL) {
    this.id = uuid()
    this.title = title
    this.price = price
    this.imageURL = imageURL
  }

  async save() {
    const courses = await Course.getAll()
    courses.push({
      id: this.id,
      title: this.title,
      price: this.price,
      imageURL: this.imageURL
    })

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        JSON.stringify(courses),
        err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '..', 'data', 'courses.json'), 'utf-8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(data))
        }
      })
    })
  }
}

module.exports = Course
