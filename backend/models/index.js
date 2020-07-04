import mongoose from "mongoose";

const db = {};
db.mongoose = mongoose;
db.url = process.env.MONGODB;

const Schema = mongoose.Schema;
// name: "Marco Tulio"
// subject : "Historia"
// type: "Trabalho Pratico"
// value : "17.4"
// lastModified :"2020-06-19T01:19:24.962Z"
const gradeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    lastModified: {
      type: Date,
      required: true,
    },
  },
  { versionKey: false }
);

gradeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

gradeSchema.set("toJSON", {
  virtuals: true,
});

const gradeModel = mongoose.model("grades", gradeSchema);

export { db, gradeModel };
