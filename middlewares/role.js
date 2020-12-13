exports.isAdmin = () => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (req.user.role !== "admin") {
      res.status(403).json({ success: false, message: "Forbidden access" });
      return;
    }

    next();
  };
};
exports.isCustomer = () => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (req.user.role !== "customer") {
      res.status(403).json({ success: false, message: "Forbidden access" });
      return;
    }

    next();
  };
};
