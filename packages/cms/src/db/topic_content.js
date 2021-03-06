module.exports = function(sequelize, db) {

  const t = sequelize.define("topic_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "topic",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Topic"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
