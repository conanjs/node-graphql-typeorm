import mongoose from "mongoose";
import { getModelForClass, prop } from "@typegoose/typegoose";

export class ForgotPassword {
    _id!: mongoose.Types.ObjectId;

    @prop({ required: true })
    userId!: string;

    @prop({ required: true })
    token!: string;

    @prop({ default: Date.now, expires: 60 * 2 })
    createdAt: Date;
}

export const ForgotPasswordModel = getModelForClass(ForgotPassword);
