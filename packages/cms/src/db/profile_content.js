module.exports = function(sequelize, db) {

  const p = sequelize.define("profile_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "profile",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Profile"
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },
      label: {
        type: db.STRING,
        defaultValue: "New Profile Label"
      }
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
