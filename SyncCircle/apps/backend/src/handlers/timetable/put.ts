import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ERROR_CODES } from '@synccircle/shared';
import { success, error } from '../../utils/response';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USER_TIMETABLES_TABLE!;

interface TimetableClass {
  id: string;
  title: string;
  moduleCode: string;
  location: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  color: string;
  source: string;
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateClass(item: unknown, index: number): string | null {
  if (!item || typeof item !== 'object') {
    return `classes[${index}] must be an object`;
  }

  const cls = item as Record<string, unknown>;

  const requiredStringFields = ['id', 'title', 'moduleCode', 'location', 'color', 'source'];
  for (const field of requiredStringFields) {
    if (typeof cls[field] !== 'string' || (cls[field] as string).trim().length === 0) {
      return `classes[${index}].${field} is required and must be a non-empty string`;
    }
  }

  if (typeof cls.dayOfWeek !== 'number' || !Number.isInteger(cls.dayOfWeek) || cls.dayOfWeek < 0 || cls.dayOfWeek > 4) {
    return `classes[${index}].dayOfWeek must be an integer between 0 and 4`;
  }

  if (typeof cls.startTime !== 'string' || !TIME_REGEX.test(cls.startTime)) {
    return `classes[${index}].startTime must be in HH:mm format`;
  }

  if (typeof cls.endTime !== 'string' || !TIME_REGEX.test(cls.endTime)) {
    return `classes[${index}].endTime must be in HH:mm format`;
  }

  return null;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return error(401, ERROR_CODES.VALIDATION_ERROR, 'Unauthorized: missing user identity');
    }

    if (!event.body) {
      return error(400, ERROR_CODES.VALIDATION_ERROR, 'Request body is required');
    }

    let body: { classes?: unknown };
    try {
      body = JSON.parse(event.body);
    } catch {
      return error(400, ERROR_CODES.VALIDATION_ERROR, 'Invalid JSON in request body');
    }

    const { classes } = body;

    if (!Array.isArray(classes)) {
      return error(400, ERROR_CODES.VALIDATION_ERROR, 'classes must be an array', 'classes');
    }

    if (classes.length > 50) {
      return error(400, ERROR_CODES.VALIDATION_ERROR, 'classes array must not exceed 50 items', 'classes');
    }

    for (let i = 0; i < classes.length; i++) {
      const validationError = validateClass(classes[i], i);
      if (validationError) {
        return error(400, ERROR_CODES.VALIDATION_ERROR, validationError, 'classes');
      }
    }

    const validatedClasses: TimetableClass[] = classes as TimetableClass[];
    const updatedAt = new Date().toISOString();

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          userId,
          classes: validatedClasses,
          updatedAt,
        },
      })
    );

    return success({ message: 'Timetable saved', classCount: validatedClasses.length });
  } catch (err) {
    console.error('Error saving timetable:', err);
    return error(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to save timetable');
  }
}
