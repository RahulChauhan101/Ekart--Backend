import { Product } from "../models/productmodels.js";
import dataUri from "./Utils/datauri.js";
import { cloudinary } from "./Utils/cloudinary.js";

export const addProduct = async (req, res) => {
    try{
        const { productname, productdescription, productprice, productcategory, brand } = req.body;
        const userId = req.user._id;
        if(!productname || !productdescription || !productprice || !productcategory || !brand ){
            return res.status(400).json({ 
                sucsess: false,
                message: "All fields are required" 
            });
        }
        //Handle maltilay images uploads
        let productimage = [];
        if(req.files && req.files.length > 0){
            for(const file of req.files){
                const fileUri = dataUri(file); // Assuming you're using a middleware like multer to handle file uploads
                const  result  = await cloudinary.uploader.upload(fileUri, 
                { folder: "MERN_Products" } // specify folder name in Cloudinary
                );
                productimage.push({ url: result.secure_url, publicId: result.public_id });
            }
        } 
        // Create new product in Db
        const newProduct = new Product({
            userId,
            productname,
            productdescription,
            productprice,
            productcategory,
            brand,
            productimage // assign the array of images [{url, publicId}, {url, publicId}...]
        });
        await newProduct.save();
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });
    }catch(error){
        res.status(500).json({ 
            sucsess: false,
            message: "Server Error", error: error.message
         })
    }
}

export const getProducts = async (req, res) => {
    try{
        const products = await Product.find()
        if(!products){
            return res.status(404).json({ 
                sucsess: false,
                message: "No products found", 
                products: []
            })
        }
        res.status(200).json({
            sucsess: true,
            message: "Products fetched successfully",
            products
        });

    } catch(error){
        res.status(500).json({ 
            sucsess: false,
            message: "Server Error", error: error.message
         })
    }
}