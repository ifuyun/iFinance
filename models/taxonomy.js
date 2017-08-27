/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    const Taxonomy = sequelize.define('Taxonomy', {
        taxonomyId: {
            type: DataTypes.CHAR(16),
            allowNull: false,
            primaryKey: true,
            field: 'taxonomy_id'
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: '',
            field: 'name'
        },
        parent: {
            type: DataTypes.CHAR(16),
            allowNull: false,
            defaultValue: '',
            field: 'parent'
        },
        orderNo: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            defaultValue: '0',
            field: 'order_no'
        },
        created: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created'
        },
        modified: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'modified'
        }
    }, {
        tableName: 'taxonomy',
        createdAt: 'created',
        updatedAt: 'modified',
        deletedAt: false
    });

    Taxonomy.associate = function (models) {
        Taxonomy.hasMany(models.Finance, {
            foreignKey: 'taxonomyId',
            sourceKey: 'taxonomyId'
        });
    };
    return Taxonomy;
};
