import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { HttpStatusCode } from "@/server/constants/HttpStatusCode";
import { ApiResponse } from "@/server/types/ApiResponse";

export abstract class BaseController {
  protected async getUserId(request: NextRequest): Promise<string> {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    return token?.sub || "";
  }

  protected success<T>(
    data: T,
    statusCode: HttpStatusCode = HttpStatusCode.OK
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: statusCode }
    );
  }

  protected created<T>(data: T): NextResponse<ApiResponse<T>> {
    return this.success(data, HttpStatusCode.CREATED);
  }

  protected noContent(): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
      {
        success: true,
        data: null,
      },
      { status: HttpStatusCode.NO_CONTENT }
    );
  }

  protected error(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    code?: string,
    details?: unknown
  ): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code,
          details,
        },
      },
      { status: statusCode }
    );
  }

  protected badRequest(
    message: string,
    details?: unknown
  ): NextResponse<ApiResponse<null>> {
    return this.error(
      message,
      HttpStatusCode.BAD_REQUEST,
      "BAD_REQUEST",
      details
    );
  }

  protected unauthorized(
    message: string = "Unauthorized"
  ): NextResponse<ApiResponse<null>> {
    return this.error(message, HttpStatusCode.UNAUTHORIZED, "UNAUTHORIZED");
  }

  protected forbidden(
    message: string = "Forbidden"
  ): NextResponse<ApiResponse<null>> {
    return this.error(message, HttpStatusCode.FORBIDDEN, "FORBIDDEN");
  }

  protected notFound(
    message: string = "Resource not found"
  ): NextResponse<ApiResponse<null>> {
    return this.error(message, HttpStatusCode.NOT_FOUND, "NOT_FOUND");
  }

  protected conflict(
    message: string,
    details?: unknown
  ): NextResponse<ApiResponse<null>> {
    return this.error(message, HttpStatusCode.CONFLICT, "CONFLICT", details);
  }

  protected validationError(
    message: string,
    details?: unknown
  ): NextResponse<ApiResponse<null>> {
    return this.error(
      message,
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      "VALIDATION_ERROR",
      details
    );
  }
}
