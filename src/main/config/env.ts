export const env = {
  s3: {
    accessKey: process.env.AWS_S3_ACCESS_KEY ?? '',
    secret: process.env.AWS_S3_SECRET ?? '',
    bucket: process.env.AWS_S3_BUCKET ?? ''
  },
  port: process.env.PORT ?? 8080,
  jwtSecret: process.env.JWT_SECRET ?? 'h4kj23h42kj3'
}
