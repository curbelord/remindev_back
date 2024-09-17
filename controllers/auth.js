import { AuthModel } from "../models/auth.js"
import jwt from "jsonwebtoken";

export class AuthController {
    static login = async (req, res) => {
        let nick = req.body.nick;
        let password = req.body.password;

        try {
            let userData = AuthModel.login(nick, password);

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
            res.status(400).send('Login is not possible');
        }
    }

    static register = async (req, res) => {
        let userReqData = {
            password: req.body.password
        };

        userReqData = this.addDataIfFullRegistration(req, userReqData);

        try {
            let userData = await AuthModel.register(userReqData);

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
            res.status(400).send('Registration is not possible');
        }
    }

    static validateUser = async (req, res) => {
        let { nick, email } = req.body;

        try {
            let userData = await AuthModel.validateUser(nick, email);

            if (userData.length > 0){
                return res.status(400).json({
                    message: 'Nick or email already in use',
                    userData: userData
                });
            }
            res.status(200).send('Nick and email are valid');
        } catch (error) {
            res.status(500).send('Server error');
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

    static addDataIfFullRegistration = (req, userReqData) => {
        if (req.body.fullRegistration){
            userReqData = {
                ...userReqData,
                name: req.body.name,
                surname: req.body.surname,
                birthdate: req.body.birthdate,
                nick: req.body.nick,
                company: req.body.company,
                occupation: req.body.occupation,
                email: req.body.email,
            }
        }
        return userReqData;
    }
}