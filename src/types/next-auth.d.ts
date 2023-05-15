// Defining custom nextAuth types

import type {Session, User} from 'next-auth'
import type {JWT} from 'next-auth/jwt'

// Type are alternative to interface
type UserID = string


// Whenever we are using next-auth/jwt, we have an interface JWT where the following types are used
declare module 'next-auth/jwt' {
    interface JWT {
        id: UserID
    }
}


// Whenever we are using next-auth, we have interface Session where user conforms to User(declared in db.d.ts) and id conforms to userID declared above
declare module 'next-auth'{
    interface Session{
        user: User &{
            id: UserID
        }
    }
}