import { S3 } from "aws-sdk";

export const IAM_USER_KEY = process.env.IAM_USER_KEY;
export const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
export const BUCKET_NAME = "fb-salao-na-mao";
export const AWS_REGION = "us-east-1";

export function uploadToS3(file, filename, acl = "public-read") {
  return new Promise((resolve, reject) => {
    let IAM_USER_KEY = this.IAM_USER_KEY;
    let IAM_USER_SECRET = this.IAM_USER_SECRET;
    let BUCKET_NAME = this.BUCKET_NAME;

    let s3bucket = new S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
      BucketName: BUCKET_NAME,
    });

    s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: file.data,
        ACL: acl,
      };

      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log(err);
          return resolve({ error: true, message: err });
        }
        console.log(data);
        return resolve({ error: false, message: data });
      });
    });
  });
}

export function deleteFileS3(key) {
  return new Promise((resolve, reject) => {
    let IAM_USER_KEY = this.IAM_USER_KEY;
    let IAM_USER_SECRET = this.IAM_USER_SECRET;
    let BUCKET_NAME = this.BUCKET_NAME;

    let s3bucket = new S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
      BucketName: BUCKET_NAME,
    });

    s3bucket.createBucket(function () {
      s3bucket.deleteObject(
        {
          Bucket: BUCKET_NAME,
          Key: key,
        },
        function (err, data) {
          if (err) {
            console.log(err);
            return resolve({ error: true, message: err });
          }
          console.log(data);
          return resolve({ error: false, message: data });
        }
      );
    });
  });
}
