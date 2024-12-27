import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (userId: string, taskData: any) => {
  const task = await prisma.task.create({
    data: {
      ...taskData,
      userId: userId,
    },
  });
  return task;
};


export const getTasks = async (userId: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId: userId,
    },
  });
  return tasks;
};

export const getTaskById = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      userId: userId,
    },
  });
  return task;
};

export const updateTask = async (userId: string, taskId: string, taskData: any) => {
  const task = await prisma.task.update({
    data: {
      ...taskData,
    },
    where: {
      id: taskId,
      userId: userId,
    },
  });
  return task;
};

export const deleteTask = async (userId: string, taskId: string) => {
  const task = await prisma.task.delete({
    where: {
      id: taskId,
      userId: userId,
    },
  });
  return task;
};

