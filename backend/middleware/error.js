function notFound(req, res) {
  res.status(404).json({ error: "Topilmadi" });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "ID noto'g'ri" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Bu ma'lumot avval ro'yxatdan o'tgan" });
  }

  const status = err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Serverda xatolik yuz berdi"
      : err.message || "Serverda xatolik yuz berdi";

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
