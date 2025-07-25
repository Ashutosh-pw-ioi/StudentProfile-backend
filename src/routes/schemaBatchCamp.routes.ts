import { Router } from 'express';

import getStudentByContact  from "../controllers/schemaBatchCamp.controller.js"

const schemaBatchCampRoutes: Router = Router();

schemaBatchCampRoutes.route('/certificate').post(getStudentByContact);

export default schemaBatchCampRoutes;