import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common'
import { WebhooksService } from './webhooks.service'
import { EmailWebhookDto } from './dto/email-webhook.dto'
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto'
import { WebhookSecretGuard } from './guards/webhook-secret.guard'

@Controller('webhooks')
@UseGuards(WebhookSecretGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('email')
  @HttpCode(201)
  receiveEmail(@Body() dto: EmailWebhookDto) {
    return this.webhooksService.receiveEmail(dto)
  }

  @Post('whatsapp')
  @HttpCode(201)
  receiveWhatsApp(@Body() dto: WhatsAppWebhookDto) {
    return this.webhooksService.receiveWhatsApp(dto)
  }
}
