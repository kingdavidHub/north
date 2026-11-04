export interface HealthStatus {
  status: "ok";
  service: string;
  timestamp: string;
}

/** Basic liveness payload used by the health endpoint. */
export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "north-api",
    timestamp: new Date().toISOString(),
  };
}
