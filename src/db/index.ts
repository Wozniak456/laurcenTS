import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

// Додайте функцію для відключення сеансів у стані "idle"
async function disconnectIdleSessions() {
    try {
      // Виконати SQL-запит для відключення сеансів у стані "idle"
      await db.$executeRaw`SELECT pg_terminate_backend(pid)
                             FROM pg_stat_activity
                             WHERE state = 'idle';`;
      console.log('Disconnected idle sessions successfully.');
    } catch (error) {
      console.error('Error disconnecting idle sessions:', error);
    }
  }