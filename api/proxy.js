export default async function handler(req, res) {
  const targetUrl = 'https://api.1inch.dev' + req.url.replace(/^\/api/, '');

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'api.1inch.dev',
    },
    body: ['POST', 'PUT', 'PATCH'].includes(req.method)
      ? JSON.stringify(req.body)
      : undefined,
  });

  const data = await response.text();

  res.status(response.status).send(data);
}
