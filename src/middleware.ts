import { getToken } from 'next-auth/jwt'
import {withAuth} from 'next-auth/middleware'
import { NextResponse } from 'next/server'
export default withAuth(
    async function middleware(req){
        const pathname = req.nextUrl.pathname

        // Manage route protecttion

        const isAuth = await getToken({req})
        const isLoginRoute = pathname.startsWith('/login')

        const sensitiveRoutes = ['/dash']
        const isAccessingSensitiveRoute = sensitiveRoutes.some((route)=>pathname.startsWith(route)) // some is like map but breaks if true is returned

        if(isLoginRoute){
            if(isAuth){
                return NextResponse.redirect(new URL('/dash',req.url)) // Go to dashboard when logged in 
            }
            return NextResponse.next() // Just go to the login path
        }

        if(!isAuth && isAccessingSensitiveRoute){
            return NextResponse.redirect(new URL('/login',req.url))
        }
        if(pathname == '/'){
            return NextResponse.redirect(new URL('/dash',req.url))
        }
    },{
        callbacks:{
            async authorized(){
                return true;
            }
        }
    }
)

export const config = {
    matchter:['/','/login','/dash/:path*']
}