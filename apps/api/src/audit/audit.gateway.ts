// apps/api/src/audit/audit.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: 'http://localhost:4200', credentials: true },
  namespace: '/audit',
})
export class AuditGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        console.log('❌ No token');
        client.disconnect();
        return;
      }

      // ✅ now uses same secret via JwtModule
      const payload = this.jwtService.verify(token);
      console.log('✅ WS user connected:', payload);

      if (payload.role !== 'ADMIN' && payload.role !== 'OWNER') {
        client.disconnect();
        return;
      }

      client.data.user = payload;
    } catch (e) {
      console.error('❌ WS auth failed:', e.message);
      client.disconnect();
    }
  }

  broadcastNewAudit(entry: any) {
    this.server.emit('audit:new', entry);
  }
}
