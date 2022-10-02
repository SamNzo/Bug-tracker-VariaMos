import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import middleware from './middleware';
import authRoutes from './routes/auth';
import bugRoutes from './routes/bug';
import noteRoutes from './routes/note';
import userRoutes from './routes/user';
import assignmentRoutes from './routes/assignment';
import inviteCodesRoutes from './routes/inviteCodes';
import categoriesRoutes from './routes/categories';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/bugs', bugRoutes);
app.use('/bugs', noteRoutes);
app.use('/bugs', assignmentRoutes);
app.use('/', inviteCodesRoutes)
app.use('/categories', categoriesRoutes);

app.use(middleware.unknownEndPointHandler);
app.use(middleware.errorHandler);

export default app;
