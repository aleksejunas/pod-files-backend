//
// const app = express();
// app.use(cors());
// app.use(express.json());
//
// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello from the pnpm-based backend!");
// });
//
// app.listen(3001, () => {
//   console.log("Backend server running on http://localhost:3001");
// });

// TODO: Enhance file upload handling
// TODO: Secure file access
// TODO: Improve error handling
// TODO: Add database integration

// import browserSync from "browser-sync";
import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import cors from "cors";
import { verifyToken } from "./firebaseAdminConfig";

const app = express();
const upload = multer({
  // dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  onError: function(err, next {
  if (err.code === "LIMIT_FILE_SIZE") {
  next(new Error("File too large. Max 20MB"));
  })
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/tiff"];
    const allowedExtensions = ["jpg", "jpeg", "png", "tiff"];

    const fileExtension = file.originalname.split(".").pop()!.toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(
        file.originalname.split(".").pop()!.toLowerCase(),
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and TIFF files are allowed.",
        ) as any,
        false,
      );
    }
  },
});
// const bs = browserSync.create();

app.use(cors());
app.use(express.json());
// app.use(require("connect-browser-sync")(bs));

// Extend the Request interface to include the user property
declare module "express" {
  interface Request {
    user?: any;
  }
}

// middleware for authentication
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Unauthorized");

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await verifyToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized");
  }
};

// Route for uploading files
app.post("/upload", (req: Request, res: Response, next: NextFunction) => {
  authenticate(req, res, next)
    .then(() => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          return res.status(400).send("File upload error");
        }
        if (!req.file) {
          return res.status(400).send("No file uploaded");
        }
        res.send(`File uploaded: ${req.file.filename}`);
      });
    })
    .catch(next);
});

// Add a route for GET /
app.get("/", (_req: Request, res: Response) => {
  res.send(
    "Welcome to the PodFiles backend server featuring nodemon for autoreloading of the server and web-browser-ralphie-zexytime-in-the-west upon code changes!",
  );
});

app.listen(3001, () => {
  console.log("Backend server running on port 3001");
});
