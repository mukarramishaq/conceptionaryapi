const db = require('../bootstrap');
const Sequelize = require('sequelize');
const httpResponse = require('../helpers/http');
const serializers = require('../helpers/serializers');
const Concept = db.Concept;
const ConceptCluster = db.ConceptCluster;
const Perspective = db.Perspective;
const Author = db.Author;
const Keyword = db.Keyword;
const Tone = db.Tone;
const _ = require('underscore');

/**
 * send a list of records
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getConceptCluster = function (req, res, next) {
    if(req.body.cluster.name){
        if(req.body.cluster.name&&req.body.cluster.groupIds.length>0){
            let conceptIDs = [];
            let DataToQuery = [];
            let groupIds = [];
            let outerQuery = "";
            if (req.body.cluster.groupIds.length == 1) {
                groupIds.push(req.body.cluster.groupIds[0]);
            }
            else {
                groupIds = req.body.cluster.groupIds;
            }
            if (groupIds.length == 1) {
                outerQuery = `SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${groupIds})`;
            }
            else {
                outerQuery = `
            SELECT author_id from 
            (SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${groupIds[0]}) ) as a1
            INNER JOIN
            ( SELECT author_id FROM authors_author_groups WHERE author_group_id IN (${groupIds[1]}) ) as a2  
            USING(author_id)   
            `;
            }
            db.sequelize.query(`SELECT id FROM authors where id IN (${outerQuery}) LIMIT 10 `)
                .then(data => {
                    let authorIDs = data[0].map(author => author.id);
                    let innerQuery = "";
                    if (authorIDs.length == 1) {
                        innerQuery = `(SELECT DISTINCT concept_id from perspectives where author_id = ${authorIDs[0]})`;
                    }
                    else {
                        innerQuery = `(SELECT DISTINCT concept_id FROM perspectives WHERE author_id IN (${authorIDs.length > 0 ? authorIDs : -1}))`
                    }
                    mainQuery = `SELECT DISTINCT * from concepts where id IN ${innerQuery}  LIMIT 10 `;
                    db.sequelize.query(mainQuery)
                        .then(data => {
                            conceptIDs = data[0].map(concept => concept.id);
                        })
                        .then(x => {
                            let outerQuery = `(SELECT DISTINCT concept_cluster_id FROM concepts_concept_clusters WHERE concept_id IN (${conceptIDs.length > 0 ? conceptIDs : -1}))`;
                            let mainQuery = `SELECT DISTINCT * FROM concept_clusters where id IN (${outerQuery}) AND (name LIKE '${req.body.cluster.name}%' OR name LIKE '% ${req.body.cluster.name}%') LIMIT 3 `;
                            db.sequelize.query(mainQuery)
                                .then(data => {
                                    console.log(data);
                                    if (data.length > 0) {
                                        data[0].forEach(conceptCluster => {
                                            objectMapping = {};
                                            objectMapping.label = conceptCluster.name + " |Concept cluster";
                                            objectMapping.value = conceptCluster.name;
                                            objectMapping.id = conceptCluster.id;
                                            objectMapping.category = "Concept-Clusters";
                                            DataToQuery.push(objectMapping);
                                        });
                                    }
                                })
                                .then(x => {
                                    obj={};
                                    obj.selectedOption=DataToQuery[0];
                                    DataToQuery = [...new Set(DataToQuery)];
                                    res.status(httpResponse.success.c200.code).json({
                                        responseType: httpResponse.responseTypes.success,
                                        ...httpResponse.success.c200,
                                        obj
                                    })
                                })
                                .catch(err => {

                                })
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }).catch(err => {
                    console.log(err);
                });


        }
        else{
                ConceptCluster.findOne({
                    where:{
                       name:req.body.cluster.name
                    }
                }).then(data => {
                     obj={};
                     objectMapping = {};
                             objectMapping.label = data.name+"| Concept Cluster"
                             objectMapping.value = data.name
                             objectMapping.id = data.id;
                             objectMapping.category = "Concept-Clusters";
                             obj.selectedOption=objectMapping;
                 res.status(httpResponse.success.c200.code).json({
                 responseType: httpResponse.responseTypes.success,
                 ...httpResponse.success.c200,
                 obj
             })}).catch(err=>{
                    console.log(err);
                })

        }
    }
}
module.exports.index = function (req, res, next) {
    ConceptCluster.findAll({
        ...serializers.getPaginators(req.query),
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: Concept,
            }
        ]
    }).then(data => res.status(httpResponse.success.c200.code).json({
        responseType: httpResponse.responseTypes.success,
        ...httpResponse.success.c200,
        data
    }))
        .catch(next);
};

/**
 * send one matched record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.getOne = function (req, res, next) {


    
    ConceptCluster.findByPk(req.params.conceptClusterId, {
        attributes: serializers.getQueryFields(req.query),
        include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
            {
                model: Concept
            }
        ]
    }).then(data => {
        let ids=[];
        data.Concepts.map(concept => {
            ids.push(concept.concepts_concept_clusters.concept_id)
        })
        Perspective.findAll({where:{concept_id:ids},include:[{model:Author,where:{id:req.body}},{model:Concept}]}).then(d => {
            d.sort((a,b) => {return(a.Author.lastName > b.Author.lastName) ? 1 : ((b.Author.lastName > a.Author.lastName) ? -1 : 0)}); 

            
            
            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                d
            });

        })
    })
    // ConceptCluster.findByPk(req.params.conceptClusterId, {
    //     attributes: serializers.getQueryFields(req.query),
    //     include: serializers.isRelationshipIncluded(req.query) !== true ? undefined : [
    //         {
    //             model: Concept, include: [
    //                 {
    //                     model: Perspective, include: [
    //                         { model: Author,where : {id : req.body}},
    //                         { model: Keyword },
    //                         { model: Tone },
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // })
    //     .then(data => {
    //         res.status(httpResponse.success.c200.code).json({
    //             responseType: httpResponse.responseTypes.success,
    //             ...httpResponse.success.c200,
    //             data
    //         });
    //     }).catch(next);
}
module.exports.getSortedAuthor = function (req, res, next) {
    
    ConceptCluster.findByPk(req.params.conceptClusterId, {
        attributes: serializers.getQueryFields(req.query),
        include: [
            {
                model: Concept
            }
        ] }).then(data => {

            let ids=[];
            data.Concepts.map(concept => {
                ids.push(concept.concepts_concept_clusters.concept_id)
            })
            Perspective.findAll({where:{concept_id:ids},include:[{model:Author,order:[["firstName",'ASC']]},{model:Concept}]}).then(d => {
                let sortedAuthor=[]
                let count=0;
                let temp=[]
                d.map(perspective => {
                    if(!temp.includes(perspective.Author.id))
                    {
                        count++;
                        sortedAuthor.push({id:perspective.Author.id,firstName:perspective.Author.firstName,lastName:perspective.Author.lastName})
                        temp.push(perspective.Author.id);
                    }
                })
                sortedAuthor.sort((a,b) => (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0)); 
                
                let results={};
                let sortedConcepts=[];
                data.Concepts.map(concept => {
                    sortedConcepts.push({id:concept.id,name:concept.name});
                })
                results['sortedAuthors']=sortedAuthor;
                results['sortedConcepts']=sortedConcepts;
                
                
                res.status(httpResponse.success.c200.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c200,
                    results
                });
            })
        })
    
    // ConceptCluster.findByPk(req.params.conceptClusterId, {
    //     attributes: serializers.getQueryFields(req.query),
    //     include: [
    //         {
    //             model: Concept, include: [
    //                 {
    //                     model: Perspective, include: [
    //                         { model: Author,order:[['lastName','ASC']] },
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // })

    //     .then(data => {
    //         // console.log("data sending is ",JSON.stringify(data,null,4));
    //         let sortedAuthor=[]
    //         let count=0;
    //         let temp=[]
    //         data.Concepts.map(concept => {
    //             concept.Perspectives.map(perspective => {
    //                 if(!temp.includes(perspective.Author.id))
    //                 {
    //                     count++;
    //                     sortedAuthor.push({id:perspective.Author.id,firstName:perspective.Author.firstName,lastName:perspective.Author.lastName})
    //                     temp.push(perspective.Author.id);
    //                 }
    //             })
    //         })
    //         sortedAuthor.sort((a,b) => (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0)); 
    //         // console.log("Total Count is ",count),
    //         // console.log("Sending Arrays",sortedAuthor);


    //         res.status(httpResponse.success.c200.code).json({
    //             responseType: httpResponse.responseTypes.success,
    //             ...httpResponse.success.c200,
    //             sortedAuthor
    //         });
    //     }).catch(next);
}

/**
 * create a record
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.create = function (req, res, next) {
    ConceptCluster.create(req.body)
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
module.exports.update = function (req, res, next) {
    ConceptCluster.findByPk(req.params.conceptId)
        .then(conceptCluster => {
            if (!conceptCluster) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            conceptCluster.update(req.body).then(data => {
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
module.exports.delete = function (req, res, next) {
    ConceptCluster.findByPk(req.params.conceptClusterId)
        .then(conceptCluster => {
            if (!conceptCluster) {
                let e = new Error('resource not found');
                e.status = httpResponse.error.client_error.c404.code;
                throw e;
            }
            conceptCluster.destroy().then(data => {
                res.status(httpResponse.success.c204.code).json({
                    responseType: httpResponse.responseTypes.success,
                    ...httpResponse.success.c204
                });
            }).catch(next);
        }).catch(next);
}



let objectMapping = {}

let authorColor = "#A52A2A";
let conceptColor = "#000000"
let conceptClusterColor = "#800080";
let authorClusterColor = "#0000FF";
let authorGroupColor = '#33FF57';


module.exports.filter = function(req, res, next) {
    let DataToQuery = [];
    ConceptCluster.findAll({
        where:{
            name:{
                [Sequelize.Op.like]:req.params.label+'%'
            }
        },
        limit:10
    }).then(data => {   
        if (data.length > 0) {
            
            data.forEach(cluster => {
                objectMapping = {};
                objectMapping.label = cluster.name ;
                objectMapping.value = cluster.name;
                objectMapping.id = cluster.id;
                objectMapping.category = "Concept-Clusters";
                objectMapping.color = conceptClusterColor;
                DataToQuery.push(objectMapping);
            });
        }
    }).then(x=>{
            DataToQuery.sort((a, b) =>
            a["label"].length - b["label"].length
            );
            DataToQuery = [...new Set(DataToQuery)];
            res.status(httpResponse.success.c200.code).json({
                responseType: httpResponse.responseTypes.success,
                ...httpResponse.success.c200,
                data: DataToQuery
            })
        });
};

