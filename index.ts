import type { Elysia } from 'elysia'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'

export function handle(app: Elysia<any>) {
  return async (event: APIGatewayProxyEventV2, context: Context): Promise<any> => {
    const request = toRequest(event)
    const response = await app.fetch(request)

    return toResult(response)
  }
}

function toRequest(event: APIGatewayProxyEventV2): Request {
  const { requestContext, rawPath, rawQueryString, headers, body, isBase64Encoded } = {
    headers: {},
    body: '',
    isBase64Encoded: false,
    rawPath: '/',
    rawQueryString: '',
    requestContext: {
      http: {
        method: 'GET',
      },
    },
    ...event,
  }

  const host = headers['host'] || 'localhost'
  const protocol = headers['x-forwarded-proto'] || 'https'
  const url = `${protocol}://${host}${rawPath}${rawQueryString ? `?${rawQueryString}` : ''}`
  const method = requestContext.http.method

  const requestBody = body ? (isBase64Encoded ? Buffer.from(body, 'base64') : body) : undefined

  return new Request(url, {
    method,
    headers: new Headers(headers as Record<string, string>),
    body: method !== 'GET' && method !== 'HEAD' ? requestBody : undefined,
  })
}

async function toResult(response: Response): Promise<APIGatewayProxyResultV2> {
  const headers: Record<string, string> = {}

  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  const contentType = headers['content-type'] || ''
  const isText = contentType.includes('text') || contentType.includes('json')

  let body: string
  let isBase64Encoded = false

  if (isText) {
    body = await response.text()
  } else {
    const buffer = await response.arrayBuffer()

    body = Buffer.from(buffer).toString('base64')
    isBase64Encoded = true
  }

  return {
    statusCode: response.status,
    headers,
    body,
    isBase64Encoded,
  }
}
