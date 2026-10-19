import "dotenv/config";
import express from "express";
import cors from "cors";
import { UserSchema, type User } from "@north/shared";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "north-api",
    timestamp: new Date().toISOString(),
  });
});

app.post("/users/validate", (req, res) => {
  const result = UserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid user data",
      details: result.error.issues,
    });
  }

  const user: User = result.data;

  return res.json({
    message: "User data is valid",
    user,
  });
});

app.listen(port, () => {
  console.log(`North API running at http://localhost:${port}`);
});
