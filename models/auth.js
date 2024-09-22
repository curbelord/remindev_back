import mysql from "mysql2/promise";
import crypto from "node:crypto";
import { config } from "dotenv";
import bcrypt from "bcrypt";


config();

const DEFAULT_CONFIG = {
    host: process.env.BATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
}

const connection = await mysql.createConnection(DEFAULT_CONFIG);


export class AuthModel {
    static login = async (incomingNick, password) => {
        let [data] = await connection.query('SELECT id, nick, password FROM User WHERE nick = ?;', [incomingNick]);

        if (data.length > 0){
            let isMatch = await bcrypt.compare(password, data[0].password);
            let {id, nick} = data[0];

            if (isMatch == true) {
                return {id, nick}
            };
        }
        return [];
    }

    static register = async (userData) => {
        const SALT_ROUNDS = parseInt(process.env.HASH_SALT);
        let hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

        const sql = 'INSERT INTO User (id, name, surname, birthdate, nick, company, occupation, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        let values,
            id = await AuthModel.generateUniqueUuid('id'),
            nick;

        if (userData.hasOwnProperty('nick')){
            values = [id, userData.name, userData.surname, userData.birthdate, userData.nick, userData.company, userData.occupation, userData.email, hashedPassword];
            nick = userData.nick;
        }else{
            nick = await AuthModel.generateUniqueUuid('nick');
            values = [id, null, null, null, nick, null, null, null, hashedPassword];
        }

        await connection.execute(sql, values);

        return {id, nick};
    }

    static validateNickOrEmail = async (columnName, columnData) => {
        let [data] = await connection.query(`SELECT ${columnName} FROM User WHERE ${columnName} = ?;`, [columnData]);
        return data;
    }

    static generateUniqueUuid = async (column) => {
        let uuid,
            start = true,
            turns = 0;

        while (start && turns < 5) {
            uuid = crypto.randomUUID();
            column == "nick" ? uuid = uuid.slice(0, 18) : false;

            let [data] = await connection.query(`SELECT ${column} FROM User WHERE ${column} = ?;`, [uuid]);

            if (data.length === 0){
                start = false;
            }

            if (start && (turns + 1) === 5){
                throw Error();
            }
            turns++;
        }
        return uuid;
    }
}