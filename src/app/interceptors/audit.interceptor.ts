import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { REQUEST_USER_KEY } from "@src/app/constants/keys.constants";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { Request } from "express";
import { Observable } from "rxjs";

/**
 * ActiveUserInserter automatically adds audit trail fields to request bodies.
 *
 * Features:
 * - Adds `createdBy` field for POST requests (create operations)
 * - Adds `updatedBy` field for PUT/PATCH requests (update operations)
 * - Supports both single objects and bulk operations (arrays)
 * - Only processes requests that have a valid user context from authentication
 * - Works with DTO validation by modifying the request body after authentication but before validation
 *
 * Usage:
 * This interceptor is globally registered and will automatically process all authenticated requests.
 * Ensure your DTOs extend BaseCreateDTO (for createdBy) or BaseUpdateDTO (for updatedBy).
 */
@Injectable()
export class ActiveUserInserter implements NestInterceptor {
  constructor() {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // Get the current user from the request (set by AccessTokenGuard)
    const currentUser = request[REQUEST_USER_KEY] as IActiveUser;

    // Only process POST, PUT, PATCH requests that have a body and authenticated user
    if (
      ["POST", "PUT", "PATCH"].includes(method) &&
      request.body &&
      currentUser?.id
    ) {
      const userId = currentUser.id;

      try {
        // For POST requests (create operations)
        if (method === "POST") {
          this.addAuditField(request.body, "createdBy", userId);
        }

        // For PUT/PATCH requests (update operations)
        if (["PUT", "PATCH"].includes(method)) {
          this.addAuditField(request.body, "updatedBy", userId);
        }
      } catch (error) {
        // Log error but don't break the request flow
        console.error("ActiveUserInserter: Error adding audit fields:", error);
      }
    }

    return next.handle();
  }

  /**
   * Adds audit field to request body, handling both single objects and arrays
   */
  private addAuditField(body: any, fieldName: string, userId: number): void {
    if (typeof body === "object" && body !== null) {
      if (Array.isArray(body)) {
        // Handle bulk operations
        body.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            item[fieldName] = userId;
          }
        });
      } else {
        // Handle single object
        body[fieldName] = userId;
      }
    }
  }
}
