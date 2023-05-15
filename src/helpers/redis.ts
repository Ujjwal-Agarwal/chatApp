const upstashRedisRESTUrl = process.env.UPSTASH_REDIS_REST_URL
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN


type Command = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(
    command: Command,
    ... args: (string| number)[]
){
    const commandURL = `${upstashRedisRESTUrl}/${command}/${args.join('/')}`

    const response = await fetch(commandURL,{
        headers:{
            Authorization: `Bearer ${authToken}`,
        },
        cache:'no-store',
        // Always deliver fresh data and don't cache it
    })

    if(!response.ok){
        throw new Error(`Error executing Redis command: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
}
