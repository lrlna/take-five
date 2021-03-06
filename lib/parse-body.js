const Buffer = require('buffer').Buffer

module.exports = function (maxSize) {
  return function parseBody (req, res, next) {
    const conlen = parseInt(req.headers['content-length'], 10) || 0
    if (conlen === 0) {
      return next()
    }

    if ((req.method === 'POST' || req.method === 'PUT') && !req.body) {
      const body = []
      req.on('data', (chunk) => {
        if (chunk.length > maxSize || Buffer.byteLength(body.join(''), 'utf8') > maxSize) {
          return res.err(413, 'Payload size exceeds maxmium body length')
        }

        body.push(chunk.toString('utf8'))
      })

      req.on('end', () => {
        const data = body.join('')
        if (data) {
          try {
            req.body = JSON.parse(body.join(''))
          } catch (err) {
            return res.err(400, 'Payload is not valid JSON')
          }
        }
        next()
      })
      return
    }
    next()
  }
}
