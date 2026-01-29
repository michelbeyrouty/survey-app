const BadRequestError = require("../errors/BadRequestError");
const UnauthorizedError = require("../errors/UnauthorizedError");
const { USER_ROLES } = require("../config/constants");

function authMiddleware(...allowedRoles) {
  return (req, res, next) => {
    try {
      const role = req.headers["user-role"];
      const userId = req.headers["user-id"];

      if (!role) {
        throw new BadRequestError("User role is required in headers");
      }

      if (!userId) {
        throw new BadRequestError("User ID is required in headers");
      }

      req.user = { id: userId, role: role };

      if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(role)) {
          throw new UnauthorizedError(
            `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

const requireAdmin = () => authMiddleware(USER_ROLES.ADMIN);

const requireAnswerer = () => authMiddleware(USER_ROLES.ANSWERER);

const requireAnyRole = () =>
  authMiddleware(USER_ROLES.ADMIN, USER_ROLES.ANSWERER);

module.exports = {
  authMiddleware,
  requireAdmin,
  requireAnswerer,
  requireAnyRole,
};
