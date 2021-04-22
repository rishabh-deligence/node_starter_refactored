import Joi from 'joi';
import Async from 'async';
import Boom from 'boom';
import _ from 'lodash';
import Request from 'request';
import xl from 'node-xlsx';
import Path from 'path';
import Config from 'config';
import Mongoose from 'mongoose';

import { generateJwt } from '../../../../helper/passportStrategy';
import mailer from '../../../../helper/mailer';
import {
    encryptPass,
    generate6DigitOTP
} from '../../../../helper/util';
import Response from '../../models/response';
import UserServices from '../../services/user.services';


export class UserController {
    /**
     * @swagger
     * /common/signup:
     *   post:
     *     tags:
     *       - common
     *     description: job_seeker and job_requester signup
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: files
     *         description: Upload profile picture
     *         in: formData
     *         type: file
     *         required: true
     *         schema:
     *           type: string
     *       - name: email
     *         in: formData
     *         required: true
     *       - name: name
     *         in: formData
     *         required: true
     *       - name: password
     *         in: formData
     *         required: true
     *       - name: mobile
     *         in: formData
     *         required: true
     *       - name: gender
     *         in: formData
     *         required: true
     *       - name: about_me
     *         in: formData
     *         required: true
     *       - name: preferences
     *         in: formData
     *         required: true
     *       - name: socialMediaId
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    signup(request, response, next) {
        const fcmSchema = Joi.object().optional().keys({
            deviceId: Joi.string().required(),
            device_type: Joi.string().required(),
            regToken: Joi.string().required()
        });
        const validationSchema = {
            email: Joi.string().email().required().lowercase().trim(),
            name: Joi.string().required().trim(),
            password: Joi.string().required().trim(),
            mobile: Joi.string().required().trim(),
            gender: Joi.string().valid('Male', 'Female').required(),
            profile_picture: Joi.string().optional().trim(),
            selfie: Joi.string().optional().trim(),
            identity: Joi.string().optional().trim(),
            about_me: Joi.string().max(250).optional(),
            preferences: Joi.array().optional(),
            currency: Joi.string().valid('$', '£', '€').required(),
            currency_code: Joi.string().valid('usd', 'gbp', 'eur').required(),
            country: Joi.string().valid('US', 'GB', 'ES', 'FR').required(),
            socialMediaId: Joi.string().regex(/^\d+$/).optional(),
            fcmToken: fcmSchema
        };

        let validatedBody = {};
        /**
         * REF: Async waterfall
         * https://caolan.github.io/async/v3/docs.html#waterfall
         */

        Async.waterfall([
            cb => Joi.validate(request.body, validationSchema, cb),
            (validationResult, cb) => {
                const { files } = request;
                files.forEach(doc => {
                    let fileName = doc.filename;
                    let finalUrl = `${Config.get('hostAddress')}uploads/${fileName}`;
                    if (doc.fieldname === 'profile_picture') {
                        validationResult.profile_picture = finalUrl;
                    } else if (doc.fieldname === 'identity') {
                        validationResult.rejected = false;
                        validationResult.identity = finalUrl;
                    } else if (doc.fieldname === 'selfie') {
                        validationResult.selfie = finalUrl;
                    }
                });
                return cb(null, validationResult);
            },
            (validationResult, cb) => {
                validatedBody = { ...validationResult };
                delete validatedBody.fcmToken;
                UserServices.checkDuplicateUser(validationResult.email, (err, exists) => {
                    if (err) {
                        return cb(err);
                    }
                    if (exists) {
                        return cb(Boom.illegal('User already registered'));
                    }
                    return cb(null, validationResult);
                });
            },
            (validationResult, cb) => {
                const insertObject = Object.assign({}, validatedBody, {
                    password: encryptPass(validatedBody.password),
                    otp: generate6DigitOTP(),
                    otpTime: new Date().getTime() + 120000 // valid for 120 seconds
                });

                UserServices.insertUser(insertObject, (err, user) => {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, user, validationResult);
                });
            },
            (user, validationResult, cb) => {
                if (!validationResult.fcmToken) {
                    return cb(null, user);
                }
                const condition = {
                    email: user.email,
                };
                const updateObject = {
                    $addToSet: {
                        fcmToken: validationResult.fcmToken
                    },
                };
                const projection = {
                    password: 0,
                    otpTime: 0,
                    otp: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    identity: 0,
                    selfie: 0,
                    customAccountId: 0,
                    customerId: 0
                };
                UserServices.updateUser(condition, updateObject, projection, (err, updatedUser) => {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, updatedUser);
                });
            }
        ], (err, result) => {
            if (err) {
                return next(err);
            }
            return response.json(new Response(result, `Account created successfully`));
        });
    }
}

export default new UserController();
