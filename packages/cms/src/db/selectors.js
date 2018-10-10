module.exports = function(sequelize, db) {

  const s = sequelize.define("selectors",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      options: {
        type: db.ARRAY(db.JSON),
        defaultValue: []
      },
      default: {
        type: db.TEXT,
        defaultValue: ""
      },          
      topic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "topics",
          key: "id"
        }
      },
      name: {
        type: db.STRING,
        defaultValue: "newselector"
      },        
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
