module.exports = {
  tables: [
    {
      TableName: "UserNonce",
      KeySchema: [{ AttributeName: "Address", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "Address", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    },
    {
      TableName: "Roles",
      KeySchema: [{ AttributeName: "ID", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "ID", AttributeType: "S" }, { AttributeName: "RoleName", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [{
        IndexName: "RolesByNameIndex",
        KeySchema: [{
          AttributeName: "RoleName",
          KeyType: "HASH",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["ID"],
        },
      }]
    },
    {
      TableName: "RolePermissions",
      KeySchema: [{
        AttributeName: "RoleID_Action_Resource",
        KeyType: "HASH",
      }],
      AttributeDefinitions: [{
        AttributeName: "RoleID_Action_Resource",
        AttributeType: "S",
      }, {
        AttributeName: "RoleID",
        AttributeType: "S",
      }, {
        AttributeName: "CreatedAt",
        AttributeType: "N",
      }, {
        AttributeName: "ResourceType",
        AttributeType: "S",
      }, {
        AttributeName: "ActionType",
        AttributeType: "S",
      }],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [{
        IndexName: "RoleIDIndex",
        KeySchema: [{
          AttributeName: "RoleID",
          KeyType: "HASH",
        }, {
          AttributeName: "CreatedAt",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["ActionType", "ResourceType", "Identifier"],
        },
      }, {
        IndexName: "RoleByActionResourceIndex",
        KeySchema: [{
          AttributeName: "ResourceType",
          KeyType: "HASH",
        }, {
          AttributeName: "ActionType",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["RoleID", "Identifier"],
        },
      }],
    }, {
      TableName: "UserRoles",
      KeySchema: [{ AttributeName: "Address_RoleID", KeyType: "HASH" }],
      AttributeDefinitions: [
        {
          AttributeName: "Address_RoleID",
          AttributeType: "S"
        },
        {
          AttributeName: "RoleID",
          AttributeType: "S",
        },
        {
          AttributeName: "Address",
          AttributeType: "S",
        }, {
          AttributeName: "CreatedAt",
          AttributeType: "N",
        }
      ],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [{
        IndexName: "RoleIDIndex",
        KeySchema: [{
          AttributeName: "RoleID",
          KeyType: "HASH",
        }, {
          AttributeName: "CreatedAt",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["Address"],
        },
      }, {
        IndexName: "AddressIndex",
        KeySchema: [{
          AttributeName: "Address",
          KeyType: "HASH",
        }, {
          AttributeName: "CreatedAt",
          KeyType: "RANGE",
        }],
        Projection: {
          ProjectionType: "INCLUDE",
          NonKeyAttributes: ["RoleID"],
        },
      }],
    }, {
      TableName: 'ExternalAuth',
      KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }, { AttributeName: "sk", KeyType: "RANGE" }],
      AttributeDefinitions: [{
        AttributeName: "pk", AttributeType: "S"
      }, {
        AttributeName: "sk", AttributeType: "S"
      }, {
        AttributeName: "GSI1PK", AttributeType: "S"
      }, {
        AttributeName: "GSI1SK", AttributeType: "S"
      }],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [{
        IndexName: 'GSI1',
        KeySchema: [{ AttributeName: "GSI1PK", KeyType: "HASH" }, { AttributeName: "GSI1SK", KeyType: "RANGE" }],
        Projection: { ProjectionType: "ALL" },
      }]
    }, {
      TableName: 'Drinker',
      KeySchema: [{ AttributeName: "key", KeyType: "HASH" }],
      AttributeDefinitions: [{
        AttributeName: "key", AttributeType: "S"
      }],
      BillingMode: "PAY_PER_REQUEST",
    }, {
      TableName: 'NameFlick',
      KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
      AttributeDefinitions: [{
        AttributeName: "pk", AttributeType: "S"
      }, {
        AttributeName: "GSI1PK", AttributeType: "S"
      }, {
        AttributeName: "GSI2PK", AttributeType: "S"
      }],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [{
        IndexName: 'GSI1',
        KeySchema: [{ AttributeName: "GSI1PK", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      }, {
        IndexName: 'GSI2',
        KeySchema: [{ AttributeName: "GSI2PK", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      }]
    }],
  port: 8000,
};
