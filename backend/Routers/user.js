import { updateUser, deleteUser, getAllUser, getSingleUser } from "../Controllers/userController.js";
import express from 'express';
const router=express.Router();
router.get('/', getAllUser);
router.get('/:id', getSingleUser);
router.post('/:id', updateUser);
router.post('/:id', deleteUser);
export default router;