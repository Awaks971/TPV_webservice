const DB = require("../config/database");

async function user_verification_middleware(req, res, next) {
  let userId = null;

  const { payload } = req.body;

  if (typeof payload === "array") {
    userId = payload[0].uuid_societe;
  } else {
    userId = payload.uuid_societe;
  }

  if (!userId) {
    res.status(500).json({
      message:
        "No uuid_societe provided. You have to send `uuid_societe` field in you payload or in your payload array",
      error_code: "BAD_PAYLOAD"
    });
    res.end();
    return;
  }

  const [potential_user] = await DB.queryAsync(
    `SELECT id, status FROM users WHERE id="${userId}"`
  );
  if (!potential_user || !potential_user.id) {
    res
      .status(401)
      .json({ message: "Unknown user", error_code: "USER_NOT_FOUND" });
    res.end();
    return;
  }
  if (potential_user.status === "WAITING") {
    res.status(403).json({
      message:
        "This user is waiting for an admin validation, please contact awaks support",
      error_code: "USER_WAITING_FOR_VALIDATION"
    });
    res.end();
    return;
  }
  if (potential_user.status === "LOCKED") {
    res.status(403).json({
      message:
        "This user account is is locked by awaks, please contact awaks support",
      error_code: "LOCKED_USER"
    });
    res.end();
    return;
  }

  next();
}

async function technician_verification_middleware(req, res, next) {
  const { uuid_Technicien: technicianId } = req.body;
  const [potential_technician] = await DB.queryAsync(
    `SELECT id FROM technician WHERE id="${technicianId}"`
  );
  if (!potential_technician.id) {
    res.status(401).json({ message: "Unknown technician" });
    res.end();
  }
  next();
}

module.exports = {
  technician_verification_middleware,
  user_verification_middleware
};
