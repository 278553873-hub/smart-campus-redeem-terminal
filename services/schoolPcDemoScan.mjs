import { randomBytes } from 'node:crypto';

const path = '/api/school-pc-demo-scan';
const loginPath = `${path}/login`;
const confirmPath = `${path}/confirm`;
const statusPath = `${path}/status`;
const lifetimeSeconds = 300;
const tokenPattern = /^Bearer ([A-Za-z0-9_-]{22})$/;

function respond(response, status, body) {
  response.setHeader('Cache-Control', 'no-store');
  if (body !== undefined) response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.writeHead(status);
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

export function createSchoolPcDemoScanHandler(getNetworkUrl = () => undefined) {
  const byPollToken = new Map();
  const byScanToken = new Map();

  function remove(session) {
    byPollToken.delete(session.pollToken);
    byScanToken.delete(session.scanToken);
  }

  return (request, response) => {
    const [requestPath, query] = (request.url ?? '').split('?', 2);
    if (requestPath !== path && requestPath !== statusPath && requestPath !== confirmPath && requestPath !== loginPath) return false;

    if (requestPath === path && request.method === 'POST') {
      const now = Date.now();
      for (const session of byPollToken.values()) {
        if (session.expiresAt <= now) remove(session);
      }
      if (byPollToken.size >= 512) {
        respond(response, 429);
        return true;
      }

      const scanToken = randomBytes(16).toString('base64url');
      const pollToken = randomBytes(16).toString('base64url');
      const mode = new URLSearchParams(query).get('mode') === 'login' ? 'login' : 'verify';
      const session = { scanToken, pollToken, mode, expiresAt: now + lifetimeSeconds * 1_000, confirmed: false };
      byScanToken.set(scanToken, session);
      byPollToken.set(pollToken, session);
      respond(response, 201, { scanToken, pollToken, lifetimeSeconds, networkUrl: getNetworkUrl() });
      return true;
    }

    const completing = (requestPath === confirmPath || requestPath === loginPath) && request.method === 'POST';
    const checking = requestPath === statusPath && request.method === 'GET';
    const cancelling = requestPath === path && request.method === 'DELETE';
    if (!completing && !checking && !cancelling) {
      respond(response, 405);
      return true;
    }

    const token = tokenPattern.exec(request.headers.authorization || '')?.[1];
    const session = (completing ? byScanToken : byPollToken).get(token);
    if (!session || session.expiresAt <= Date.now()) {
      if (session) remove(session);
      respond(response, 410);
      return true;
    }

    if (completing) {
      const expectedPath = session.mode === 'login' ? loginPath : confirmPath;
      if (requestPath !== expectedPath) {
        respond(response, 403);
        return true;
      }
      session.confirmed = true;
      byScanToken.delete(token);
      respond(response, 204);
    } else if (cancelling) {
      remove(session);
      respond(response, 204);
    } else {
      if (session.confirmed) remove(session);
      respond(response, 200, { confirmed: session.confirmed });
    }
    return true;
  };
}
