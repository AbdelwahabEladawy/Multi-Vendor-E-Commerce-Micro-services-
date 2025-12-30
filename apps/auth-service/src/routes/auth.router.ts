import  { Router } from 'express';
import { userRegistration } from '../controller/auth.controller';

const router:Router = Router();
router.post('/user-registration', userRegistration); 




export default router;