

export class HttpCustomErrors extends Error {

  constructor(
    public readonly statusCode: number,
    public readonly message: string,
  ) {
    super(message);
  }


  static badRequest(message: string) {
    return new HttpCustomErrors(400, message);
  }

  static notFound(message: string) {
    return new HttpCustomErrors(404, message);
  }

  static unauthorized(message: string) {
    return new HttpCustomErrors(401, message);
  }

  static forbidden(message: string) {
    return new HttpCustomErrors(403, message);
  }

  static internalServerError(message: string) {
    return new HttpCustomErrors(500, message);
  }

}