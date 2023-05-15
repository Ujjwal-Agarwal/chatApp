import { fetchRedis } from "./redis"

export const getConnectionsbyId = async (userId: string)=>{
    const connIds = await fetchRedis('smembers',`user:${userId}:connections`) as string[]

    const connections = await Promise.all(
        connIds.map(async(connectionId)=>{
            const connection = await fetchRedis('get',`user:${connectionId}`) as string
            const parsedConnection = JSON.parse(connection)
            return parsedConnection
        })
    )

    return connections
}