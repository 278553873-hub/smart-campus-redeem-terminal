import { randomBytes } from 'node:crypto';

const path = '/api/school-pc-demo-scan';
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
    const requestPath = request.url?.split('?', 1)[0];
    if (requestPath !== path && requestPath !== `${path}/status` && requestPath !== `${path}/confirm`) return false;

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
      const session = { scanToken, pollToken, expiresAt: now + lifetimeSeconds * 1_000, confirmed: false };
      byScanToken.set(scanToken, session);
      byPollToken.set(pollToken, session);
      respond(response, 201, { scanToken, pollToken, lifetimeSeconds, networkUrl: getNetworkUrl() });
      return true;
    }

    const confirming = requestPath === `${path}/confirm` && request.method === 'POST';
    const checking = requestPath === `${path}/status` && request.method === 'GET';
    const cancelling = requestPath === path && request.method === 'DELETE';
    if (!confirming && !checking && !cancelling) {
      respond(response, 405);
      return true;
    }

    const token = tokenPattern.exec(request.headers.authorization || '')?.[1];
    const session = (confirming ? byScanToken : byPollToken).get(token);
    if (!session || session.expiresAt <= Date.now()) {
      if (session) remove(session);
      respond(response, 410);
      return true;
    }

    if (confirming) {
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
