import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productname: {
            type: String,
            required: true,
        },
        productdescription: {
            type: String,
            required: true,
        },
        productprice: {
            type: Number,
            required: true,
        },
        productcategory: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        productimage: [
            {
                url: {
                    type: String,
                    required: true
                },
                publicId: {
                    type: String,
                    required: true
                }
            }
        ]
    }
    , { timestamps: true }
);
export const Product = mongoose.model("Product", productSchema);