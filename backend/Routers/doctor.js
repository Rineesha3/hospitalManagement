import { updatedDoctor, deleteDoctor, getAllDoctor, getSingleDoctor } from "../Controllers/doctorController.js";
import express from 'express';
const router=express.Router();
router.get('/', getAllDoctor);
router.get('/:id', getSingleDoctor);
router.post('/:id', updatedDoctor);
router.post('/:id', deleteDoctor);
export default router;