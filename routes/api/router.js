/**
 * this file contains all rest api routes of v1
 */

const express = require('express');
const conceptController = require('./../../app/controllers/concept');
const conceptClusterController = require('./../../app/controllers/conceptCluster');
const perspectiveController = require('./../../app/controllers/perspective');
const authorController = require('./../../app/controllers/author');
const authorClustersController = require('./../../app/controllers/authorClusters');
const authorClusterController = require('./../../app/controllers/authorCluster');
const homeController = require('./../../app/controllers/home');
const authorGroupsController = require('./../../app/controllers/authorGroups');
const authorGroupController = require('./../../app/controllers/authorGroup');
const userController = require('./../../app/controllers/users');
const keywordController = require('./../../app/controllers/keyword')
const router = express.Router();
var passport = require('passport');
require('../../app/controllers/auth.js')(passport)

router.use((req, res, next) => {
    console.log('Request Encounter', req.query, req.query.fields);
    next();
});


/*** Concepts related routes. ***/
router.route('/concepts')
    .get(conceptController.getConceptId)
    .post(conceptController.create);
    router.route('/contact').post(perspectiveController.email);
    router.route('/newPerspective').post(perspectiveController.newPerspective);
    
router.route('/concepts/:conceptId')
    .get(conceptController.getOne)
    .put(conceptController.update)
    .delete(conceptController.delete);
router.route('/concepts/filter')
    .post(conceptController.getOne);

router.route('/concepts/search/:label')
    .get(conceptController.filter)
router.route('/concepts/perspective')
    .post(conceptController.getPerspectivesByConcept)
/*** ConceptClusters related routes. ***/
router.route('/conceptClusters')
    .get(conceptClusterController.index)
    .post(conceptClusterController.create);
router.route('/conceptCluster')
    .post(conceptClusterController.getConceptCluster)
router.route('/conceptClusters/:conceptClusterId')
    .get(conceptClusterController.getOne)
    .put(conceptClusterController.update)
    .delete(conceptClusterController.delete)
    .post(conceptClusterController.getOne)
router.route('/conceptClusters/sortedAuthors/:conceptClusterId').get(conceptClusterController.getSortedAuthor)
router.route('/conceptClusters/search/:label')
    .get(conceptClusterController.filter);

/*** Perspectives related routes. ***/
router.route('/perspectives')
    .get(perspectiveController.index)
    .post(perspectiveController.create);
router.route('/perspectives/upload')
    .post(perspectiveController.upLoadPerspective)
router.route('/perspectives/authors')
    .post(perspectiveController.getPerspectivesByAuthors)
router.route('/perspectives/likes')
.post(perspectiveController.getPerspectivesByLikes);
router.route('/perspectives/:perspectiveId')
    .get(perspectiveController.getOne)
    .put(perspectiveController.update)
    .delete(perspectiveController.delete);
router.route('/perspective/like')
    .post(perspectiveController.createLike);
router.route('/perspective/detail/:perspectiveId')
    .get(perspectiveController.getPerspectiveDetail);

/*** Authors related routes. ***/
router.route('/authors')
    .get(authorController.index)
    .post(authorController.create);
router.route('/author')
    .post(authorController.getAuthor);

    router.route('/authors/concepts/:authorId')
    .post(authorController.concept)




    router.route('/authors/:authorId/:offset/:like')
        .get(authorController.getOne)
    .put(authorController.update)
    .delete(authorController.delete)
router.route('/authors/concept/:authorId/:conceptId').get(authorController.concept)
router.route('/authors/search/:label')
    .get(authorController.filter);
router.route('/authors/perspective/:author_lastName')
    .get(authorController.getPerspectivesByAuthorLastName);

router.route('/authors/search')
    .post(authorController.secondFilter);
router.route('/authors/duplicate/search')
    .get(authorController.removeDuplicateAuthors);
router.route('/authors/duplicate/lastname')
    .get(authorController.getAuthorsByLastName);
//Search from Navbar
router.route('/authorGroups/search/:label')
    .get(authorGroupsController.search);

router.route('/authorGroups/search')
    .post(authorGroupsController.filter);

router.route('/authorGroups')
    .post(authorGroupsController.groupIds);

/*** AuthorCluster related routes. ***/
router.route('/authorClusters/search/:label')
    .get(authorClustersController.filter);
router.route('/authorClusters')
    .post(authorClusterController.getAuthorCluster);
/**Author cluster */
/*router.route('/authorClusters')
   .get(authorClustersController.index)
   .post(authorClustersController.create);*/

router.route('/authorClusters/:authorClusterId')
    .get(authorClusterController.getOne)
    .put(authorClusterController.update)
    .delete(authorClusterController.delete);
/*** Home related routes. ***/
router.route('/home/all/:label')
    .get(homeController.index);
router.route('/updateRouteFile')
        .get(homeController.updateRouteFile)
/*** Users related routes. ***/
router.route('/users')
    .get(userController.index)
    .post(userController.register);
router.get('/users/test', passport.authenticate('jwt', { session: false }), userController.test)
router.route('/users/:userId')
    .get(userController.getOne)
    .put(userController.update)
    .delete(userController.delete);
router.route('/login')
    .post(userController.login);
router.get('/authorClusters/:authorClusterId/perspectives', authorClusterController.getPerspectivesThroughAuthorCluster);
router.get('/authorGroups/:authorGroupId/perspectives', authorGroupController.getPerspectivesThroughAuthorGroups);
router.post('/keywords/perspective', keywordController.getPerspectiveByKeyword);
module.exports = router;