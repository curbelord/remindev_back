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
    static login = async (nick, password) => {
        let hashedPassword = await bcrypt.hash(password, process.env.HASH_SALT);
        let [data] = await connection.query('SELECT id, nick FROM User WHERE nick = ? AND password = ?;', [nick, hashedPassword]);

        return data;
    }

    static register = async (userData) => {
        let hashedPassword = await bcrypt.hash(userData.password, 4);
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

    static validateUser = async (nick, email) => {
        let [data] = await connection.query('SELECT nick, email FROM User WHERE nick = ? OR email = ?;', [nick, email]);
        return data;
    }

    static generateUniqueUuid = async (column) => {
        let uuid,
            start = true,
            turns = 0;

        while (start && turns < 5) {
            uuid = crypto.randomUUID();
            column == "nick" ? uuid = uuid.slice(0, 18) : false;

            let [data] = await connection.query('SELECT ? FROM User WHERE ? = ?;', [column, column, uuid]);

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