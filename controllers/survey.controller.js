const BadRequestError = require('../errors/BadRequestError');

class SurveyController {

    constructor(surveyService){
        this.surveyService = surveyService;

        this.take = this.take.bind(this);
    }

    async take(req,res,next){
        const { endpoint, callerId } = req.body;

        if(!endpoint || typeof endpoint !== "string"){
            return next(new BadRequestError('Invalid endpoint'));
        }

        if(!callerId){
            return next(new BadRequestError('callerId is missing'));
        }

        this.surveyService.create(callerId,endpoint);

        return res.json()
    }
}

module.exports = SurveyController;
