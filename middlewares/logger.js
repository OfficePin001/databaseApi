function logRequest(req, res, next) {
  const date = new Date().toISOString();
  console.log(`${date} - ${req.method} - ${req.url} from ${req.ip}`);
  next(); 
}

module.exports = logRequest;