import { Redis } from "@upstash/redis";
import { v4 as uuidv4 } from "uuid";

// Check if Redis is configured
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory store for local development if Redis isn't configured
const localStore = new Map<string, any>();

export async function saveResult(originalOrderId: string, data: any): Promise<string> {
  const resultId = uuidv4();
  
  if (redis) {
    try {
      // Set expiration to 30 days
      await redis.set(resultId, data, { ex: 2592000 });
      console.log(`[DB Save Success] Redis ID: ${resultId} (Order: ${originalOrderId})`);
    } catch (error: any) {
      console.error("[DB Save Error] Redis failed:", error.message);
      localStore.set(resultId, data);
      console.log(`[DB Save Success] Local Memory ID: ${resultId} (Fallback)`);
    }
  } else {
    console.warn(`[DB Warning] Redis NOT configured! Using temporary local memory. Vercel 배포 시 데이터가 유실됩니다.`);
    localStore.set(resultId, data);
    console.log(`[DB Save Success] Local Memory ID: ${resultId}`);
  }
  
  return resultId;
}

export async function getResult(resultId: string): Promise<any> {
  console.log(`[DB Fetch Attempt] ID: ${resultId}`);
  
  if (redis) {
    try {
      const data = await redis.get(resultId);
      if (data) {
        console.log(`[DB Fetch Result] Success from Redis: ${resultId}`);
        return data;
      }
    } catch (error: any) {
      console.error("[DB Fetch Error] Redis failed:", error.message);
    }
  }
  
  const localData = localStore.get(resultId);
  if (localData) {
    console.log(`[DB Fetch Result] Success from Local Memory: ${resultId}`);
    return localData;
  }
  
  console.log(`[DB Fetch Result] Failed - ID not found: ${resultId}`);
  return null;
}
