import { Router } from 'express';
import * as studentController from '../controllers/student.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/auth.js';

export const studentsRouter = Router();

studentsRouter.get(
  '/students',
  requireRole('admin', 'gerente'),
  asyncHandler(studentController.listStudents)
);

studentsRouter.get(
  '/students/:ci',
  requireRole('admin', 'gerente'),
  asyncHandler(studentController.getStudentByCi)
);

studentsRouter.post(
  '/students',
  requireRole('admin'),
  asyncHandler(studentController.createStudent)
);

studentsRouter.put(
  '/students/:ci',
  requireRole('admin'),
  asyncHandler(studentController.updateStudent)
);

studentsRouter.delete(
  '/students/:ci',
  requireRole('gerente'),
  asyncHandler(studentController.deleteStudent)
);