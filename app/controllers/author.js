const db = require('../bootstrap');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const Concept = db.Concept;
const Perspective = db.Perspective;
const Author = db.Author;

/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.index = function(req, res, next) {
    Author.findAll({
        ...serializers.getPaginators(req.query),
        include:[
            {model: Perspective, include: [
                {model: Concept}
            ]}
        ]
    }).then(data => res.status(httpResponse.success.c200.code).json({
        responseType: httpResponse.responseTypes.success,
        ...httpResponse.success.c200,
        data,
        query: req.query
    })).catch(next);
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getOne = function(req, res, next){
    Author.findByPk(req.params.authorId, {include:{model:Perspective, include: {model: Concept}}})
    .then(data => {
        res.status(httpResponse.success.c200.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c200,
            data
        });
    }).catch(next);
}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function(req, res, next){
    Author.create(req.body)
    .then(data => {
        res.status(httpResponse.success.c201.code).json({
            responseType: httpResponse.responseTypes.success,
            ...httpResponse.success.c201,
            data
        });
    }).catch(next);
}

/**
 * update a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.update = function(req, res, next){
    Author.findByPk(req.params.authorId)
    .then(author => {
        if (!author) {
            let e = new Error('resource not found');
            e.status = httpResponse.error.client_error.c404.code;
            throw e;
        }
        author.update(req.body).then(data => {
            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                data
            });
        });
    }).catch(next);
}

/**
 * delete a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.delete = function(req, res, next){
    Author.findByPk(req.params.authorId)
    .then(author => {
        if (!author) {
            let e = new Error('resource not found');
            e.status = httpResponse.error.client_error.c404.code;
            throw e;
        }
        author.destroy().then(data => {
            res.status(httpResponse.success.c204.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c204
            });
        }).catch(next);
    }).catch(next);
}