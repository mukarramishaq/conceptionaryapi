const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOSTNAME,
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
        max: parseInt(process.env.SEQ_POOL_MAX),
        min: parseInt(process.env.SEQ_POOL_MIN),
        acquire: parseInt(process.env.SEQ_POOL_ACQUIRE),
        idle: parseInt(process.env.SEQ_POOL_IDLE),
    },
    logging: console.log
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

/***  Initialize Models  ***/
db.Concept = require('./models/Concept')(sequelize, Sequelize);
db.Perspective = require('./models/Perspective')(sequelize, Sequelize);
db.Author = require('./models/Author')(sequelize, Sequelize);
db.Keyword = require('./models/Keyword')(sequelize, Sequelize);
db.Tone = require('./models/Tone')(sequelize, Sequelize);
db.ConceptCluster = require('./models/ConceptCluster')(sequelize, Sequelize);
db.AuthorCluster = require('./models/AuthorCluster')(sequelize, Sequelize);
db.AuthorGroup = require('./models/AuthorGroup')(sequelize, Sequelize);
db.AuthorBioHeading = require('./models/AuthorBioHeading')(sequelize, Sequelize);
db.Book = require('./models/Book')(sequelize, Sequelize);
db.AuthorOnAuthor = require('./models/AuthorOnAuthor')(sequelize, Sequelize);

/***  Set Relationships  ***/
db.Concept.hasMany(db.Perspective);
db.Perspective.belongsTo(db.Concept);
db.Perspective.belongsTo(db.Author);
db.Author.hasMany(db.Perspective);
db.Perspective.belongsToMany(db.Keyword, { through: 'perspectives_keywords', timestamps: false, foreignKey: 'perspective_id', otherKey: 'keyword_id' });
db.Keyword.belongsToMany(db.Perspective, { through: 'perspectives_keywords', timestamps: false, foreignKey: 'keyword_id', otherKey: 'perspective_id' });
db.Perspective.belongsToMany(db.Tone, { through: 'perspectives_tones', timestamps: false, foreignKey: 'perspective_id', otherKey: 'tone_id' });
db.Tone.belongsToMany(db.Perspective, { through: 'perspectives_tones', timestamps: false, foreignKey: 'tone_id', otherKey: 'perspective_id' });
db.Concept.belongsToMany(db.ConceptCluster, { through: 'concepts_concept_clusters', timestamps: false, foreignKey: 'concept_id', otherKey: 'concept_cluster_id' });
db.ConceptCluster.belongsToMany(db.Concept, { through: 'concepts_concept_clusters', timestamps: false, foreignKey: 'concept_cluster_id', otherKey: 'concept_id' });
db.AuthorCluster.belongsToMany(db.AuthorGroup, { through: 'author_clusters_author_groups', timestamps: false, foreignKey: 'author_cluster_id', otherKey: 'author_group_id' });
db.AuthorGroup.belongsToMany(db.AuthorCluster, { through: 'author_clusters_author_groups', timestamps: false, foreignKey: 'author_group_id', otherKey: 'author_cluster_id' });
db.Author.belongsToMany(db.AuthorGroup, { through: 'authors_author_groups', timestamps: false, foreignKey: 'author_id', otherKey: 'author_group_id' });
db.AuthorGroup.belongsToMany(db.Author, { through: 'authors_author_groups', timestamps: false, foreignKey: 'author_group_id', otherKey: 'author_id' });
db.AuthorGroup.belongsTo(db.AuthorBioHeading);
db.AuthorBioHeading.hasOne(db.AuthorGroup);
db.Author.belongsToMany(db.Book, { through: 'authors_books', timestamps: false, foreignKey: 'author_id', otherKey: 'book_id' });
db.Book.belongsToMany(db.Author, { through: 'authors_books', timestamps: false, foreignKey: 'book_id', otherKey: 'author_id' });
db.Author.belongsToMany(db.Author, { through: 'authors_influence_authors', as: 'AuthorInfluenceAuthors', timestamps: false, foreignKey: 'influencer_id', otherKey: 'influenced_id' });
db.Author.belongsToMany(db.Author, { through: 'authors_convo_authors', as: 'AuthorConvoAuthors', timestamps: false, foreignKey: 'author_id', otherKey: 'with_author_id' });
db.Author.belongsToMany(db.Author, { through: { model: db.AuthorOnAuthor }, as: 'AuthorOnAuthors', timestamps: false, foreignKey: 'author_id', otherKey: 'on_author_id' });

//export db object
module.exports = db;