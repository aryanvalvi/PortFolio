function uploadImage(req, res) {
  res.status(201).json({
    imageUrl: req.imageUrl,
    provider: req.imageProvider,
  })
}

module.exports = { uploadImage }
