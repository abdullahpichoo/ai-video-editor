import { MongoClient, Db, Collection, Document } from "mongodb";
import type {
  User,
  UserSession,
  MediaAsset,
  VideoProject,
  AIProcessingJob,
  ProjectExport,
  CollectionName,
} from "@/server/models";

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI as string;
const DATABASE_NAME = process.env.MONGODB_DB_NAME as string;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (client && db) {
    console.log("Reusing existing database connection", db.databaseName);
    return { client, db };
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db(DATABASE_NAME);

    await db.admin().ping();
    console.log("Connected to MongoDB successfully");

    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Database connection failed");
  }
}

export async function getCollection<T extends Document>(
  collectionName: CollectionName
): Promise<Collection<T>> {
  const { db } = await connectToDatabase();
  return db.collection<T>(collectionName);
}

export async function getUsersCollection(): Promise<Collection<User>> {
  return getCollection<User>("users");
}

export async function getUserSessionsCollection(): Promise<
  Collection<UserSession>
> {
  return getCollection<UserSession>("userSessions");
}

export async function getMediaAssetsCollection(): Promise<
  Collection<MediaAsset>
> {
  return getCollection<MediaAsset>("mediaAssets");
}

export async function getVideoProjectsCollection(): Promise<
  Collection<VideoProject>
> {
  return getCollection<VideoProject>("videoProjects");
}

export async function getAIProcessingJobsCollection(): Promise<
  Collection<AIProcessingJob>
> {
  return getCollection<AIProcessingJob>("aiProcessingJobs");
}

export async function getProjectExportsCollection(): Promise<
  Collection<ProjectExport>
> {
  return getCollection<ProjectExport>("projectExports");
}

export async function initializeDatabase(): Promise<void> {
  try {
    const { db } = await connectToDatabase();

    await db
      .collection("users")
      .createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { createdAt: 1 } },
      ]);

    await db
      .collection("userSessions")
      .createIndexes([
        { key: { userId: 1 } },
        { key: { sessionToken: 1 }, unique: true },
        { key: { expires: 1 }, expireAfterSeconds: 0 },
      ]);

    await db
      .collection("mediaAssets")
      .createIndexes([
        { key: { userId: 1 } },
        { key: { assetId: 1 }, unique: true },
        { key: { userId: 1, mimeType: 1 } },
        { key: { uploadedAt: -1 } },
        { key: { isProcessing: 1 } },
      ]);

    await db
      .collection("videoProjects")
      .createIndexes([
        { key: { userId: 1 } },
        { key: { projectId: 1 }, unique: true },
        { key: { userId: 1, updatedAt: -1 } },
        { key: { userId: 1, lastOpenedAt: -1 } },
      ]);

    await db
      .collection("aiProcessingJobs")
      .createIndexes([
        { key: { userId: 1 } },
        { key: { jobId: 1 }, unique: true },
        { key: { userId: 1, status: 1 } },
        { key: { projectId: 1 } },
        { key: { assetId: 1 } },
        { key: { type: 1, status: 1 } },
        { key: { createdAt: -1 } },
      ]);

    await db
      .collection("projectExports")
      .createIndexes([
        { key: { userId: 1 } },
        { key: { exportId: 1 }, unique: true },
        { key: { projectId: 1 } },
        { key: { status: 1 } },
        { key: { createdAt: -1 } },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      ]);

    console.log("Database indexes initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database indexes:", error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Database connection closed");
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// if (typeof process !== 'undefined') {
//   process.on('SIGINT', async () => {
//     await closeDatabaseConnection();
//     process.exit(0);
//   });

//   process.on('SIGTERM', async () => {
//     await closeDatabaseConnection();
//     process.exit(0);
//   });
// }
