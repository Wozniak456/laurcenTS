// import { db } from "@/db";

// export async function disconnectIdleSessions() {
//     try {
//       // Виконати SQL-запит для відключення сеансів у стані "idle"
//       await db.$executeRaw`SELECT pg_terminate_backend(pid)
//                              FROM pg_stat_activity
//                              WHERE state = 'idle';`;
//       console.log('Disconnected idle sessions successfully.');
//     } catch (error) {
//       console.error('Error disconnecting idle sessions:', error);
//     }
//   }

//   // Підключення до бази даних та відключення сеансів у стані "idle"
//   await db.$connect()
//     .then(() => {
//       return disconnectIdleSessions();
//     })
//     .catch((error) => {
//       console.error('Error connecting to database:', error);
//     });