import { updatedDoctor, deletedDoctor, getAllDoctor, getSingleDoctor, getDoctorProfile,updateDoctorProfile} from "../Controllers/doctorController.js";
import express from 'express';
import { authenticate, restrict } from "../auth/verifytoken.js";
import reviewRouter from './review.js';
const router=express.Router();
//nested route
router.use('/:doctorId/reviews', reviewRouter);

router.get('/profile/me',authenticate,restrict(['doctor']),getDoctorProfile)
router.put('/profile/me', authenticate, restrict(['doctor']), updateDoctorProfile);

router.get('/', getAllDoctor);
router.get('/:id', getSingleDoctor);
router.put('/:id',authenticate,restrict(["doctor"]), updatedDoctor);
router.delete('/:id',authenticate,restrict(["doctor"]), deletedDoctor);
export default router;