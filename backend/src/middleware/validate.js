/**
 * Generic Zod validation middleware factory
 * Validates req.body, req.query, or req.params against Zod schemas
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      // Replace with sanitized/validated data
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid request data provided.',
        details: error.errors?.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })) || error.message
      });
    }
  };
}

module.exports = {
  validate
};
