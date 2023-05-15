import {z} from 'zod'

// We can pass an object to the z function which will try to parse the contents
// We can use the parsing to validate strings
export const emailValidator = z.object({
    email: z.string().email()
})
