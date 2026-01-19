import express, { Router } from "express";
import { addProduct, deleteproduct, getProducts, updateproducts } from "../ProductControllers.js";
import { isAdmin, isAuthenticated } from "../middleware/isAuthanticated.js";
import upload, { Multipleupload } from "../middleware/multer.js";


const router = express.Router();        

router.post("/add-product",isAuthenticated, isAdmin, Multipleupload.array('files'),  addProduct);
router.get("/get-products", getProducts);   
router.put("/update-product/:id", isAuthenticated, isAdmin, upload.single('file'), updateproducts);   
router.delete("/delete-product/:id", isAuthenticated, isAdmin, deleteproduct);
            
export default router;