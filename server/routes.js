import userRouter from './api/v1/controllers/user/routes';

/**
 *
 *
 * @export
 * @param {any} app
 */
export default function routes(app) {
    app.use('/v1/user', userRouter);
    return app;
}