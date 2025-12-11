import Router from '@/accounts/router'

export default async function main(event: any, context: any) {
  const response = await Router(event, context)

  return response
}
