const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const Cart = require('./cart');

class CartCourse extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

CartCourse.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    id_cart: {
        type: DataTypes.UUID
    },
    id_course: {
        type: DataTypes.UUID
    }
}, {
    sequelize,
    tableName: 'cart_course'
});

Cart.hasMany(CartCourse, { foreignKey: 'id_cart', as: 'courses' });
CartCourse.belongsTo(Cart, { foreignKey: 'id_cart' });



module.exports = CartCourse;