import { AuthModel } from "../models/auth.js"
import jwt from "jsonwebtoken";
import { UserSchema } from "../schemas/user.js";

export class AuthController {
    static login = async (req, res) => {
        try {
            let inputData = await UserSchema.validatePartialUser(req.body, true);
            if (!inputData.success) return res.status(400).send('Invalid data');

            let userData = await AuthModel.login(inputData.data.nick, inputData.data.password);

            if (!userData || Array.isArray(userData) && userData.length === 0){
                return res.status(400).send('Incorrect nick or password');
            }

            let accessToken = this.generateToken(userData, process.env.JWT_ACCESS_TOKEN_KEY, '1h');
            let refreshToken = this.generateToken(userData, process.env.JWT_REFRESH_TOKEN_KEY, '7d');

            res.status(200).cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.PRODUCTION_ENV,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60
            }).cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.PRODUCTION_ENV,
                sameSite: 'strict',
                maxAge: 1000 * 7 * 24 * 60 * 60
            }).send({userData, accessToken});
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    static register = async (req, res) => {
        let userData = [];
        let inputData;

        try {
            if (req.body.fullRegistration){
                inputData = await UserSchema.validateUser(req.body);
            }else{
                inputData = await UserSchema.validatePartialUser(req.body, false);
            }
            
            if (!inputData.success) return res.status(400).send('Invalid data');

            userData = await AuthModel.register(inputData.data);

            let accessToken = this.generateToken(userData, process.env.JWT_ACCESS_TOKEN_KEY, '1h');
            let refreshToken = this.generateToken(userData, process.env.JWT_REFRESH_TOKEN_KEY, '7d');

            res.status(201).cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.PRODUCTION_ENV,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60
            }).cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.PRODUCTION_ENV,
                sameSite: 'strict',
                maxAge: 1000 * 7 * 24 * 60 * 60
            }).send({userData, accessToken});

        } catch (error) {
            if (!userData.hasOwnProperty('id') || !userData.hasOwnProperty('nick')){
                return res.status(400).send('Registration is not possible');
            }
            res.status(500).send('Server error');
        }
    }

    static validateNickOrEmail = async (req, res) => {
        let { columnName, columnData } = req.body;

        try {
            let userData = await AuthModel.validateNickOrEmail(columnName, columnData);

            if (userData.length > 0){
                return res.status(409).json({
                    message: `${columnName} already in use`,
                    userData: userData
                });
            }
            res.status(200).json({
                message: `${columnName} is valid`
            });
        } catch (error) {
            res.status(500).json({
                message: 'Server error'
            });
        }
    }

    static generateToken = (userData, accessOrRefreshToken, expirationTime) => {
        const token = jwt.sign(
            {id: userData.id, nick: userData.nick},
            accessOrRefreshToken,
            {expiresIn: expirationTime}
        );

        return token;
    }
}