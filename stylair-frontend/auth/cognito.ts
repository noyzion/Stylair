import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const poolData = {
  UserPoolId: 'us-east-1_gpwCIrUIJ',
  ClientId: '5k9b1au7de4n8ps9gfjq8f7ibb',
};

export const userPool = new CognitoUserPool(poolData);
