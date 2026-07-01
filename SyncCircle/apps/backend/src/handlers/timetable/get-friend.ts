import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ERROR_CODES } from '@synccircle/shared';
import { success, error } from '../../utils/response';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const USER_TIMETABLES_TABLE = process.env.USER_TIMETABLES_TABLE!;
const FRIENDSHIPS_TABLE = process.env.FRIENDSHIPS_TABLE!;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // 1. Extract userId from Cognito JWT claims
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return error(401, ERROR_CODES.UNAUTHORIZED, 'Missing authentication');
    }

    // 2. Extract friendId from path parameters
    const friendId = event.pathParameters?.friendId;

    // 3. Validate friendId exists
    if (!friendId) {
      return error(400, ERROR_CODES.VALIDATION_ERROR, 'Missing friendId path parameter');
    }

    // 4. Check if there's an active friendship between userId and friendId
    const [userIdLow, userIdHigh] = [userId, friendId].sort();

    const friendshipResult = await docClient.send(
      new QueryCommand({
        TableName: FRIENDSHIPS_TABLE,
        IndexName: 'userIdLow-index',
        KeyConditionExpression: 'userIdLow = :userIdLow',
        FilterExpression: 'userIdHigh = :userIdHigh AND #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':userIdLow': userIdLow,
          ':userIdHigh': userIdHigh,
          ':status': 'active',
        },
      })
    );

    // 5. If no active friendship, return 403
    if (!friendshipResult.Items || friendshipResult.Items.length === 0) {
      return error(403, ERROR_CODES.FORBIDDEN, 'Not friends with this user');
    }

    // 6. Fetch the friend's timetable
    const timetableResult = await docClient.send(
      new GetCommand({
        TableName: USER_TIMETABLES_TABLE,
        Key: { userId: friendId },
      })
    );

    // 7. If no timetable found, return empty
    if (!timetableResult.Item) {
      return success({ classes: [], updatedAt: null });
    }

    // 8. Return the friend's timetable
    return success({
      classes: timetableResult.Item.classes,
      updatedAt: timetableResult.Item.updatedAt,
    });
  } catch (err) {
    console.error('Error fetching friend timetable:', err);
    return error(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch friend timetable');
  }
}
