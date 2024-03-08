import path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { fileURLToPath } from "url";
import { RemovalPolicy } from "aws-cdk-lib";
/*
static website for fameus magazine
*/

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface IProps {
  path: string;
}

export class FameusMagazine extends Construct {
  constructor(scope: Construct, id: string, props: IProps) {
    const { path: websiteDirectoryPath } = props;
    super(scope, id);
    const bucket = new s3.Bucket(this, "Bucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this, "DeployWebsite", {
      sources: [
        Source.asset(
          path.join(__dirname, "..", "..", "..", websiteDirectoryPath)
        ),
      ],
      destinationBucket: bucket,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, "OAI");
    bucket.grantRead(oai);
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "Distribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );

    new cdk.CfnOutput(this, "url", {
      value: distribution.distributionDomainName,
    });
  }
}
