function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.reduce((acc, issue) => {
        const key = issue.path.join(".") || "form";
        if (!acc[key]) acc[key] = issue.message;
        return acc;
      }, {});
      return res.status(422).json({
        error: Object.values(errors)[0],
        errors,
      });
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
