import { Injectable } from '@nestjs/common'
import { Subject, Observable } from 'rxjs'

export interface TicketEvent {
  type: 'ticket.created' | 'ticket.updated'
  ticketId: string
  data?: Record<string, unknown>
}

@Injectable()
export class TicketEventsService {
  private readonly subject = new Subject<TicketEvent>()

  get stream(): Observable<TicketEvent> {
    return this.subject.asObservable()
  }

  emit(event: TicketEvent): void {
    this.subject.next(event)
  }
}
