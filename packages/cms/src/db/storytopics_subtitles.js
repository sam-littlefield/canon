module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopics_subtitles",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },
      storytopic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopics",
          key: "id"
        }
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
