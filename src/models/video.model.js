import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema =new Schema(
    {
        videoFile:{
            type:String,//Cloudnary
            required:true,
        },
        thumbnail:{
            type:String,//Cloudnary
            required:true,
        },    
        title:{
            type:String,//Cloudnary
            required:true,
        },
        description:{
            type:String,//Cloudnary
            required:true,
        },
        duration:{
            type:Number,//Cloudnary
            required:true,
        },     
        views:{
            type:Number,//Cloudnary
            default:0
        },
      
        isPublished:{
            type:Boolean,//Cloudnary
            default:true,
        },
        owner: {
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },
    {
        timestamps: true
    }
)



videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)