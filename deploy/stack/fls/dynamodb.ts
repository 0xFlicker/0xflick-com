import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface IProps {
  region: string;
}

export class DynamoDB extends Construct {
  public readonly affiliateTable: dynamodb.Table;
  public readonly userNonceTable: dynamodb.Table;
  public readonly rolesTable: dynamodb.Table;
  public readonly rolesPermissionsTable: dynamodb.Table;
  public readonly userRolesTable: dynamodb.Table;
  public readonly externalAuthTable: dynamodb.Table;
  public readonly drinkerTable: dynamodb.Table;
  public readonly nameflickTable: dynamodb.Table;
  public readonly urlShortenerTable: dynamodb.Table;
  public readonly lastWrapperEventBlock: dynamodb.Table;
  public readonly tableParam: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: IProps) {
    const { region } = props;
    super(scope, id);

    const affiliateTable = new dynamodb.Table(this, "AffiliateTable", {
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.affiliateTable = affiliateTable;
    affiliateTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: dynamodb.AttributeType.STRING,
      },
    });
    new cdk.CfnOutput(this, "AffiliateTableName", {
      value: affiliateTable.tableName,
    });

    const userNonceTable = new dynamodb.Table(this, "UserNonce", {
      partitionKey: {
        name: "Address",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.userNonceTable = userNonceTable;
    new cdk.CfnOutput(this, "UserNonceTable", {
      value: userNonceTable.tableName,
    });

    const rolesTable = new dynamodb.Table(this, "Roles", {
      partitionKey: {
        name: "ID",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.rolesTable = rolesTable;
    rolesTable.addGlobalSecondaryIndex({
      indexName: "RolesByNameIndex",
      partitionKey: {
        name: "RoleName",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["ID"],
    });
    new cdk.CfnOutput(this, "RolesTable", {
      value: rolesTable.tableName,
    });

    const rolesPermissionsTable = new dynamodb.Table(this, "RolePermissions", {
      partitionKey: {
        name: "RoleID_Action_Resource",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.rolesPermissionsTable = rolesPermissionsTable;
    rolesPermissionsTable.addGlobalSecondaryIndex({
      indexName: "RoleIDIndex",
      partitionKey: {
        name: "RoleID",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAt",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["ActionType", "ResourceType", "Identifier"],
    });
    new cdk.CfnOutput(this, "RolePermissionsTable", {
      value: rolesPermissionsTable.tableName,
    });

    const userRolesTable = new dynamodb.Table(this, "UserRoles", {
      partitionKey: {
        name: "Address_RoleID",
        type: dynamodb.AttributeType.STRING,
      },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.userRolesTable = userRolesTable;
    userRolesTable.addGlobalSecondaryIndex({
      indexName: "RoleIDIndex",
      partitionKey: {
        name: "RoleID",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAt",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["Address"],
    });
    userRolesTable.addGlobalSecondaryIndex({
      indexName: "AddressIndex",
      partitionKey: {
        name: "Address",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAt",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["RoleID"],
    });
    new cdk.CfnOutput(this, "UserRolesTable", {
      value: userRolesTable.tableName,
    });

    const externalAuthTable = new dynamodb.Table(this, "ExternalAuth", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "expires",
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.externalAuthTable = externalAuthTable;
    externalAuthTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
    });
    new cdk.CfnOutput(this, "ExternalAuthTable", {
      value: externalAuthTable.tableName,
    });

    const drinkerTable = new dynamodb.Table(this, "Drinker", {
      partitionKey: { name: "key", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.drinkerTable = drinkerTable;
    new cdk.CfnOutput(this, "DrinkerTable", {
      value: drinkerTable.tableName,
    });

    const lastWrapperEventBlock = new dynamodb.Table(
      this,
      "LastWrapperEventBlock",
      {
        partitionKey: { name: "key", type: dynamodb.AttributeType.STRING },
        tableClass: dynamodb.TableClass.STANDARD,
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      }
    );
    this.lastWrapperEventBlock = lastWrapperEventBlock;

    const nameflickTable = new dynamodb.Table(this, "Nameflick", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.nameflickTable = nameflickTable;

    nameflickTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
    });
    nameflickTable.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "GSI2PK", type: dynamodb.AttributeType.STRING },
    });
    nameflickTable.addGlobalSecondaryIndex({
      indexName: "GSI3",
      partitionKey: {
        name: "address!eth",
        type: dynamodb.AttributeType.STRING,
      },
    });
    new cdk.CfnOutput(this, "NameflickTable", {
      value: nameflickTable.tableName,
    });

    const urlShortenerTable = new dynamodb.Table(this, "UrlShortener", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "expires",
      tableClass: dynamodb.TableClass.STANDARD,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.urlShortenerTable = urlShortenerTable;

    // // Create a new SSM Parameter holding the table name, because we can
    // // not pass env vars into edge lambdas
    const tableParam = new ssm.StringParameter(this, "TableNames", {
      description: "The table names",
      parameterName: `FLS_${id}_TableNames`,
      stringValue: JSON.stringify({
        affiliatesTable: affiliateTable.tableName,
        userNonceTable: userNonceTable.tableName,
        nameflickTable: nameflickTable.tableName,
        rolesTable: rolesTable.tableName,
        rolesPermissionsTable: rolesPermissionsTable.tableName,
        userRolesTable: userRolesTable.tableName,
        externalAuthTable: externalAuthTable.tableName,
        drinkerTable: drinkerTable.tableName,
        urlShortenerTable: urlShortenerTable.tableName,
        region,
      }),
    });
    this.tableParam = tableParam;

    // const dbAccessGroup = new iam.Group(this, "FLS-DBAccessGroup");
    // const dbaccessRole = new iam.Role(this, "FLS-DBAccessRole", {
    //   assumedBy: new iam.ArnPrincipal(dbAccessGroup.groupArn),
    // });
    // tableParam.grantRead(dbaccessRole);
    // affiliateTable.grantReadWriteData(dbaccessRole);
    // userNonceTable.grantReadWriteData(dbaccessRole);
    // nameflickTable.grantReadWriteData(dbaccessRole);
    // rolesTable.grantReadWriteData(dbaccessRole);
    // rolesPermissionsTable.grantReadWriteData(dbaccessRole);
    // userRolesTable.grantReadWriteData(dbaccessRole);
    // externalAuthTable.grantReadWriteData(dbaccessRole);
    // drinkerTable.grantReadWriteData(dbaccessRole);
    // urlShortenerTable.grantReadWriteData(dbaccessRole);
    // lastWrapperEventBlock.grantReadWriteData(dbaccessRole);

    new cdk.CfnOutput(this, "TableNamesParam", {
      value: tableParam.parameterName,
    });
    // new cdk.CfnOutput(this, "DBAccessRole", {
    //   value: dbaccessRole.roleArn,
    // });
    // new cdk.CfnOutput(this, "DBAccessGroup", {
    //   value: dbAccessGroup.groupName,
    // });
  }
}
