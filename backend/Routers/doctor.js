import { updatedDoctor, deletedDoctor, getAllDoctor, getSingleDoctor, getDoctorProfile,updateDoctorProfile, getAllDoctorsAdmin, approveDoctor, adminDeleteDoctor, getDoctorDashboardSummary} from "../Controllers/doctorController.js";
import express from 'express';
import { authenticate, restrict } from "../auth/verifytoken.js";
import reviewRouter from './review.js';
const router=express.Router();
//nested route
router.use('/:doctorId/reviews', reviewRouter);

router.get('/profile/me',authenticate,restrict(['doctor']),getDoctorProfile)
router.put('/profile/me', authenticate, restrict(['doctor']), updateDoctorProfile);
router.get('/dashboard-summary', authenticate, restrict(['doctor']), getDoctorDashboardSummary);

router.get('/admin/all', authenticate, restrict(['admin']), getAllDoctorsAdmin);
router.put('/approve/:id', authenticate, restrict(['admin']), approveDoctor);
router.delete('/admin/:id', authenticate, restrict(['admin']), adminDeleteDoctor);

router.get('/', getAllDoctor);
router.get('/:id', getSingleDoctor);
router.put('/:id',authenticate,restrict(["doctor"]), updatedDoctor);
router.delete('/:id',authenticate,restrict(["doctor"]), deletedDoctor);
export default router;