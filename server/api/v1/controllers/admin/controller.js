import Joi, { reach } from 'joi';
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
    encryptString,
    decryptString,
} from '../../../../helper/util';
import Response from '../../models/response';
import UserServices from '../../services/user.services';


export class AdminController {
    
}

export default new AdminController();
