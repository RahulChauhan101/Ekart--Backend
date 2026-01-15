import express, { Router } from "express";
import { addProduct, getProducts } from "../ProductControllers.js";
import { isAdmin, isAuthenticated } from "../middleware/isAuthanticated.js";
import { Multipleupload } from "../middleware/multer.js";


const router = express.Router();        

router.post("/add-products",isAuthenticated, isAdmin, Multipleupload.array('files'),  addProduct);
router.get("/get-products", getProducts);   

export default router;