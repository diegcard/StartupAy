import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class WebhookSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const secret = request.headers['x-webhook-secret']
    if (secret !== process.env.WEBHOOK_SECRET) {
      throw new UnauthorizedException('Webhook secret inválido')
    }
    return true
  }
}
