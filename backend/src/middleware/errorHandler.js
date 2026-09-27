export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  console.error('Unhandled server error:', err);
  const status = err.status || err.statusCode || 500;

  // Never leak internals for server-side failures.
  const message =
    status >= 500 ? 'Something went wrong on the server. Please try again.' : err.message || 'Request failed.';

  res.status(status).json({
    message,
    ...(status < 500 && process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
  });
}
