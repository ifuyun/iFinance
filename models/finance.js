/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    const Finance = sequelize.define('Finance', {
        financeId: {
            type: DataTypes.CHAR(16),
            allowNull: false,
            primaryKey: true,
            field: 'finance_id'
        },
        taxonomyId: {
            type: DataTypes.CHAR(16),
            allowNull: false,
            defaultValue: '',
            field: 'taxonomy_id'
        },
        financeDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'finance_date'
        },
        amount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: '0.0000',
            field: 'amount'
        },
        quantity: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            defaultValue: '1',
            field: 'quantity'
        },
        discount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: '0.0000',
            field: 'discount'
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'comment'
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
        tableName: 'finance',
        createdAt: 'created',
        updatedAt: 'modified',
        deletedAt: false
    });
    Finance.associate = function (models) {
        Finance.belongsTo(models.Taxonomy, {
            foreignKey: 'taxonomyId',
            targetKey: 'taxonomyId'
        });
    };
    return Finance;
};
