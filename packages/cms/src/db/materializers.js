module.exports = function(sequelize, db) {

  const m = sequelize.define("materializers",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.TEXT,
        defaultValue: "New Materializer"
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },
      ordering: db.INTEGER,
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "profiles",
          key: "id"
        }
      }
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return m;

};
