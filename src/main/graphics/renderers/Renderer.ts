import { Session } from '../../core/Session';

export interface Renderer {
  render: (session: Session) => Promise<void>;
}
