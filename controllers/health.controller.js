class HealthController {
  constructor() {
    this.check = this.check.bind(this);
  }

  async check(req, res) {
    return res.json({
      success: true,
      message: "OK",
    });
  }
}

module.exports = HealthController;
