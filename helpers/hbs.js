const moment = require('moment')

module.exports = {
  formatDate: (date, targetFormat) => {
    return moment(date).format(targetFormat)
  }
}
